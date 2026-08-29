using Microsoft.EntityFrameworkCore;
using Drones;
using Drones.Api;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.ConfigureHttpJsonOptions(o =>
    o.SerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter()));

builder.Services.AddSingleton<SimulationClock>();
builder.Services.AddSingleton<MoveOrders>();
builder.Services.AddHostedService<SimulationService>();

builder.Services.AddDbContext<DroneContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapSimulationEndpoints();
app.MapDroneEndpoints();
app.MapCatalogEndpoints();
app.MapNavigationEndpoints();
app.MapBaseEndpoints();

app.Run();
