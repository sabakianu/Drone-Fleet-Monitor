using System.Diagnostics;

namespace Drones
{
    // ceasul propriu-zis: porneste de la ora serverului si curge chiar si cand
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
                // inchidem intervalul cu viteza veche inainte sa o schimbam
                Settle();
                speed = value;
            }
        }

        // aduce ceasul la zi cu timpul real scurs de la ultima citire
        void Settle()
        {
            var now = Stopwatch.GetTimestamp();
            var elapsed = (double)(now - stamp) / Stopwatch.Frequency;

            simSeconds = SimulationTime.Advance(simSeconds, elapsed, speed);
            stamp = now;
        }
    }
}
