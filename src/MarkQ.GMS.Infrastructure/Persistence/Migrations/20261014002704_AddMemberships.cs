using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MarkQ.GMS.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddMemberships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "memberships",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uuid", nullable: false),
                    MemberId = table.Column<Guid>(type: "uuid", nullable: false),
                    PlanId = table.Column<Guid>(type: "uuid", nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: false),
                    FrozenFrom = table.Column<DateOnly>(type: "date", nullable: true),
                    FrozenTo = table.Column<DateOnly>(type: "date", nullable: true),
                    FreezeReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CancelledAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CancelReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    PriceAtPurchase = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    RegistrationFeeAtPurchase = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    DiscountAtPurchase = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    GstPercentAtPurchase = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    GstIncludedAtPurchase = table.Column<bool>(type: "boolean", nullable: false),
                    TotalPayable = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_memberships", x => x.Id);
                    table.ForeignKey(
                        name: "FK_memberships_members_MemberId",
                        column: x => x.MemberId,
                        principalTable: "members",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_memberships_membership_plans_PlanId",
                        column: x => x.PlanId,
                        principalTable: "membership_plans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_memberships_organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalTable: "organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_memberships_MemberId",
                table: "memberships",
                column: "MemberId");

            migrationBuilder.CreateIndex(
                name: "IX_memberships_OrganizationId_EndDate",
                table: "memberships",
                columns: new[] { "OrganizationId", "EndDate" });

            migrationBuilder.CreateIndex(
                name: "IX_memberships_OrganizationId_MemberId",
                table: "memberships",
                columns: new[] { "OrganizationId", "MemberId" });

            migrationBuilder.CreateIndex(
                name: "IX_memberships_PlanId",
                table: "memberships",
                column: "PlanId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "memberships");
        }
    }
}
