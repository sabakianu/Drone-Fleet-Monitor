using Microsoft.EntityFrameworkCore;

namespace Drones
{
    public class MovementService : BackgroundService
    {
        const int TickMs = 200;

        readonly IServiceProvider provider;
        readonly SimulationClock clock;
        readonly MoveOrders orders;

        public MovementService(
            IServiceProvider provider,
            SimulationClock clock,
            MoveOrders orders)
        {
            this.provider = provider;
            this.clock = clock;
            this.orders = orders;
        }

        protected override async Task ExecuteAsync(CancellationToken token)
        {
            var previous = clock.Snapshot().SimSeconds;

            while (!token.IsCancellationRequested)
            {
                try
                {
                    await Task.Delay(TickMs, token);
                }
                catch (OperationCanceledException)
                {
                    return;
                }

                var current = clock.Snapshot().SimSeconds;
                var elapsed = SimulationTime.Elapsed(previous, current);
                previous = current;

                if (elapsed <= 0 || orders.IsEmpty) continue;

                try
                {
                    Tick(elapsed);
                }
                catch (Exception error)
                {
                    Console.WriteLine($"movement tick failed: {error.Message}");
                }
            }
        }

        void Tick(double elapsed)
        {
            var active = orders.Snapshot();

            using var scope = provider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<DroneContext>();

            var ids = active.Select(entry => entry.Key).ToList();
            var drones = context.Drones
                .Where(d => ids.Contains(d.Id))
                .ToDictionary(d => d.Id);

            foreach (var (droneId, plan) in active)
            {
                if (!drones.TryGetValue(droneId, out var drone))
                {
                    orders.Remove(droneId);
                    continue;
                }

                Move.Step(drone.CurrentLocation, plan, elapsed);

                if (!Move.HasArrived(drone.CurrentLocation, plan)) continue;

                drone.CurrentSpeed.SetSpeed(0f, 0f);
                orders.Remove(droneId);
            }

            context.SaveChanges();
        }
    }
}
