namespace Drones
{
    public static class Battery
    {
        const double FlightMinutes = 4.0;
        const double IdleMinutes = 16.0;
        const double ChargeMinutes = 2.0;

        public static double? SecondsLeft(BaseDrone drone)
        {
            var rate = RatePerSimSecond(drone);

            return rate < 0 ? drone.BatteryLevel / -rate : null;
        }

        public static float Next(BaseDrone drone, double simSeconds) =>
            (float)Math.Clamp(
                drone.BatteryLevel + RatePerSimSecond(drone) * simSeconds, 0.0, 100.0);

        public static double RatePerSimSecond(BaseDrone drone)
        {
            var parked = drone.ParkedAtBaseId != null;
            var charging = parked && drone.ParkedAtBase?.Status == "online";

            if (drone.Status == DroneStatus.Offline)
            {
                return charging ? PercentPerSimSecond(ChargeMinutes) : 0.0;
            }

            return parked
                ? -PercentPerSimSecond(IdleMinutes)
                : -PercentPerSimSecond(FlightMinutes);
        }

        static double PercentPerSimSecond(double realMinutes) =>
            100.0 / (realMinutes * 60.0 * SimulationTime.SimSecondsPerRealSecond(1));
    }
}
