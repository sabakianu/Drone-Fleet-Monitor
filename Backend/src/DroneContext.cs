using Microsoft.EntityFrameworkCore;
using Drones;

public class DroneContext : DbContext
{
    public DroneContext(DbContextOptions<DroneContext> options) : base(options)
    {
    }

    public DbSet<BaseDrone> Drones { get; set; }
    public DbSet<DroneBase> Bases { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<BaseDrone>().OwnsOne(d => d.CurrentLocation);
        modelBuilder.Entity<BaseDrone>().OwnsOne(d => d.CurrentSpeed);
        modelBuilder.Entity<DroneBase>().OwnsOne(b => b.CurrentLocation);

        modelBuilder.Entity<DroneBase>()
            .HasDiscriminator<DroneCategory>("Category")
            .HasValue<CivilianBase>(DroneCategory.Civilian)
            .HasValue<MilitaryBase>(DroneCategory.Military);

        modelBuilder.Entity<DroneBase>()
            .HasMany(b => b.Drones)
            .WithOne()
            .HasForeignKey(d => d.DroneBaseId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<BaseDrone>()
            .HasDiscriminator<DroneModel>("Model")
            .HasValue<Wingcopter198>(DroneModel.Wingcopter198)
            .HasValue<MatternetM2>(DroneModel.MatternetM2)
            .HasValue<Phantom4RTK>(DroneModel.Phantom4RTK)
            .HasValue<MavicEnterprise>(DroneModel.MavicEnterprise)
            .HasValue<BayraktarTB2>(DroneModel.BayraktarTB2)
            .HasValue<Heron1>(DroneModel.Heron1)
            .HasValue<MQ9Reaper>(DroneModel.MQ9Reaper)
            .HasValue<BayraktarAkinci>(DroneModel.BayraktarAkinci);
    }
}
