using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Drones
{
    public class Location
    {
        public float Latitude { get; set; }
        public float Longitude { get; set; }
        public float Altitude { get; set; }

        public void SetLocation(float la, float lo, float al)
        {
            Latitude = la;
            Longitude = lo;
            Altitude = al;
        }
    }

    public class Speed
    {
        public float Horizontal { get; set; }   // km/h
        public float Vertical { get; set; }     // m/s

        public void SetSpeed(float h, float v)
        {
            Horizontal = h;
            Vertical = v;
        }
    }

    public enum DroneCategory
    {
        Civilian = 0,
        Military = 1,
    }

    public enum DroneKind
    {
        Delivery = 0,
        Survey = 1,
        Recon = 2,
        Combat = 3,
    }

    public interface IDrone
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public Location CurrentLocation { get; set; }
        public Speed CurrentSpeed { get; set; }
        public float BatteryLevel { get; set; }
        string Status { get; set; }
    }

    public abstract class BaseDrone : IDrone
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public Location CurrentLocation { get; set; } = new Location();
        public Speed CurrentSpeed { get; set; } = new Speed();
        public float BatteryLevel { get; set; }
        public string Status { get; set; } = "offline";

        public DroneKind Kind { get; private set; }        // discriminator

        public int DroneModelId { get; set; }

        [JsonIgnore]
        public DroneModel DroneModel { get; set; } = null!;

        public int? DroneBaseId { get; set; }              // baza de care aparține

        [JsonIgnore]
        public DroneBase? HomeBase { get; set; }

        public int? ParkedAtBaseId { get; set; }

        [JsonIgnore]
        public DroneBase? ParkedAtBase { get; set; }

        [NotMapped]
        public bool IsInBase => ParkedAtBaseId != null;

        // parcată la o bază care nu e a ei
        [NotMapped]
        public bool IsVisiting => ParkedAtBaseId != null && ParkedAtBaseId != DroneBaseId;

        // NotMapped -> nu se salveaza in baza de date, vin din DroneModel
        [NotMapped]
        public string Model => DroneModel.Name;
        [NotMapped]
        public DroneCategory Category => DroneModel.Category;
        [NotMapped]
        public string ImagePath => DroneModel.ImagePath;

        [NotMapped]
        public float MaxHorizontalSpeed => DroneModel.MaxHorizontalSpeed;
        [NotMapped]
        public float MaxVerticalSpeed => DroneModel.MaxVerticalSpeed;
        [NotMapped]
        public float MaxAltitude => DroneModel.MaxAltitude;
        [NotMapped]
        public float BatteryCapacity => DroneModel.BatteryCapacity;
    }

    public abstract class CivilianDrone : BaseDrone
    {
        public string RegistrationNumber { get; set; } = "";
    }

    public abstract class MilitaryDrone : BaseDrone
    {
        public string EncryptionKey { get; set; } = "";
    }

    public record DroneCatalogEntry(
        string Model,
        string Kind,
        string Category,
        string ImagePath,
        float MaxHorizontalSpeed,
        float MaxVerticalSpeed,
        float MaxAltitude,
        float BatteryCapacity
    );
}
