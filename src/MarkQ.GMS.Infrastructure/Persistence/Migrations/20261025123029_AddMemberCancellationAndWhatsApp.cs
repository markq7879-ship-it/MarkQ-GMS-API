using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MarkQ.GMS.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddMemberCancellationAndWhatsApp : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ExpiryReminderSentAt",
                table: "memberships",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CancelReason",
                table: "members",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CancelledAt",
                table: "members",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CancelledByName",
                table: "members",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CancelledByUserId",
                table: "members",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_members_OrganizationId_CancelledAt",
                table: "members",
                columns: new[] { "OrganizationId", "CancelledAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_members_OrganizationId_CancelledAt",
                table: "members");

            migrationBuilder.DropColumn(
                name: "ExpiryReminderSentAt",
                table: "memberships");

            migrationBuilder.DropColumn(
                name: "CancelReason",
                table: "members");

            migrationBuilder.DropColumn(
                name: "CancelledAt",
                table: "members");

            migrationBuilder.DropColumn(
                name: "CancelledByName",
                table: "members");

            migrationBuilder.DropColumn(
                name: "CancelledByUserId",
                table: "members");
        }
    }
}
