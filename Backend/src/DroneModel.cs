namespace Drones
{
    public class DroneModel
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";

        public DroneKind Kind { get; set; }
        public DroneCategory Category { get; set; }

        public string ImagePath { get; set; } = "";
        public float MaxHorizontalSpeed { get; set; }
        public float MaxVerticalSpeed { get; set; }
        public float MaxAltitude { get; set; }
        public float BatteryCapacity { get; set; }
    }
}
