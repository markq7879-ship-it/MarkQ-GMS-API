using MarkQ.GMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MarkQ.GMS.Infrastructure.Persistence.Configurations;

public class MembershipConfiguration : IEntityTypeConfiguration<Membership>
{
    public void Configure(EntityTypeBuilder<Membership> b)
    {
        b.ToTable("memberships");
        b.HasKey(x => x.Id);

        b.Property(x => x.MembershipNumber).HasMaxLength(40).IsRequired();
        b.Property(x => x.StartDate).IsRequired();
        b.Property(x => x.EndDate).IsRequired();
        b.Property(x => x.FreezeReason).HasMaxLength(500);
        b.Property(x => x.CancelReason).HasMaxLength(500);
        b.Property(x => x.DiscountReason).HasMaxLength(500);
        b.Property(x => x.EndDateOverrideReason).HasMaxLength(500);
        b.Property(x => x.Notes).HasMaxLength(2000);

        b.Property(x => x.PriceAtPurchase).HasColumnType("numeric(12,2)");
        b.Property(x => x.RegistrationFeeAtPurchase).HasColumnType("numeric(12,2)");
        b.Property(x => x.DiscountAtPurchase).HasColumnType("numeric(12,2)");
        b.Property(x => x.GstPercentAtPurchase).HasColumnType("numeric(5,2)");
        b.Property(x => x.TotalPayable).HasColumnType("numeric(12,2)");

        b.HasIndex(x => new { x.OrganizationId, x.MembershipNumber }).IsUnique();
        b.HasIndex(x => new { x.OrganizationId, x.MemberId });
        b.HasIndex(x => new { x.OrganizationId, x.EndDate });

        b.HasOne(x => x.Member!).WithMany()
            .HasForeignKey(x => x.MemberId).OnDelete(DeleteBehavior.Restrict);

        b.HasOne(x => x.Plan!).WithMany()
            .HasForeignKey(x => x.PlanId).OnDelete(DeleteBehavior.Restrict);
    }
}
