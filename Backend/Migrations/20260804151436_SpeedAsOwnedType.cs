using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Drone_Fleet_Monitor.Migrations
{
    /// <inheritdoc />
    public partial class SpeedAsOwnedType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Speed",
                table: "Drones",
                newName: "CurrentSpeed_Vertical");

            migrationBuilder.AddColumn<float>(
                name: "CurrentSpeed_Horizontal",
                table: "Drones",
                type: "real",
                nullable: false,
                defaultValue: 0f);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CurrentSpeed_Horizontal",
                table: "Drones");

            migrationBuilder.RenameColumn(
                name: "CurrentSpeed_Vertical",
                table: "Drones",
                newName: "Speed");
        }
    }
}
