using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Drone_Fleet_Monitor.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Drones",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CurrentLocation_Latitude = table.Column<float>(type: "real", nullable: false),
                    CurrentLocation_Longitude = table.Column<float>(type: "real", nullable: false),
                    BatteryLevel = table.Column<float>(type: "real", nullable: false),
                    Altitude = table.Column<float>(type: "real", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Speed = table.Column<float>(type: "real", nullable: false),
                    Discriminator = table.Column<string>(type: "character varying(13)", maxLength: 13, nullable: false),
                    EncryptionKey = table.Column<string>(type: "text", nullable: true),
                    RegistrationNumber = table.Column<string>(type: "text", nullable: true),
                    ReconDrone_EncryptionKey = table.Column<string>(type: "text", nullable: true),
                    SurveyDrone_RegistrationNumber = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Drones", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Drones");
        }
    }
}
