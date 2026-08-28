using Microsoft.EntityFrameworkCore;

namespace Drones.Api
{
    // distante si timp de zbor (Distance.cs)
    public static class NavigationEndpoints
    {
        public static void MapNavigationEndpoints(this WebApplication app)
        {
            var drones = app.MapGroup("/api/drones");

            drones.MapGet("/{id}/trip", (
                int id,
                float latitude,
                float longitude,
                float altitude,
                float horizontalSpeed,
                float verticalSpeed,
                DroneContext context) =>
            {
                var drone = context.Drones.FirstOrDefault(d => d.Id == id);

                if (drone == null)
                {
                    return Results.NotFound($"Drona cu ID-ul {id} nu a fost găsită.");
                }

                if (horizontalSpeed <= 0 || verticalSpeed <= 0)
                {
                    return Results.BadRequest("Vitezele trebuie să fie mai mari decât zero.");
                }

                var destination = new Location();
                destination.SetLocation(latitude, longitude, altitude);

                return Results.Ok(new
                {
                    distanceKm = Distance.BetweenKm(drone.CurrentLocation, destination),
                    climbMeters = Distance.ClimbMeters(drone.CurrentLocation, destination),
                    travelSeconds = Distance.TravelSeconds(
                        drone.CurrentLocation, destination, horizontalSpeed, verticalSpeed),
                });
            });
            drones.MapGet("/{id}/distances", (int id, DroneContext context) =>
            {
                var drone = context.Drones.FirstOrDefault(d => d.Id == id);

                if (drone == null)
                {
                    return Results.NotFound($"Drona cu ID-ul {id} nu a fost găsită.");
                }

                var distances = context.Bases
                    .ToList()
                    .ToDictionary(
                        b => b.Id,
                        b => Distance.BetweenKm(drone.CurrentLocation, b.CurrentLocation));

                return Results.Ok(distances);
            });
        }
    }
}
