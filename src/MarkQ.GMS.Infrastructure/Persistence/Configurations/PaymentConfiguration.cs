using MarkQ.GMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MarkQ.GMS.Infrastructure.Persistence.Configurations;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> b)
    {
        b.ToTable("payments");
        b.HasKey(x => x.Id);

        b.Property(x => x.ReceiptNumber).HasMaxLength(40).IsRequired();
        b.Property(x => x.Amount).HasColumnType("numeric(12,2)").IsRequired();
        b.Property(x => x.Method).HasMaxLength(30).IsRequired();
        b.Property(x => x.Reference).HasMaxLength(100);
        b.Property(x => x.PaidAt).IsRequired();
        b.Property(x => x.Status).HasMaxLength(30).IsRequired();
        b.Property(x => x.ReceivedByName).HasMaxLength(200).IsRequired();
        b.Property(x => x.VoidReason).HasMaxLength(500);
        b.Property(x => x.VoidedByName).HasMaxLength(200);
        b.Property(x => x.Notes).HasMaxLength(2000);

        b.HasIndex(x => new { x.OrganizationId, x.ReceiptNumber }).IsUnique();
        b.HasIndex(x => new { x.OrganizationId, x.MembershipId });
        b.HasIndex(x => new { x.OrganizationId, x.MemberId });
        b.HasIndex(x => new { x.OrganizationId, x.BranchId });
        b.HasIndex(x => new { x.OrganizationId, x.PaidAt });

        b.HasOne(x => x.Membership!).WithMany()
            .HasForeignKey(x => x.MembershipId).OnDelete(DeleteBehavior.Restrict);

        b.HasOne(x => x.Member!).WithMany()
            .HasForeignKey(x => x.MemberId).OnDelete(DeleteBehavior.Restrict);

        b.HasOne(x => x.Branch!).WithMany()
            .HasForeignKey(x => x.BranchId).OnDelete(DeleteBehavior.Restrict);
    }
}
