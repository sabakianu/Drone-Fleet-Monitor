using Microsoft.EntityFrameworkCore;
using Drones;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddSingleton<DroneManager>();
builder.Services.AddDbContext<DroneContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapGet("/api/drones", (DroneManager manager) =>
{
    return manager.GetAllDrones();
});

app.MapGet("/api/drones/civilian", (DroneManager manager) =>
{
    return manager.GetAllCivilianDrones();
});

app.MapGet("/api/drones/military", (DroneManager manager) =>
{
    return manager.GetAllMilitaryDrones();
});

app.MapPost("/api/drones/add", (string type, DroneManager manager) =>
{
    try
    {
        manager.AddDrone(type);
        return Results.Ok($"Drona de tip '{type}' a fost adăugată cu succes!");
    }
    catch (ArgumentException ex)
    {
        return Results.BadRequest(ex.Message);
    }
});

app.MapGet("/api/drones/{id}", (int id, DroneManager manager) =>
{
    var drone = manager.SearchById(id);

    if (drone == null)
    {
        return Results.NotFound($"Drona cu ID-ul {id} nu a fost găsită.");
    }

    return Results.Ok(drone);
});

app.MapDelete("/api/drones/{id}", (int id, DroneManager manager) =>
{
    var drone = manager.DeleteDrone(id);

    if (drone == null)
    {
        return Results.NotFound($"Drona cu ID-ul {id} nu a fost găsită.");
    }
    return Results.Ok(drone);
});

app.Run();

