using Microsoft.EntityFrameworkCore;

namespace Drones.Api
{
    // catalogul de modele (DroneModels)
    public static class CatalogEndpoints
    {
        public static void MapCatalogEndpoints(this WebApplication app)
        {
            app.MapGet("/api/drones/catalog", (DroneContext context) =>
            {
                var catalog = context.DroneModels
                    .OrderBy(m => m.Category)
                    .ThenBy(m => m.Kind)
                    .ThenBy(m => m.Name)
                    .Select(m => new DroneCatalogEntry(
                        m.Name,
                        m.Kind.ToString(),
                        m.Category.ToString(),
                        m.ImagePath,
                        m.MaxHorizontalSpeed,
                        m.MaxVerticalSpeed,
                        m.MaxAltitude,
                        m.BatteryCapacity))
                    .ToList();

                return Results.Ok(catalog);
            });
        }
    }
}
