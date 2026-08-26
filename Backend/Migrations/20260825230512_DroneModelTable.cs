using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Drone_Fleet_Monitor.Migrations
{
    /// <inheritdoc />
    public partial class DroneModelTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DroneModels",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Kind = table.Column<int>(type: "integer", nullable: false),
                    Category = table.Column<int>(type: "integer", nullable: false),
                    ImagePath = table.Column<string>(type: "text", nullable: false),
                    MaxHorizontalSpeed = table.Column<float>(type: "real", nullable: false),
                    MaxVerticalSpeed = table.Column<float>(type: "real", nullable: false),
                    MaxAltitude = table.Column<float>(type: "real", nullable: false),
                    BatteryCapacity = table.Column<float>(type: "real", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DroneModels", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "DroneModels",
                columns: new[] { "Id", "BatteryCapacity", "Category", "ImagePath", "Kind", "MaxAltitude", "MaxHorizontalSpeed", "MaxVerticalSpeed", "Name" },
                values: new object[,]
                {
                    { 1, 12000f, 0, "Images/DroneModels/Wingcopter198.png", 0, 4000f, 240f, 15f, "Wingcopter198" },
                    { 2, 5000f, 0, "Images/DroneModels/MatternetM2.jpg", 0, 120f, 70f, 5f, "MatternetM2" },
                    { 3, 5870f, 0, "Images/DroneModels/Phantom4RTK.jpeg", 1, 6000f, 72f, 6f, "Phantom4RTK" },
                    { 4, 5000f, 0, "Images/DroneModels/MavicEnterprise.jpg", 1, 6000f, 72f, 6f, "MavicEnterprise" },
                    { 5, 20000f, 1, "Images/DroneModels/BayraktarTB2.jpeg", 2, 8200f, 220f, 12f, "BayraktarTB2" },
                    { 6, 25000f, 1, "Images/DroneModels/Heron1.jpeg", 2, 10000f, 207f, 10f, "Heron1" },
                    { 7, 30000f, 1, "Images/DroneModels/MQ9Reaper.jpeg", 3, 15000f, 482f, 25f, "MQ9Reaper" },
                    { 8, 28000f, 1, "Images/DroneModels/BayraktarAkinci.jpeg", 3, 12000f, 361f, 20f, "BayraktarAkinci" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_DroneModels_Name",
                table: "DroneModels",
                column: "Name",
                unique: true);

            // Category se deduce acum din rândul de model
            migrationBuilder.DropColumn(
                name: "Category",
                table: "Drones");

            migrationBuilder.RenameColumn(
                name: "Model",
                table: "Drones",
                newName: "DroneModelId");

            // coloana mai ține ordinalul vechiului enum (0..7), nu Id-ul din
            // tabel (1..8): remapăm prin nume, ca să nu depindem de ordine
            migrationBuilder.Sql(
                @"UPDATE ""Drones"" d
                  SET ""DroneModelId"" = m.""Id""
                  FROM ""DroneModels"" m
                  WHERE m.""Name"" = CASE d.""DroneModelId""
                    WHEN 0 THEN 'Wingcopter198'
                    WHEN 1 THEN 'MatternetM2'
                    WHEN 2 THEN 'Phantom4RTK'
                    WHEN 3 THEN 'MavicEnterprise'
                    WHEN 4 THEN 'BayraktarTB2'
                    WHEN 5 THEN 'Heron1'
                    WHEN 6 THEN 'MQ9Reaper'
                    WHEN 7 THEN 'BayraktarAkinci'
                  END;");

            migrationBuilder.CreateIndex(
                name: "IX_Drones_DroneModelId",
                table: "Drones",
                column: "DroneModelId");

            migrationBuilder.AddForeignKey(
                name: "FK_Drones_DroneModels_DroneModelId",
                table: "Drones",
                column: "DroneModelId",
                principalTable: "DroneModels",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Drones_DroneModels_DroneModelId",
                table: "Drones");

            migrationBuilder.AddColumn<int>(
                name: "Category",
                table: "Drones",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.Sql(
                @"UPDATE ""Drones"" d
                  SET ""Category"" = m.""Category""
                  FROM ""DroneModels"" m
                  WHERE m.""Id"" = d.""DroneModelId"";");

            migrationBuilder.Sql(
                @"UPDATE ""Drones"" d
                  SET ""DroneModelId"" = CASE m.""Name""
                    WHEN 'Wingcopter198'   THEN 0
                    WHEN 'MatternetM2'     THEN 1
                    WHEN 'Phantom4RTK'     THEN 2
                    WHEN 'MavicEnterprise' THEN 3
                    WHEN 'BayraktarTB2'    THEN 4
                    WHEN 'Heron1'          THEN 5
                    WHEN 'MQ9Reaper'       THEN 6
                    WHEN 'BayraktarAkinci' THEN 7
                  END
                  FROM ""DroneModels"" m
                  WHERE m.""Id"" = d.""DroneModelId"";");

            migrationBuilder.DropIndex(
                name: "IX_Drones_DroneModelId",
                table: "Drones");

            migrationBuilder.DropTable(
                name: "DroneModels");

            migrationBuilder.RenameColumn(
                name: "DroneModelId",
                table: "Drones",
                newName: "Model");
        }
    }
}
