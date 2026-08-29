using Microsoft.EntityFrameworkCore;

namespace Drones.Api
{
    public static class BaseEndpoints
    {
        const int DefaultDroneCapacity = 5;

        public static void MapBaseEndpoints(this WebApplication app)
        {
            var bases = app.MapGroup("/api/bases");

            bases.MapGet("", (DroneContext context) =>
            {
                var bases = context.Bases.WithDrones()
                    .ToList();

                return Results.Ok(bases);
            });
            bases.MapGet("/civilian", (DroneContext context) =>
            {
                var civilianBases = context.Bases.WithDrones()
                    .OfType<CivilianBase>()
                    .ToList();

                return Results.Ok(civilianBases);
            });
            bases.MapGet("/military", (DroneContext context) =>
            {
                var militaryBases = context.Bases.WithDrones()
                    .OfType<MilitaryBase>()
                    .ToList();

                return Results.Ok(militaryBases);
            });
            bases.MapGet("/{id}", (int id, DroneContext context) =>
            {
                if (!context.Bases.WithDrones()
                        .TryFindBase(id, out var droneBase, out var notFound))
                {
                    return notFound;
                }

                return Results.Ok(droneBase);
            });
            bases.MapPost("/add", (NewBaseRequest request, DroneContext context) =>
            {
                DroneBase? newBase = request.Category.ToLower() switch
                {
                    "civilian" => new CivilianBase(),
                    "military" => new MilitaryBase(),
                    _ => null,
                };

                if (newBase == null)
                {
                    return Results.BadRequest(
                        $"Categoria {request.Category} nu există. Valori: Civilian, Military.");
                }

                if (string.IsNullOrWhiteSpace(request.Name))
                {
                    return Results.BadRequest("Baza are nevoie de un nume.");
                }

                if (request.Latitude < -90 || request.Latitude > 90
                    || request.Longitude < -180 || request.Longitude > 180)
                {
                    return Results.BadRequest("Coordonatele sunt în afara intervalului.");
                }

                if (request.MaxDroneCapacity < 1 || request.MaxParkingCapacity < 1)
                {
                    return Results.BadRequest("Capacitățile trebuie să fie cel puțin 1.");
                }

                newBase.Name = request.Name.Trim();

                newBase.MaxDroneCapacity = request.MaxDroneCapacity ?? DefaultDroneCapacity;
                newBase.MaxParkingCapacity =
                    request.MaxParkingCapacity ?? newBase.MaxDroneCapacity + 2;

                newBase.CurrentLocation.SetLocation(request.Latitude, request.Longitude, 0f);

                context.Bases.Add(newBase);
                context.SaveChanges();

                return Results.Ok(newBase);
            });
            bases.MapPost("/{id}/drones", (int id, string type, string? name, DroneContext context) =>
            {
                if (!context.Bases.WithDrones()
                        .TryFindBase(id, out var droneBase, out var notFound))
                {
                    return notFound;
                }

                if (droneBase.IsFull)
                {
                    return Results.BadRequest(
                        $"Baza {droneBase.Name} e plină ({droneBase.DroneCount}/{droneBase.MaxDroneCapacity}).");
                }

                if (droneBase.IsParkingFull)
                {
                    return Results.BadRequest(
                        $"Parcarea bazei {droneBase.Name} e plină ({droneBase.ParkedCount}/{droneBase.MaxParkingCapacity}).");
                }

                var model = context.DroneModels
                    .FirstOrDefault(m => m.Name.ToLower() == type.ToLower());

                if (model == null)
                {
                    return Results.NotFound($"Modelul {type} nu există în catalog.");
                }

                if (model.Category != droneBase.Category)
                {
                    return Results.BadRequest(
                        $"O dronă {model.Category} nu poate fi asignată unei baze {droneBase.Category}.");
                }

                var newDrone = DroneFactory.FromModel(model);

                newDrone.CurrentLocation.SetLocation(
                    droneBase.CurrentLocation.Latitude,
                    droneBase.CurrentLocation.Longitude,
                    0f);

                newDrone.BatteryLevel = 100f;
                newDrone.Name = name?.Trim() ?? "";

                droneBase.Drones.Add(newDrone);
                droneBase.ParkedDrones.Add(newDrone);
                context.SaveChanges();

                return Results.Ok(newDrone);
            });
            bases.MapPut("/{id}/status", (int id, string status, DroneContext context) =>
            {
                if (!context.Bases.WithDrones()
                        .TryFindBase(id, out var droneBase, out var notFound))
                {
                    return notFound;
                }

                if (status.ToLower() != "online" && status.ToLower() != "offline")
                {
                    return Results.BadRequest("Status invalid. Acceptate: online, offline.");
                }

                droneBase.Status = status.ToLower();
                context.SaveChanges();

                return Results.Ok(droneBase);
            });
            bases.MapPut("/{id}/name", (int id, string name, DroneContext context) =>
            {
                if (!context.Bases.WithDrones()
                        .TryFindBase(id, out var droneBase, out var notFound))
                {
                    return notFound;
                }

                if (string.IsNullOrWhiteSpace(name))
                {
                    return Results.BadRequest("Numele nu poate fi gol.");
                }

                droneBase.Name = name.Trim();
                context.SaveChanges();

                return Results.Ok(droneBase);
            });
            bases.MapDelete("/{id}", (int id, DroneContext context) =>
            {
                if (!context.Bases.WithDrones()
                        .TryFindBase(id, out var droneBase, out var notFound))
                {
                    return notFound;
                }

                var destroyed = droneBase.ParkedDrones
                    .Where(d => d.DroneBaseId == droneBase.Id)
                    .ToList();

                var released = droneBase.ParkedDrones
                    .Where(d => d.DroneBaseId != droneBase.Id)
                    .ToList();

                foreach (var visitor in released)
                {
                    visitor.ParkedAtBaseId = null;
                }

                var destroyedIds = destroyed.Select(d => d.Id).ToList();
                var releasedIds = released.Select(d => d.Id).ToList();

                context.Drones.RemoveRange(destroyed);
                context.Bases.Remove(droneBase);
                context.SaveChanges();

                return Results.Ok(new
                {
                    Base = droneBase,
                    DestroyedDroneIds = destroyedIds,
                    ReleasedDroneIds = releasedIds,
                });
            });
            bases.MapDelete("", (DroneContext context) =>
            {
                var deleted = context.Bases.ExecuteDelete();
                return Results.Ok(new { deleted });
            });

            using (var scope = app.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<DroneContext>();
                db.Database.Migrate();
            }
        }
    }
}
