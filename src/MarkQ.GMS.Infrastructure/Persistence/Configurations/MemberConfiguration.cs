using MarkQ.GMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MarkQ.GMS.Infrastructure.Persistence.Configurations;

public class MemberConfiguration : IEntityTypeConfiguration<Member>
{
    public void Configure(EntityTypeBuilder<Member> b)
    {
        b.ToTable("members");
        b.HasKey(x => x.Id);

        b.Property(x => x.MemberCode).HasMaxLength(40).IsRequired();
        b.Property(x => x.FullName).HasMaxLength(200).IsRequired();
        b.Property(x => x.FatherFullName).HasMaxLength(200);
        b.Property(x => x.Mobile).HasMaxLength(20).IsRequired();
        b.Property(x => x.WhatsApp).HasMaxLength(20);
        b.Property(x => x.Email).HasMaxLength(320);
        b.Property(x => x.Gender).HasMaxLength(10);
        b.Property(x => x.BloodGroup).HasMaxLength(10);
        b.Property(x => x.MaritalStatus).HasMaxLength(20);
        b.Property(x => x.Occupation).HasMaxLength(100);
        b.Property(x => x.Address).HasMaxLength(500);
        b.Property(x => x.City).HasMaxLength(100);
        b.Property(x => x.Pincode).HasMaxLength(20);
        b.Property(x => x.IdProofType).HasMaxLength(30);
        b.Property(x => x.IdProofNumber).HasMaxLength(50);
        b.Property(x => x.EmergencyContactName).HasMaxLength(200);
        b.Property(x => x.EmergencyContactRelation).HasMaxLength(50);
        b.Property(x => x.EmergencyContactPhone).HasMaxLength(20);
        b.Property(x => x.ReferredBy).HasMaxLength(200);
        b.Property(x => x.Notes).HasMaxLength(2000);
        b.Property(x => x.IsActive).IsRequired();

        b.Property(x => x.PhotoBase64).HasColumnType("text");
        b.Property(x => x.PhotoContentType).HasMaxLength(50);

        b.Property(x => x.CancelReason).HasMaxLength(500);
        b.Property(x => x.CancelledByName).HasMaxLength(200);

        b.HasIndex(x => new { x.OrganizationId, x.MemberCode }).IsUnique();
        b.HasIndex(x => new { x.OrganizationId, x.Mobile });
        b.HasIndex(x => new { x.OrganizationId, x.CancelledAt });

        b.HasOne(x => x.Branch!).WithMany()
            .HasForeignKey(x => x.BranchId).OnDelete(DeleteBehavior.Restrict);
    }
}
