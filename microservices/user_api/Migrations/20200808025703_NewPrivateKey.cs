using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace dotnetapi.Migrations
{
    public partial class NewPrivateKey : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PublicCredKey",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ValueHash",
                table: "Credentials");

            migrationBuilder.AddColumn<byte[]>(
                name: "MasterAesKeyEnc",
                table: "Users",
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "MasterCredIV",
                table: "Users",
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "MasterCredSalt",
                table: "Users",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AesIV",
                table: "Credentials",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AesValue",
                table: "Credentials",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MasterAesKeyEnc",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "MasterCredIV",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "MasterCredSalt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "AesIV",
                table: "Credentials");

            migrationBuilder.DropColumn(
                name: "AesValue",
                table: "Credentials");

            migrationBuilder.AddColumn<string>(
                name: "PublicCredKey",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ValueHash",
                table: "Credentials",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
