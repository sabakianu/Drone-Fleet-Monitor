using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Drone_Fleet_Monitor.Migrations
{
    /// <inheritdoc />
    public partial class DroneModelHierarchy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Discriminator",
                table: "Drones");

            migrationBuilder.DropColumn(
                name: "ReconDrone_EncryptionKey",
                table: "Drones");

            migrationBuilder.DropColumn(
                name: "SurveyDrone_RegistrationNumber",
                table: "Drones");

            migrationBuilder.RenameColumn(
                name: "Altitude",
                table: "Drones",
                newName: "CurrentLocation_Altitude");

            migrationBuilder.AddColumn<int>(
                name: "Category",
                table: "Drones",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Kind",
                table: "Drones",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Model",
                table: "Drones",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Drones",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Category",
                table: "Drones");

            migrationBuilder.DropColumn(
                name: "Kind",
                table: "Drones");

            migrationBuilder.DropColumn(
                name: "Model",
                table: "Drones");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "Drones");

            migrationBuilder.RenameColumn(
                name: "CurrentLocation_Altitude",
                table: "Drones",
                newName: "Altitude");

            migrationBuilder.AddColumn<string>(
                name: "Discriminator",
                table: "Drones",
                type: "character varying(13)",
                maxLength: 13,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ReconDrone_EncryptionKey",
                table: "Drones",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SurveyDrone_RegistrationNumber",
                table: "Drones",
                type: "text",
                nullable: true);
        }
    }
}
