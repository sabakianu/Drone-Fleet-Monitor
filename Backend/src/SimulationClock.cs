using System.Diagnostics;

namespace Drones
{
    public class SimulationClock
    {
        readonly object gate = new();

        double simSeconds;
        int speed = 1;
        long stamp;

        public SimulationClock()
        {
            simSeconds = SimulationTime.FromTimeOfDay(TimeOnly.FromDateTime(DateTime.Now));
            stamp = Stopwatch.GetTimestamp();
        }

        public SimulationClockState Snapshot()
        {
            lock (gate)
            {
                Settle();

                return new SimulationClockState(
                    simSeconds,
                    SimulationTime.Format(simSeconds),
                    speed,
                    SimulationTime.Speeds,
                    SimulationTime.RealSecondsPerSimHour,
                    SimulationTime.SimSecondsPerRealSecond(speed));
            }
        }

        public void SetSpeed(int value)
        {
            lock (gate)
            {
                Settle();
                speed = value;
            }
        }

        void Settle()
        {
            var now = Stopwatch.GetTimestamp();
            var elapsed = (double)(now - stamp) / Stopwatch.Frequency;

            simSeconds = SimulationTime.Advance(simSeconds, elapsed, speed);
            stamp = now;
        }
    }
}
