using Microsoft.EntityFrameworkCore;
using Drones;

public class DroneContext : DbContext
{
    public DroneContext(DbContextOptions<DroneContext> options) : base(options)
    {
    }

    public DbSet<BaseDrone> Drones { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<BaseDrone>().OwnsOne(d => d.CurrentLocation);

        modelBuilder.Entity<DeliveryDrone>();
        modelBuilder.Entity<SurveyDrone>();
        modelBuilder.Entity<ReconDrone>();
        modelBuilder.Entity<CombatDrone>();
    }
}