namespace Drones
{
    public static class SimulationTime
    {
        public const double RealSecondsPerSimHour = 1.5;
        public const double DaySeconds = 24 * 3600;

        public static readonly int[] Speeds = [0, 1, 5, 10];

        public static double SimSecondsPerRealSecond(int speed) =>
            3600.0 / RealSecondsPerSimHour * speed;

        public static double Advance(double simSeconds, double realSeconds, int speed) =>
            Wrap(simSeconds + realSeconds * SimSecondsPerRealSecond(speed));

        public static double Elapsed(double previous, double current) =>
            Wrap(current - previous);

        public static double Wrap(double simSeconds) =>
            ((simSeconds % DaySeconds) + DaySeconds) % DaySeconds;

        public static double FromTimeOfDay(TimeOnly time) =>
            time.Hour * 3600 + time.Minute * 60 + time.Second;

        public static string Format(double simSeconds)
        {
            var total = (int)Math.Floor(Wrap(simSeconds));

            return $"{total / 3600:00}:{total % 3600 / 60:00}:{total % 60:00}";
        }
    }

    public record SimulationClockState(
        double SimSeconds,
        string Time,
        int Speed,
        int[] Speeds,
        double RealSecondsPerSimHour,
        double SimSecondsPerRealSecond
    );
}
