namespace Drones
{

    public static class Battery
    {
        // calibrare in minute reale, la viteza 1 a simularii
        const double FlightMinutes = 4.0;    // pornita, in zbor
        const double IdleMinutes = 16.0;     // pornita, dar parcata in baza
        const double ChargeMinutes = 2.0;    // oprita si parcata

        public static float Next(BaseDrone drone, double simSeconds) =>
            (float)Math.Clamp(
                drone.BatteryLevel + RatePerSimSecond(drone) * simSeconds, 0.0, 100.0);

        public static double RatePerSimSecond(BaseDrone drone)
        {
            var parked = drone.ParkedAtBaseId != null;

            if (drone.Status == "offline")
            {
                return parked ? PercentPerSimSecond(ChargeMinutes) : 0.0;
            }

            return parked
                ? -PercentPerSimSecond(IdleMinutes)
                : -PercentPerSimSecond(FlightMinutes);
        }

        static double PercentPerSimSecond(double realMinutes) =>
            100.0 / (realMinutes * 60.0 * SimulationTime.SimSecondsPerRealSecond(1));
    }
}
