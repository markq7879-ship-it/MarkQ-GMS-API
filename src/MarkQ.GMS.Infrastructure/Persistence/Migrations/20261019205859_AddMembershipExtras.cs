using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MarkQ.GMS.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddMembershipExtras : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DiscountReason",
                table: "memberships",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "EndDateOverridden",
                table: "memberships",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "EndDateOverrideReason",
                table: "memberships",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MembershipNumber",
                table: "memberships",
                type: "character varying(40)",
                maxLength: 40,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "memberships",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "PaymentDueDate",
                table: "memberships",
                type: "date",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_memberships_OrganizationId_MembershipNumber",
                table: "memberships",
                columns: new[] { "OrganizationId", "MembershipNumber" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_memberships_OrganizationId_MembershipNumber",
                table: "memberships");

            migrationBuilder.DropColumn(
                name: "DiscountReason",
                table: "memberships");

            migrationBuilder.DropColumn(
                name: "EndDateOverridden",
                table: "memberships");

            migrationBuilder.DropColumn(
                name: "EndDateOverrideReason",
                table: "memberships");

            migrationBuilder.DropColumn(
                name: "MembershipNumber",
                table: "memberships");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "memberships");

            migrationBuilder.DropColumn(
                name: "PaymentDueDate",
                table: "memberships");
        }
    }
}
