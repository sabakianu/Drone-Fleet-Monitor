namespace Drones
{
    public class Wingcopter198 : DeliveryDrone
    {
        public override float MaxSpeed => 240f;
        public override float MaxAltitude => 4000f;
        public override float BatteryCapacity => 12000f;
    }

    public class MatternetM2 : DeliveryDrone
    {
        public override float MaxSpeed => 70f;
        public override float MaxAltitude => 120f;
        public override float BatteryCapacity => 5000f;
    }

    public class Phantom4RTK : SurveyDrone
    {
        public override float MaxSpeed => 72f;
        public override float MaxAltitude => 6000f;
        public override float BatteryCapacity => 5870f;
    }

    public class MavicEnterprise : SurveyDrone
    {
        public override float MaxSpeed => 72f;
        public override float MaxAltitude => 6000f;
        public override float BatteryCapacity => 5000f;
    }

    public class BayraktarTB2 : ReconDrone
    {
        public override float MaxSpeed => 220f;
        public override float MaxAltitude => 8200f;
        public override float BatteryCapacity => 20000f;
    }

    public class Heron1 : ReconDrone
    {
        public override float MaxSpeed => 207f;
        public override float MaxAltitude => 10000f;
        public override float BatteryCapacity => 25000f;
    }

    public class MQ9Reaper : CombatDrone
    {
        public override float MaxSpeed => 482f;
        public override float MaxAltitude => 15000f;
        public override float BatteryCapacity => 30000f;
    }

    public class BayraktarAkinci : CombatDrone
    {
        public override float MaxSpeed => 361f;
        public override float MaxAltitude => 12000f;
        public override float BatteryCapacity => 28000f;
    }
}
