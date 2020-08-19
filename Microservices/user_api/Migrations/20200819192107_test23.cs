using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace dotnetapi.Migrations
{
    public partial class test23 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MasterCredHash",
                table: "Users");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "MasterCredHash",
                table: "Users",
                type: "varbinary(max)",
                nullable: true);
        }
    }
}
