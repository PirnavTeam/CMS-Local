using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Adminclinic.Migrations
{
    /// <inheritdoc />
    public partial class AddDoctorPhoto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PhotoPath",
                table: "Doctors",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PhotoPath",
                table: "Doctors");
        }
    }
}
