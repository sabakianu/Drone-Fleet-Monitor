using Microsoft.EntityFrameworkCore;

namespace Drones.Api
{
    // ceasul simularii
    public static class SimulationEndpoints
    {
        public static void MapSimulationEndpoints(this WebApplication app)
        {
            var simulation = app.MapGroup("/api/simulation");

            simulation.MapGet("/clock", (SimulationClock clock) =>
                Results.Ok(clock.Snapshot()));
            simulation.MapPut("/speed", (int value, SimulationClock clock) =>
            {
                if (!SimulationTime.Speeds.Contains(value))
                {
                    return Results.BadRequest(
                        $"Viteza {value} nu e permisă. Valori: {string.Join(", ", SimulationTime.Speeds)}.");
                }

                clock.SetSpeed(value);

                return Results.Ok(clock.Snapshot());
            });
        }
    }
}
