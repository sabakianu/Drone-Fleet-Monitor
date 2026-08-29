using System.ComponentModel.DataAnnotations.Schema;

namespace Drones
{
    public interface IDroneBase
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public Location CurrentLocation { get; set; }
        public int MaxDroneCapacity { get; set; }
        public int MaxParkingCapacity { get; set; }
        public string Status { get; set; }
        List<BaseDrone> Drones { get; set; }
        List<BaseDrone> ParkedDrones { get; set; }
    }

    public abstract class DroneBase : IDroneBase
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public Location CurrentLocation { get; set; } = new Location();
        public int MaxDroneCapacity { get; set; }
        public int MaxParkingCapacity { get; set; }
        public string Status { get; set; } = "offline";

        public DroneCategory Category { get; private set; }

        public List<BaseDrone> Drones { get; set; } = new();

        public List<BaseDrone> ParkedDrones { get; set; } = new();

        [NotMapped]
        public abstract string ImagePath { get; }

        [NotMapped]
        public int DroneCount => Drones.Count;

        [NotMapped]
        public bool IsFull => Drones.Count >= MaxDroneCapacity;

        [NotMapped]
        public int ParkedCount => ParkedDrones.Count;

        [NotMapped]
        public bool IsParkingFull => ParkedDrones.Count >= MaxParkingCapacity;

        [NotMapped]
        public int DronesInBaseCount => Drones.Count(d => d.ParkedAtBaseId == Id);

        [NotMapped]
        public int DronesInFlightCount => Drones.Count(d => d.ParkedAtBaseId == null);

        [NotMapped]
        public int DronesAwayCount => DroneCount - DronesInBaseCount - DronesInFlightCount;
    }

    public class CivilianBase : DroneBase
    {
        public override string ImagePath => "Images/Bases/CivilianDroneBase.jpg";
    }

    public class MilitaryBase : DroneBase
    {
        public override string ImagePath => "Images/Bases/MilitaryDroneBase.jpg";
    }

    public record NewBaseRequest(
        string Category,
        string Name,
        float Latitude,
        float Longitude,
        int? MaxDroneCapacity = null,
        int? MaxParkingCapacity = null
    );
}
