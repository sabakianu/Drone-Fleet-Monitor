using Microsoft.EntityFrameworkCore;

namespace Drones.Api
{
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
                if (!context.Drones.TryFindDrone(id, out var drone, out var notFound))
                {
                    return notFound;
                }

                var invalid = Move.Validate(
                    drone, latitude, longitude, altitude, horizontalSpeed, verticalSpeed);

                if (invalid != null) return Results.BadRequest(invalid);

                var destination = new Location();
                destination.SetLocation(latitude, longitude, altitude);

                var parkable = Move.BaseInRange(
                    destination,
                    context.Bases.WithDrones().ToList());

                return Results.Ok(new
                {
                    distanceKm = Distance.BetweenKm(drone.CurrentLocation, destination),
                    climbMeters = Distance.ClimbMeters(drone.CurrentLocation, destination),
                    travelSeconds = Distance.TravelSeconds(
                        drone.CurrentLocation, destination, horizontalSpeed, verticalSpeed),
                    parkableBaseId = parkable?.Id,
                    parkableBaseName = parkable?.Name,
                });
            });
            drones.MapGet("/{id}/distances", (int id, DroneContext context) =>
            {
                if (!context.Drones.TryFindDrone(id, out var drone, out var notFound))
                {
                    return notFound;
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
