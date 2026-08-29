using Microsoft.EntityFrameworkCore;

namespace Drones
{
    public class SimulationService : BackgroundService
    {
        const int TickMs = 200;

        readonly IServiceProvider provider;
        readonly SimulationClock clock;
        readonly MoveOrders orders;

        public SimulationService(
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

                if (elapsed <= 0) continue;

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
            using var scope = provider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<DroneContext>();

            AdvanceMovement(context, elapsed);
            AdvanceBatteries(context, elapsed);

            context.SaveChanges();
        }

        void AdvanceMovement(DroneContext context, double elapsed)
        {
            var active = orders.Snapshot();
            if (active.Count == 0) return;

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
        }

        void AdvanceBatteries(DroneContext context, double elapsed)
        {
            var affected = context.Drones
                .Where(d =>
                    (d.Status == "online" && d.BatteryLevel > 0)
                    || (d.Status == "offline" && d.ParkedAtBaseId != null && d.BatteryLevel < 100))
                .ToList();

            foreach (var drone in affected)
            {
                drone.BatteryLevel = Battery.Next(drone, elapsed);

                if (drone.BatteryLevel <= 0 && drone.ParkedAtBaseId == null)
                {
                    Fall(context, drone);
                }
            }
        }

        void Fall(DroneContext context, BaseDrone drone)
        {
            orders.Remove(drone.Id);

            Move.Fall(drone, context.Bases.Include(b => b.ParkedDrones).ToList());
        }
    }
}
