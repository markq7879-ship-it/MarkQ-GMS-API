using MarkQ.GMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MarkQ.GMS.Infrastructure.Persistence.Configurations;

public class MembershipPlanConfiguration : IEntityTypeConfiguration<MembershipPlan>
{
    public void Configure(EntityTypeBuilder<MembershipPlan> b)
    {
        b.ToTable("membership_plans");
        b.HasKey(x => x.Id);

        b.Property(x => x.Name).HasMaxLength(200).IsRequired();
        b.Property(x => x.DurationDays).IsRequired();
        b.Property(x => x.BasePrice).HasColumnType("numeric(12,2)");
        b.Property(x => x.RegistrationFee).HasColumnType("numeric(12,2)");
        b.Property(x => x.Discount).HasColumnType("numeric(12,2)");
        b.Property(x => x.GstPercent).HasColumnType("numeric(5,2)");
        b.Property(x => x.GstIncluded).IsRequired();
        b.Property(x => x.FreezeEligible).IsRequired();
        b.Property(x => x.MaxFreezeDays).IsRequired();
        b.Property(x => x.IsActive).IsRequired();

        b.HasIndex(x => new { x.OrganizationId, x.Name }).IsUnique();
    }
}
