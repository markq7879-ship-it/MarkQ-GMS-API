using MarkQ.GMS.Application.Abstractions;
using MarkQ.GMS.Application.Common.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace MarkQ.GMS.Application.Features.Members.ReactivateMember;

public class ReactivateMemberCommandHandler : IRequestHandler<ReactivateMemberCommand, MemberDto>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IDateTimeProvider _clock;

    public ReactivateMemberCommandHandler(IAppDbContext db, ICurrentUserService cu, IDateTimeProvider clock)
    {
        _db = db; _currentUser = cu; _clock = clock;
    }

    public async Task<MemberDto> Handle(ReactivateMemberCommand r, CancellationToken ct)
    {
        if (_currentUser.UserId is null)
            throw new UnauthorizedAccessException("Not authenticated.");

        var me = await _db.Users.FirstAsync(u => u.Id == _currentUser.UserId.Value, ct);

        var member = await _db.Members.Include(m => m.Branch)
            .FirstOrDefaultAsync(m => m.Id == r.Id && m.OrganizationId == me.OrganizationId, ct)
            ?? throw new NotFoundException("Member not found.");

        if (!_currentUser.IsOwner && !_currentUser.BranchIds.Contains(member.BranchId))
            throw new ForbiddenException("You do not have access to this member.");

        if (!member.CancelledAt.HasValue)
            throw new ConflictException("This member is not cancelled.");

        member.CancelledAt = null;
        member.CancelReason = null;
        member.CancelledByUserId = null;
        member.CancelledByName = null;
        member.IsActive = true;

        await _db.SaveChangesAsync(ct);

        var today = DateOnly.FromDateTime(_clock.UtcNow);
        var hasActiveMembership = await _db.Memberships.AnyAsync(x =>
            x.MemberId == member.Id && x.CancelledAt == null && x.EndDate >= today, ct);

        var hasAnyMembership = await _db.Memberships.AnyAsync(x => x.MemberId == member.Id, ct);

        string status;
        if (hasActiveMembership) status = "ACTIVE";
        else if (hasAnyMembership) status = "EXPIRED";
        else status = "NO_MEMBERSHIP";

        return new MemberDto(
            member.Id, member.MemberCode, member.FullName, member.FatherFullName, member.Mobile,
            member.WhatsApp, member.Email, member.DateOfBirth, member.Gender, member.BloodGroup,
            member.MaritalStatus, member.Occupation, member.Address, member.City, member.Pincode,
            member.IdProofType, member.IdProofNumber,
            member.EmergencyContactName, member.EmergencyContactRelation, member.EmergencyContactPhone,
            member.ReferredBy, member.Notes,
            member.BranchId, member.Branch?.Name ?? "", status,
            member.PhotoBase64, member.PhotoContentType,
            member.CreatedAt,
            null, null, null);
    }
}
