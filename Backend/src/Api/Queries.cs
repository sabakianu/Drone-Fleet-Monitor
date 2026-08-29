using System.Diagnostics.CodeAnalysis;
using Microsoft.EntityFrameworkCore;

namespace Drones.Api
{
    public static class Queries
    {
        public static IQueryable<DroneBase> WithDrones(this DbSet<DroneBase> bases) =>
            bases.Include(b => b.Drones).Include(b => b.ParkedDrones);

        public static bool TryFindDrone(
            this IQueryable<BaseDrone> drones,
            int id,
            [NotNullWhen(true)] out BaseDrone? drone,
            [NotNullWhen(false)] out IResult? error)
        {
            drone = drones.FirstOrDefault(d => d.Id == id);
            error = drone == null
                ? Results.NotFound($"Drona cu ID-ul {id} nu a fost găsită.")
                : null;

            return drone != null;
        }

        public static bool TryFindBase(
            this IQueryable<DroneBase> bases,
            int id,
            [NotNullWhen(true)] out DroneBase? droneBase,
            [NotNullWhen(false)] out IResult? error)
        {
            droneBase = bases.FirstOrDefault(b => b.Id == id);
            error = droneBase == null
                ? Results.NotFound($"Baza cu ID-ul {id} nu a fost găsită.")
                : null;

            return droneBase != null;
        }
    }
}
