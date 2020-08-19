using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace dotnetapi.Migrations
{
    public partial class test : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MasterAesKeyEnc",
                table: "Users");

            migrationBuilder.AddColumn<byte[]>(
                name: "MasterKeyAesEnc",
                table: "Users",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MasterKeyAesEnc",
                table: "Users");

            migrationBuilder.AddColumn<byte[]>(
                name: "MasterAesKeyEnc",
                table: "Users",
                type: "varbinary(max)",
                nullable: true);
        }
    }
}
