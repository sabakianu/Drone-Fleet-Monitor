namespace Drones
{
    public record LogEntry(int Id, string Time, string Kind, string Message);

    public class EventLog
    {
        const int Capacity = 200;

        readonly object gate = new();
        readonly Queue<LogEntry> entries = new();
        readonly SimulationClock clock;

        int nextId = 1;

        public EventLog(SimulationClock clock)
        {
            this.clock = clock;
        }

        public void Add(string kind, string message)
        {
            var time = clock.Snapshot().Time;

            lock (gate)
            {
                entries.Enqueue(new LogEntry(nextId++, time, kind, message));

                while (entries.Count > Capacity) entries.Dequeue();
            }
        }

        public void Fall(BaseDrone drone, float height)
        {
            var wrecked = drone.Status == DroneStatus.Crashed;

            Add(
                wrecked ? "crashed" : "landed",
                wrecked
                    ? $"{drone.Label} crashed from {height:0} m"
                    : $"{drone.Label} landed");
        }

        public IReadOnlyList<LogEntry> Since(int afterId)
        {
            lock (gate)
            {
                return entries.Where(entry => entry.Id > afterId).ToList();
            }
        }
    }
}
