using Microsoft.EntityFrameworkCore;

namespace Drones.Api
{
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
                MoveOrders orders,
                EventLog log) =>
            {
                if (!context.Drones.Include(d => d.HomeBase)
                        .TryFindDrone(id, out var drone, out var notFound))
                {
                    return notFound;
                }

                if (drone.Status == DroneStatus.Crashed)
                {
                    return Results.BadRequest("Drona e avariată și nu mai poate fi pornită.");
                }

                if (!Enum.TryParse<DroneStatus>(status, true, out var next)
                    || next == DroneStatus.Crashed)
                {
                    return Results.BadRequest("Status invalid. Acceptate: online, offline.");
                }

                if (next == DroneStatus.Online
                    && drone.BatteryLevel <= 0
                    && drone.ParkedAtBaseId == null)
                {
                    return Results.BadRequest("Drona nu are baterie și nu e într-o bază.");
                }

                if (next == DroneStatus.Offline && drone.ParkedAtBaseId == null)
                {
                    orders.Remove(id);

                    var height = drone.CurrentLocation.Altitude;
                    Move.Fall(drone, context.Bases.WithDrones().ToList());

                    log.Fall(drone, height);
                }
                else
                {
                    drone.Status = next;

                    log.Add("power", $"{drone.Label} is now {next.ToString().ToLower()}");
                }

                context.SaveChanges();

                return Results.Ok(drone);
            });
            drones.MapPut("/{id}/name", (int id, string name, DroneContext context) =>
            {
                if (!context.Drones.Include(d => d.HomeBase)
                        .TryFindDrone(id, out var drone, out var notFound))
                {
                    return notFound;
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
                EventLog log,
                int? parkAtBaseId = null) =>
            {
                if (!context.Drones.TryFindDrone(id, out var drone, out var notFound))
                {
                    return notFound;
                }

                if (drone.Status == DroneStatus.Crashed)
                {
                    return Results.BadRequest("Drona e avariată și nu mai poate zbura.");
                }

                if (drone.BatteryLevel <= 0)
                {
                    return Results.BadRequest("Drona nu are baterie.");
                }

                var invalid = Move.Validate(
                    drone, latitude, longitude, altitude, horizontalSpeed, verticalSpeed);

                if (invalid != null) return Results.BadRequest(invalid);

                drone.Status = DroneStatus.Online;
                drone.ParkedAtBaseId = null;
                drone.CurrentSpeed.SetSpeed(horizontalSpeed, verticalSpeed);
                context.SaveChanges();

                orders.Set(id, new MovePlan(
                    latitude, longitude, altitude,
                    horizontalSpeed, verticalSpeed, parkAtBaseId));

                log.Add("takeoff",
                    $"{drone.Label} took off for {latitude:0.00}, {longitude:0.00}"
                    + $" at {altitude:0} m");

                return Results.Ok(drone);
            });

            drones.MapPut("/{id}/tow", (
                int id,
                DroneContext context,
                MoveOrders orders,
                EventLog log) =>
            {
                if (!context.Drones.Include(d => d.HomeBase)
                        .TryFindDrone(id, out var drone, out var notFound))
                {
                    return notFound;
                }

                if (drone.HomeBase == null)
                {
                    return Results.BadRequest("Drona nu aparține niciunei baze.");
                }

                if (!drone.CanTow)
                {
                    return Results.BadRequest(
                        "Drona trebuie să fie oprită, la sol, în afara unei baze.");
                }

                var homeBase = context.Bases.WithDrones().First(b => b.Id == drone.HomeBase.Id);

                if (!Move.CanPark(drone, homeBase) && drone.ParkedAtBaseId != homeBase.Id)
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

                if (drone.Status != DroneStatus.Crashed)
                {
                    drone.Status = DroneStatus.Offline;
                }

                context.SaveChanges();

                log.Add("tow", $"{drone.Label} was towed back to {homeBase.Name}");

                return Results.Ok(drone);
            });

            drones.MapDelete("/{id}/move", (
                int id,
                DroneContext context,
                MoveOrders orders,
                EventLog log) =>
            {
                if (!context.Drones.TryFindDrone(id, out var drone, out var notFound))
                {
                    return notFound;
                }

                orders.Remove(id);
                drone.CurrentSpeed.SetSpeed(0f, 0f);
                context.SaveChanges();

                log.Add("cancel", $"{drone.Label}: flight order cancelled");

                return Results.Ok(drone);
            });

            drones.MapPut("/{id}/base", (int id, int baseId, DroneContext context) =>
            {
                if (!context.Drones.TryFindDrone(id, out var drone, out var notFound))
                {
                    return notFound;
                }

                if (!context.Bases.WithDrones()
                        .TryFindBase(baseId, out var target, out var baseNotFound))
                {
                    return baseNotFound;
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
            drones.MapDelete("/{id}", (int id, DroneContext context, EventLog log) =>
            {
                if (!context.Drones.TryFindDrone(id, out var drone, out var notFound))
                {
                    return notFound;
                }

                context.Drones.Remove(drone);
                context.SaveChanges();

                log.Add("destroyed", $"{drone.Label} was destroyed");

                return Results.Ok(drone);
            });
            drones.MapDelete("", (DroneContext context) =>
            {
                var deleted = context.Drones.ExecuteDelete();
                return Results.Ok(new { deleted });
            });
        }
    }
}
