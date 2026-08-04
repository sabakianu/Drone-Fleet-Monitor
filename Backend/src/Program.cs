using Microsoft.EntityFrameworkCore;
using Drones;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

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
    var drones = context.Drones.ToList();
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


using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<DroneContext>();
    db.Database.Migrate();
}

app.Run();

