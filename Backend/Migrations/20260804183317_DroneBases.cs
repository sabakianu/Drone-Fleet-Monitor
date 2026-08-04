using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Drone_Fleet_Monitor.Migrations
{
    /// <inheritdoc />
    public partial class DroneBases : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DroneBaseId",
                table: "Drones",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Bases",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    CurrentLocation_Latitude = table.Column<float>(type: "real", nullable: false),
                    CurrentLocation_Longitude = table.Column<float>(type: "real", nullable: false),
                    CurrentLocation_Altitude = table.Column<float>(type: "real", nullable: false),
                    MaxDroneCapacity = table.Column<int>(type: "integer", nullable: false),
                    Category = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bases", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Drones_DroneBaseId",
                table: "Drones",
                column: "DroneBaseId");

            migrationBuilder.AddForeignKey(
                name: "FK_Drones_Bases_DroneBaseId",
                table: "Drones",
                column: "DroneBaseId",
                principalTable: "Bases",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Drones_Bases_DroneBaseId",
                table: "Drones");

            migrationBuilder.DropTable(
                name: "Bases");

            migrationBuilder.DropIndex(
                name: "IX_Drones_DroneBaseId",
                table: "Drones");

            migrationBuilder.DropColumn(
                name: "DroneBaseId",
                table: "Drones");
        }
    }
}
