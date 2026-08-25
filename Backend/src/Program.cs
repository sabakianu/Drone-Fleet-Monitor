using Microsoft.EntityFrameworkCore;
using Drones;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.ConfigureHttpJsonOptions(o =>
    o.SerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter()));


builder.Services.AddDbContext<DroneContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapGet("/api/drones", (DroneContext context) =>
{
    var drones = context.Drones
        .Include(d => d.HomeBase)
        .ToList();

    return Results.Ok(drones);
});

app.MapGet("/api/drones/civilian", (DroneContext context) =>
{
    var civilianDrones = context.Drones
        .AsEnumerable()
        .OfType<CivilianDrone>()
        .ToList();

    return Results.Ok(civilianDrones);
});

app.MapGet("/api/drones/military", (DroneContext context) =>
{
    var militaryDrones = context.Drones
        .AsEnumerable()
        .OfType<MilitaryDrone>()
        .ToList();

    return Results.Ok(militaryDrones);
});

app.MapPost("/api/drones/add", (string type, DroneContext context) =>
{
    BaseDrone newDrone = type.ToLower() switch
    {
        "wingcopter198" => new Wingcopter198(),
        "matternetm2" => new MatternetM2(),
        "phantom4rtk" => new Phantom4RTK(),
        "mavicenterprise" => new MavicEnterprise(),
        "bayraktartb2" => new BayraktarTB2(),
        "heron1" => new Heron1(),
        "mq9reaper" => new MQ9Reaper(),
        "bayraktarakinci" => new BayraktarAkinci(),
        _ => throw new ArgumentException("Unknown Drone!"),
    };

    context.Drones.Add(newDrone);
    context.SaveChanges();

    return newDrone;
});

app.MapGet("/api/drones/{id}", (int id, DroneContext context) =>
{
    var drone = context.Drones.FirstOrDefault(d => d.Id == id);

    if (drone != null)
    {
        return Results.Ok(drone);

    }

    return Results.NotFound($"Drona cu ID-ul {id} nu a fost găsită.");
});

app.MapPut("/api/drones/{id}/status", (int id, string status, DroneContext context) =>
{
    var drone = context.Drones
        .Include(d => d.HomeBase)
        .FirstOrDefault(d => d.Id == id);

    if (drone == null)
    {
        return Results.NotFound($"Drona cu ID-ul {id} nu a fost găsită.");
    }

    if (status.ToLower() != "online" && status.ToLower() != "offline")
    {
        return Results.BadRequest("Status invalid. Acceptate: online, offline.");
    }

    drone.Status = status.ToLower();
    context.SaveChanges();

    return Results.Ok(drone);
});

app.MapPut("/api/drones/{id}/name", (int id, string name, DroneContext context) =>
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

app.MapPut("/api/drones/{id}/base", (int id, int baseId, DroneContext context) =>
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

app.MapDelete("/api/drones/{id}", (int id, DroneContext context) =>
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

app.MapDelete("/api/drones", (DroneContext context) =>
{
    var deleted = context.Drones.ExecuteDelete();
    return Results.Ok(new { deleted });
});


// Baze

app.MapGet("/api/bases", (DroneContext context) =>
{
    var bases = context.Bases
        .Include(b => b.Drones)
        .Include(b => b.ParkedDrones)
        .ToList();

    return Results.Ok(bases);
});

app.MapGet("/api/bases/civilian", (DroneContext context) =>
{
    var civilianBases = context.Bases
        .Include(b => b.Drones)
        .Include(b => b.ParkedDrones)
        .OfType<CivilianBase>()
        .ToList();

    return Results.Ok(civilianBases);
});

app.MapGet("/api/bases/military", (DroneContext context) =>
{
    var militaryBases = context.Bases
        .Include(b => b.Drones)
        .Include(b => b.ParkedDrones)
        .OfType<MilitaryBase>()
        .ToList();

    return Results.Ok(militaryBases);
});

app.MapGet("/api/bases/{id}", (int id, DroneContext context) =>
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

app.MapPost("/api/bases/add", (NewBaseRequest request, DroneContext context) =>
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

app.MapPost("/api/bases/{id}/drones", (int id, string type, DroneContext context) =>
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

    BaseDrone newDrone = type.ToLower() switch
    {
        "wingcopter198" => new Wingcopter198(),
        "matternetm2" => new MatternetM2(),
        "phantom4rtk" => new Phantom4RTK(),
        "mavicenterprise" => new MavicEnterprise(),
        "bayraktartb2" => new BayraktarTB2(),
        "heron1" => new Heron1(),
        "mq9reaper" => new MQ9Reaper(),
        "bayraktarakinci" => new BayraktarAkinci(),
        _ => throw new ArgumentException("Unknown Drone!"),
    };

    if (newDrone.Category != droneBase.Category)
    {
        return Results.BadRequest(
            $"O dronă {newDrone.Category} nu poate fi asignată unei baze {droneBase.Category}.");
    }

    newDrone.CurrentLocation.SetLocation(
        droneBase.CurrentLocation.Latitude,
        droneBase.CurrentLocation.Longitude,
        0f);

    droneBase.Drones.Add(newDrone);
    droneBase.ParkedDrones.Add(newDrone);
    context.SaveChanges();

    return Results.Ok(newDrone);
});

app.MapPut("/api/bases/{id}/status", (int id, string status, DroneContext context) =>
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

app.MapPut("/api/bases/{id}/name", (int id, string name, DroneContext context) =>
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

app.MapDelete("/api/bases/{id}", (int id, DroneContext context) =>
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

app.MapDelete("/api/bases", (DroneContext context) =>
{
    var deleted = context.Bases.ExecuteDelete();
    return Results.Ok(new { deleted });
});


using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<DroneContext>();
    db.Database.Migrate();
}

app.Run();

