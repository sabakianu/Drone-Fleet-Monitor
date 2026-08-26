using Microsoft.EntityFrameworkCore;
using Drones;

public class DroneContext : DbContext
{
    public DroneContext(DbContextOptions<DroneContext> options) : base(options)
    {
    }

    public DbSet<BaseDrone> Drones { get; set; }
    public DbSet<DroneBase> Bases { get; set; }
    public DbSet<DroneModel> DroneModels { get; set; }

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
            .WithOne(d => d.HomeBase)
            .HasForeignKey(d => d.DroneBaseId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<DroneBase>()
            .HasMany(b => b.ParkedDrones)
            .WithOne(d => d.ParkedAtBase)
            .HasForeignKey(d => d.ParkedAtBaseId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<BaseDrone>()
            .HasDiscriminator<DroneKind>("Kind")
            .HasValue<DeliveryDrone>(DroneKind.Delivery)
            .HasValue<SurveyDrone>(DroneKind.Survey)
            .HasValue<ReconDrone>(DroneKind.Recon)
            .HasValue<CombatDrone>(DroneKind.Combat);

        modelBuilder.Entity<BaseDrone>()
            .HasOne(d => d.DroneModel)
            .WithMany()
            .HasForeignKey(d => d.DroneModelId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<BaseDrone>()
            .Navigation(d => d.DroneModel)
            .AutoInclude();

        modelBuilder.Entity<DroneModel>()
            .HasIndex(m => m.Name)
            .IsUnique();

        modelBuilder.Entity<DroneModel>().HasData(
            new DroneModel
            {
                Id = 1,
                Name = "Wingcopter198",
                Kind = DroneKind.Delivery,
                Category = DroneCategory.Civilian,
                ImagePath = "Images/DroneModels/Wingcopter198.png",
                MaxHorizontalSpeed = 240f,
                MaxVerticalSpeed = 15f,
                MaxAltitude = 4000f,
                BatteryCapacity = 12000f,
            },
            new DroneModel
            {
                Id = 2,
                Name = "MatternetM2",
                Kind = DroneKind.Delivery,
                Category = DroneCategory.Civilian,
                ImagePath = "Images/DroneModels/MatternetM2.jpg",
                MaxHorizontalSpeed = 70f,
                MaxVerticalSpeed = 5f,
                MaxAltitude = 120f,
                BatteryCapacity = 5000f,
            },
            new DroneModel
            {
                Id = 3,
                Name = "Phantom4RTK",
                Kind = DroneKind.Survey,
                Category = DroneCategory.Civilian,
                ImagePath = "Images/DroneModels/Phantom4RTK.jpeg",
                MaxHorizontalSpeed = 72f,
                MaxVerticalSpeed = 6f,
                MaxAltitude = 6000f,
                BatteryCapacity = 5870f,
            },
            new DroneModel
            {
                Id = 4,
                Name = "MavicEnterprise",
                Kind = DroneKind.Survey,
                Category = DroneCategory.Civilian,
                ImagePath = "Images/DroneModels/MavicEnterprise.jpg",
                MaxHorizontalSpeed = 72f,
                MaxVerticalSpeed = 6f,
                MaxAltitude = 6000f,
                BatteryCapacity = 5000f,
            },
            new DroneModel
            {
                Id = 5,
                Name = "BayraktarTB2",
                Kind = DroneKind.Recon,
                Category = DroneCategory.Military,
                ImagePath = "Images/DroneModels/BayraktarTB2.jpeg",
                MaxHorizontalSpeed = 220f,
                MaxVerticalSpeed = 12f,
                MaxAltitude = 8200f,
                BatteryCapacity = 20000f,
            },
            new DroneModel
            {
                Id = 6,
                Name = "Heron1",
                Kind = DroneKind.Recon,
                Category = DroneCategory.Military,
                ImagePath = "Images/DroneModels/Heron1.jpeg",
                MaxHorizontalSpeed = 207f,
                MaxVerticalSpeed = 10f,
                MaxAltitude = 10000f,
                BatteryCapacity = 25000f,
            },
            new DroneModel
            {
                Id = 7,
                Name = "MQ9Reaper",
                Kind = DroneKind.Combat,
                Category = DroneCategory.Military,
                ImagePath = "Images/DroneModels/MQ9Reaper.jpeg",
                MaxHorizontalSpeed = 482f,
                MaxVerticalSpeed = 25f,
                MaxAltitude = 15000f,
                BatteryCapacity = 30000f,
            },
            new DroneModel
            {
                Id = 8,
                Name = "BayraktarAkinci",
                Kind = DroneKind.Combat,
                Category = DroneCategory.Military,
                ImagePath = "Images/DroneModels/BayraktarAkinci.jpeg",
                MaxHorizontalSpeed = 361f,
                MaxVerticalSpeed = 20f,
                MaxAltitude = 12000f,
                BatteryCapacity = 28000f,
            });
    }
}
