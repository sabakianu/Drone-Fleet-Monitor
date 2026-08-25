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

    public enum DroneModel
    {
        Wingcopter198 = 0,
        MatternetM2 = 1,
        Phantom4RTK = 2,
        MavicEnterprise = 3,
        BayraktarTB2 = 4,
        Heron1 = 5,
        MQ9Reaper = 6,
        BayraktarAkinci = 7,
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

        public DroneModel Model { get; private set; }      // discriminator
        public DroneKind Kind { get; protected set; }      // setat de tipul abstract
        public DroneCategory Category { get; protected set; }

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

        // NotMapped -> nu se slaveaza in baza de date
        [NotMapped]
        public abstract string ImagePath { get; }

        [NotMapped]
        public abstract float MaxHorizontalSpeed { get; }
        [NotMapped]
        public abstract float MaxVerticalSpeed { get; }
        [NotMapped]
        public abstract float MaxAltitude { get; }
        [NotMapped]
        public abstract float BatteryCapacity { get; }
    }

    public abstract class CivilianDrone : BaseDrone
    {
        protected CivilianDrone()
        {
            Category = DroneCategory.Civilian;
        }

        public string RegistrationNumber { get; set; } = "";
    }

    public abstract class MilitaryDrone : BaseDrone
    {
        protected MilitaryDrone()
        {
            Category = DroneCategory.Military;
        }

        public string EncryptionKey { get; set; } = "";
    }
}
