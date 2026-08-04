namespace Drones
{
    public class Wingcopter198 : DeliveryDrone
    {
        public override string ImagePath => "Images/DroneModels/Wingcopter198.png";
        public override float MaxHorizontalSpeed => 240f;
        public override float MaxVerticalSpeed => 15f;
        public override float MaxAltitude => 4000f;
        public override float BatteryCapacity => 12000f;
    }

    public class MatternetM2 : DeliveryDrone
    {
        public override string ImagePath => "Images/DroneModels/MatternetM2.jpg";
        public override float MaxHorizontalSpeed => 70f;
        public override float MaxVerticalSpeed => 5f;
        public override float MaxAltitude => 120f;
        public override float BatteryCapacity => 5000f;
    }

    public class Phantom4RTK : SurveyDrone
    {
        public override string ImagePath => "Images/DroneModels/Phantom4RTK.jpeg";
        public override float MaxHorizontalSpeed => 72f;
        public override float MaxVerticalSpeed => 6f;
        public override float MaxAltitude => 6000f;
        public override float BatteryCapacity => 5870f;
    }

    public class MavicEnterprise : SurveyDrone
    {
        public override string ImagePath => "Images/DroneModels/MavicEnterprise.jpg";
        public override float MaxHorizontalSpeed => 72f;
        public override float MaxVerticalSpeed => 6f;
        public override float MaxAltitude => 6000f;
        public override float BatteryCapacity => 5000f;
    }

    public class BayraktarTB2 : ReconDrone
    {
        public override string ImagePath => "Images/DroneModels/BayraktarTB2.jpeg";
        public override float MaxHorizontalSpeed => 220f;
        public override float MaxVerticalSpeed => 12f;
        public override float MaxAltitude => 8200f;
        public override float BatteryCapacity => 20000f;
    }

    public class Heron1 : ReconDrone
    {
        public override string ImagePath => "Images/DroneModels/Heron1.jpeg";
        public override float MaxHorizontalSpeed => 207f;
        public override float MaxVerticalSpeed => 10f;
        public override float MaxAltitude => 10000f;
        public override float BatteryCapacity => 25000f;
    }

    public class MQ9Reaper : CombatDrone
    {
        public override string ImagePath => "Images/DroneModels/MQ9Reaper.jpeg";
        public override float MaxHorizontalSpeed => 482f;
        public override float MaxVerticalSpeed => 25f;
        public override float MaxAltitude => 15000f;
        public override float BatteryCapacity => 30000f;
    }

    public class BayraktarAkinci : CombatDrone
    {
        public override string ImagePath => "Images/DroneModels/BayraktarAkinci.jpeg";
        public override float MaxHorizontalSpeed => 361f;
        public override float MaxVerticalSpeed => 20f;
        public override float MaxAltitude => 12000f;
        public override float BatteryCapacity => 28000f;
    }
}
