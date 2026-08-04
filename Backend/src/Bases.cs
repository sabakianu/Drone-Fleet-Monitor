using System.ComponentModel.DataAnnotations.Schema;

namespace Drones
{
    public interface IDroneBase
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public Location CurrentLocation { get; set; }
        public int MaxDroneCapacity { get; set; }
        List<BaseDrone> Drones { get; set; }
    }

    public abstract class DroneBase : IDroneBase
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public Location CurrentLocation { get; set; } = new Location();
        public int MaxDroneCapacity { get; set; }

        public DroneCategory Category { get; private set; }   // discriminator 

        public List<BaseDrone> Drones { get; set; } = new();

        [NotMapped]
        public int DroneCount => Drones.Count;

        [NotMapped]
        public bool IsFull => Drones.Count >= MaxDroneCapacity;
    }

    public class CivilianBase : DroneBase { }

    public class MilitaryBase : DroneBase { }

    public record NewBaseRequest(
        string Category,
        string Name,
        float Latitude,
        float Longitude,
        int MaxDroneCapacity
    );
}
