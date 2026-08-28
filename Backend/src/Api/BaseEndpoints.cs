using Microsoft.EntityFrameworkCore;

namespace Drones.Api
{
    // bazele: liste, creare, redenumire, status, decomisionare, adaugare drone
    public static class BaseEndpoints
    {
        public static void MapBaseEndpoints(this WebApplication app)
        {
        var bases = app.MapGroup("/api/bases");

        bases.MapGet("", (DroneContext context) =>
        {
            var bases = context.Bases
                .Include(b => b.Drones)
                .Include(b => b.ParkedDrones)
                .ToList();

            return Results.Ok(bases);
        });
        bases.MapGet("/civilian", (DroneContext context) =>
        {
            var civilianBases = context.Bases
                .Include(b => b.Drones)
                .Include(b => b.ParkedDrones)
                .OfType<CivilianBase>()
                .ToList();

            return Results.Ok(civilianBases);
        });
        bases.MapGet("/military", (DroneContext context) =>
        {
            var militaryBases = context.Bases
                .Include(b => b.Drones)
                .Include(b => b.ParkedDrones)
                .OfType<MilitaryBase>()
                .ToList();

            return Results.Ok(militaryBases);
        });
        bases.MapGet("/{id}", (int id, DroneContext context) =>
        {
            var droneBase = context.Bases
                .Include(b => b.Drones)
                .Include(b => b.ParkedDrones)
                .FirstOrDefault(b => b.Id == id);

            if (droneBase == null)
            {
                return Results.NotFound($"Baza cu ID-ul {id} nu a fost găsită.");
            }

            return Results.Ok(droneBase);
        });
        bases.MapPost("/add", (NewBaseRequest request, DroneContext context) =>
        {
            DroneBase newBase = request.Category.ToLower() switch
            {
                "civilian" => new CivilianBase(),
                "military" => new MilitaryBase(),
                _ => throw new ArgumentException("Unknown Base Category!"),
            };

            newBase.Name = request.Name;
            newBase.MaxDroneCapacity = request.MaxDroneCapacity;
            newBase.MaxParkingCapacity = request.MaxParkingCapacity;
            newBase.CurrentLocation.SetLocation(request.Latitude, request.Longitude, 0f);

            context.Bases.Add(newBase);
            context.SaveChanges();

            return Results.Ok(newBase);
        });
        bases.MapPost("/{id}/drones", (int id, string type, string? name, DroneContext context) =>
        {
            var droneBase = context.Bases
                .Include(b => b.Drones)
                .Include(b => b.ParkedDrones)
                .FirstOrDefault(b => b.Id == id);

            if (droneBase == null)
            {
                return Results.NotFound($"Baza cu ID-ul {id} nu a fost găsită.");
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
            var droneBase = context.Bases
                .Include(b => b.Drones)
                .Include(b => b.ParkedDrones)
                .FirstOrDefault(b => b.Id == id);

            if (droneBase == null)
            {
                return Results.NotFound($"Baza cu ID-ul {id} nu a fost găsită.");
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
            var droneBase = context.Bases
                .Include(b => b.Drones)
                .Include(b => b.ParkedDrones)
                .FirstOrDefault(b => b.Id == id);

            if (droneBase == null)
            {
                return Results.NotFound($"Baza cu ID-ul {id} nu a fost găsită.");
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
            var droneBase = context.Bases
                .Include(b => b.Drones)
                .Include(b => b.ParkedDrones)
                .FirstOrDefault(b => b.Id == id);

            if (droneBase == null)
            {
                return Results.NotFound($"Baza cu ID-ul {id} nu a fost găsită.");
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
