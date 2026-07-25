namespace Drones
{
    public class DeliveryDrone : ICivilianDrone
    {
        public string RegistrationNumber { get; set; } = "";
        public int Id { get; set; }
        public Location CurrentLocation { get; set; } = new Location();
        public float BatteryLevel { get; set; }
        public float Altitude { get; set; }
        public string Status { get; set; } = "offline";
        public float Speed { get; set; }
    }
    public class SurveyDrone : ICivilianDrone
    {
        public string RegistrationNumber { get; set; } = "";
        public int Id { get; set; }
        public Location CurrentLocation { get; set; } = new Location();
        public float BatteryLevel { get; set; }
        public float Altitude { get; set; }
        public string Status { get; set; } = "offline";
        public float Speed { get; set; }
    }

    public class ReconDrone : IMilitaryDrone
    {
        public string EncryptionKey { get; set; } = "";
        public int Id { get; set; }
        public Location CurrentLocation { get; set; } = new Location();
        public float BatteryLevel { get; set; }
        public float Altitude { get; set; }
        public string Status { get; set; } = "offline";
        public float Speed { get; set; }
    }
    public class CombatDrone : IMilitaryDrone
    {
        public string EncryptionKey { get; set; } = "";
        public int Id { get; set; }
        public Location CurrentLocation { get; set; } = new Location();
        public float BatteryLevel { get; set; }
        public float Altitude { get; set; }
        public string Status { get; set; } = "offline";
        public float Speed { get; set; }
    }
}