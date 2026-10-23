using MarkQ.GMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MarkQ.GMS.Infrastructure.Persistence.Configurations;

public class UserBranchConfiguration : IEntityTypeConfiguration<UserBranch>
{
    public void Configure(EntityTypeBuilder<UserBranch> b)
    {
        b.ToTable("user_branches");
        b.HasKey(x => x.Id);
        b.HasIndex(x => new { x.UserId, x.BranchId }).IsUnique();

        b.HasOne(x => x.Branch!).WithMany()
            .HasForeignKey(x => x.BranchId).OnDelete(DeleteBehavior.Cascade);
    }
}
