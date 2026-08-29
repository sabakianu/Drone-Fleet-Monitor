using Microsoft.EntityFrameworkCore;

namespace Drones.Api
{
    // dronele: liste, creare, redenumire, status, apartenenta, stergere
    public static class DroneEndpoints
    {
        public static void MapDroneEndpoints(this WebApplication app)
        {
            var drones = app.MapGroup("/api/drones");

            drones.MapGet("", (DroneContext context) =>
            {
                var drones = context.Drones
                    .Include(d => d.HomeBase)
                    .ToList();

                return Results.Ok(drones);
            });
            drones.MapGet("/civilian", (DroneContext context) =>
            {
                var civilianDrones = context.Drones
                    .AsEnumerable()
                    .OfType<CivilianDrone>()
                    .ToList();

                return Results.Ok(civilianDrones);
            });
            drones.MapGet("/military", (DroneContext context) =>
            {
                var militaryDrones = context.Drones
                    .AsEnumerable()
                    .OfType<MilitaryDrone>()
                    .ToList();

                return Results.Ok(militaryDrones);
            });
            drones.MapGet("/{id}", (int id, DroneContext context) =>
            {
                var drone = context.Drones
                    .Include(d => d.HomeBase)
                    .FirstOrDefault(d => d.Id == id);

                if (drone != null)
                {
                    return Results.Ok(drone);

                }

                return Results.NotFound($"Drona cu ID-ul {id} nu a fost găsită.");
            });
            drones.MapPost("/add", (string type, DroneContext context) =>
            {
                var model = context.DroneModels
                    .FirstOrDefault(m => m.Name.ToLower() == type.ToLower());

                if (model == null)
                {
                    return Results.NotFound($"Modelul {type} nu există în catalog.");
                }

                var newDrone = DroneFactory.FromModel(model);

                context.Drones.Add(newDrone);
                context.SaveChanges();

                return Results.Ok(newDrone);
            });
            drones.MapPut("/{id}/status", (
                int id,
                string status,
                DroneContext context,
                MoveOrders orders) =>
            {
                var drone = context.Drones
                    .Include(d => d.HomeBase)
                    .FirstOrDefault(d => d.Id == id);

                if (drone == null)
                {
                    return Results.NotFound($"Drona cu ID-ul {id} nu a fost găsită.");
                }

                if (drone.Status == "crashed")
                {
                    return Results.BadRequest("Drona e avariată și nu mai poate fi pornită.");
                }

                if (status.ToLower() != "online" && status.ToLower() != "offline")
                {
                    return Results.BadRequest("Status invalid. Acceptate: online, offline.");
                }

                if (status.ToLower() == "online"
                    && drone.BatteryLevel <= 0
                    && drone.ParkedAtBaseId == null)
                {
                    return Results.BadRequest(
                        "Drona nu are baterie și nu e într-o bază.");
                }

                if (status.ToLower() == "offline" && drone.ParkedAtBaseId == null)
                {
                    orders.Remove(id);
                    Move.Fall(drone, context.Bases.Include(b => b.ParkedDrones).ToList());
                }
                else
                {
                    drone.Status = status.ToLower();
                }

                context.SaveChanges();

                return Results.Ok(drone);
            });
            drones.MapPut("/{id}/name", (int id, string name, DroneContext context) =>
            {
                var drone = context.Drones
                    .Include(d => d.HomeBase)
                    .FirstOrDefault(d => d.Id == id);

                if (drone == null)
                {
                    return Results.NotFound($"Drona cu ID-ul {id} nu a fost găsită.");
                }

                if (string.IsNullOrWhiteSpace(name))
                {
                    return Results.BadRequest("Numele nu poate fi gol.");
                }

                drone.Name = name.Trim();
                context.SaveChanges();

                return Results.Ok(drone);
            });
            drones.MapPut("/{id}/move", (
                int id,
                float latitude,
                float longitude,
                float altitude,
                float horizontalSpeed,
                float verticalSpeed,
                DroneContext context,
                MoveOrders orders,
                int? parkAtBaseId = null) =>
            {
                var drone = context.Drones.FirstOrDefault(d => d.Id == id);

                if (drone == null)
                {
                    return Results.NotFound($"Drona cu ID-ul {id} nu a fost găsită.");
                }

                if (drone.Status == "crashed")
                {
                    return Results.BadRequest("Drona e avariată și nu mai poate zbura.");
                }

                if (drone.BatteryLevel <= 0)
                {
                    return Results.BadRequest("Drona nu are baterie.");
                }

                if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180)
                {
                    return Results.BadRequest("Coordonatele sunt în afara intervalului.");
                }

                // 0 e permis: zboara la minim si coboara abia la destinatie
                if (altitude < 0 || altitude > drone.MaxAltitude)
                {
                    return Results.BadRequest(
                        $"Altitudinea trebuie să fie între 0 și {drone.MaxAltitude} m.");
                }

                if (horizontalSpeed <= 0 || horizontalSpeed > drone.MaxHorizontalSpeed)
                {
                    return Results.BadRequest(
                        $"Viteza orizontală trebuie să fie între 0 și {drone.MaxHorizontalSpeed} km/h.");
                }

                if (verticalSpeed <= 0 || verticalSpeed > drone.MaxVerticalSpeed)
                {
                    return Results.BadRequest(
                        $"Viteza verticală trebuie să fie între 0 și {drone.MaxVerticalSpeed} m/s.");
                }

                // decoleaza: se porneste singura, iese din parcare si primeste
                // vitezele alese
                drone.Status = "online";
                drone.ParkedAtBaseId = null;
                drone.CurrentSpeed.SetSpeed(horizontalSpeed, verticalSpeed);
                context.SaveChanges();

                orders.Set(id, new MovePlan(
                    latitude, longitude, altitude,
                    horizontalSpeed, verticalSpeed, parkAtBaseId));

                return Results.Ok(drone);
            });

