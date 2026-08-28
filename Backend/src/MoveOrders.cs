using System.Collections.Concurrent;

namespace Drones
{
    public class MoveOrders
    {
        readonly ConcurrentDictionary<int, MovePlan> orders = new();

        public bool IsEmpty => orders.IsEmpty;

        public void Set(int droneId, MovePlan plan) => orders[droneId] = plan;

        public bool Remove(int droneId) => orders.TryRemove(droneId, out _);

        public MovePlan? Find(int droneId) =>
            orders.TryGetValue(droneId, out var plan) ? plan : null;

        public IReadOnlyList<KeyValuePair<int, MovePlan>> Snapshot() =>
            orders.ToArray();
    }
}
