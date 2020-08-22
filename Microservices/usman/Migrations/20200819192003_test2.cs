using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace dotnetapi.Migrations
{
    public partial class test2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "MasterCredHash",
                table: "Users",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MasterCredHash",
                table: "Users");
        }
    }
}