            drones.MapPut("/{id}/tow", (int id, DroneContext context, MoveOrders orders) =>
            {
                var drone = context.Drones
                    .Include(d => d.HomeBase)
                    .FirstOrDefault(d => d.Id == id);

                if (drone == null)
                {
                    return Results.NotFound($"Drona cu ID-ul {id} nu a fost găsită.");
                }

                if (drone.HomeBase == null)
                {
                    return Results.BadRequest("Drona nu aparține niciunei baze.");
                }

                if (drone.Status == "online")
                {
                    return Results.BadRequest("Oprește drona înainte de a o remorca.");
                }

                var homeBase = context.Bases
                    .Include(b => b.ParkedDrones)
                    .First(b => b.Id == drone.HomeBase.Id);

                if (homeBase.IsParkingFull && drone.ParkedAtBaseId != homeBase.Id)
                {
                    return Results.BadRequest(
                        $"Parcarea bazei {homeBase.Name} e plină "
                        + $"({homeBase.ParkedCount}/{homeBase.MaxParkingCapacity}).");
                }

                orders.Remove(id);

                drone.CurrentLocation.SetLocation(
                    homeBase.CurrentLocation.Latitude,
                    homeBase.CurrentLocation.Longitude,
                    0f);
                drone.CurrentSpeed.SetSpeed(0f, 0f);
                drone.ParkedAtBaseId = homeBase.Id;

                if (drone.Status != "crashed") drone.Status = "offline";

                context.SaveChanges();

                return Results.Ok(drone);
            });

            drones.MapDelete("/{id}/move", (int id, DroneContext context, MoveOrders orders) =>
            {
                var drone = context.Drones.FirstOrDefault(d => d.Id == id);

                if (drone == null)
                {
                    return Results.NotFound($"Drona cu ID-ul {id} nu a fost găsită.");
                }

                orders.Remove(id);
                drone.CurrentSpeed.SetSpeed(0f, 0f);
                context.SaveChanges();

                return Results.Ok(drone);
            });

            drones.MapPut("/{id}/base", (int id, int baseId, DroneContext context) =>
            {
                var drone = context.Drones.FirstOrDefault(d => d.Id == id);

                if (drone == null)
                {
                    return Results.NotFound($"Drona cu ID-ul {id} nu a fost găsită.");
                }

                var target = context.Bases
                    .Include(b => b.Drones)
                    .Include(b => b.ParkedDrones)
                    .FirstOrDefault(b => b.Id == baseId);

                if (target == null)
                {
                    return Results.NotFound($"Baza cu ID-ul {baseId} nu a fost găsită.");
                }

                if (drone.DroneBaseId == target.Id)
                {
                    return Results.BadRequest($"Drona aparține deja bazei {target.Name}.");
                }

                if (drone.Category != target.Category)
                {
                    return Results.BadRequest(
                        $"O dronă {drone.Category} nu poate fi asignată unei baze {target.Category}.");
                }

                if (target.IsFull)
                {
                    return Results.BadRequest(
                        $"Baza {target.Name} e plină ({target.DroneCount}/{target.MaxDroneCapacity}).");
                }

                drone.DroneBaseId = target.Id;
                context.SaveChanges();

                context.Entry(drone).Reference(d => d.HomeBase).Load();

                return Results.Ok(drone);
            });
            drones.MapDelete("/{id}", (int id, DroneContext context) =>
            {
                var drone = context.Drones.FirstOrDefault(d => d.Id == id);

                if (drone != null)
                {
                    context.Drones.Remove(drone);
                    context.SaveChanges();
                    return Results.Ok(drone);

                }

                return Results.NotFound($"Drona cu ID-ul {id} nu a fost găsită.");
            });
            drones.MapDelete("", (DroneContext context) =>
            {
                var deleted = context.Drones.ExecuteDelete();
                return Results.Ok(new { deleted });
            });
        }
    }
}
