using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Drone_Fleet_Monitor.Migrations
{
    /// <inheritdoc />
    public partial class ParkingCapacity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ParkedAtBaseId",
                table: "Drones",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MaxParkingCapacity",
                table: "Bases",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Drones_ParkedAtBaseId",
                table: "Drones",
                column: "ParkedAtBaseId");

            migrationBuilder.AddForeignKey(
                name: "FK_Drones_Bases_ParkedAtBaseId",
                table: "Drones",
                column: "ParkedAtBaseId",
                principalTable: "Bases",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            // Bazele existente primesc cateva locuri de parcare peste
            // capacitatea de drone asignate, ca sa poata primi si vizitatori.
            migrationBuilder.Sql(
                @"UPDATE ""Bases"" SET ""MaxParkingCapacity"" = ""MaxDroneCapacity"" + 2;");

            // Pana acum ""parcata"" insemna ca drona sta pe coordonatele bazei
            // ei. Transformam regula veche in noua coloana explicita.
            migrationBuilder.Sql(
                @"UPDATE ""Drones"" d
                  SET ""ParkedAtBaseId"" = b.""Id""
                  FROM ""Bases"" b
                  WHERE b.""Id"" = d.""DroneBaseId""
                    AND abs(d.""CurrentLocation_Latitude""  - b.""CurrentLocation_Latitude"")  < 0.0001
                    AND abs(d.""CurrentLocation_Longitude"" - b.""CurrentLocation_Longitude"") < 0.0001
                    AND abs(d.""CurrentLocation_Altitude""  - b.""CurrentLocation_Altitude"")  < 0.5;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Drones_Bases_ParkedAtBaseId",
                table: "Drones");

            migrationBuilder.DropIndex(
                name: "IX_Drones_ParkedAtBaseId",
                table: "Drones");

            migrationBuilder.DropColumn(
                name: "ParkedAtBaseId",
                table: "Drones");

            migrationBuilder.DropColumn(
                name: "MaxParkingCapacity",
                table: "Bases");
        }
    }
}
