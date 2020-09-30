using Microsoft.EntityFrameworkCore.Migrations;

namespace dotnetapi.Migrations
{
    public partial class newJWTBlacklist : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RefreshToken",
                table: "BlacklistJwts");

            migrationBuilder.AddColumn<int>(
                name: "LoginId",
                table: "BlacklistJwts",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "BlacklistJwts",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LoginId",
                table: "BlacklistJwts");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "BlacklistJwts");

            migrationBuilder.AddColumn<string>(
                name: "RefreshToken",
                table: "BlacklistJwts",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
