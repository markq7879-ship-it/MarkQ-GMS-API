using MarkQ.GMS.Application.Abstractions;
using MarkQ.GMS.Application.Common.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace MarkQ.GMS.Application.Features.Members.CancelMember;

public class CancelMemberCommandHandler : IRequestHandler<CancelMemberCommand, MemberDto>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IDateTimeProvider _clock;

    public CancelMemberCommandHandler(IAppDbContext db, ICurrentUserService cu, IDateTimeProvider clock)
    {
        _db = db; _currentUser = cu; _clock = clock;
    }

    public async Task<MemberDto> Handle(CancelMemberCommand r, CancellationToken ct)
    {
        if (_currentUser.UserId is null)
            throw new UnauthorizedAccessException("Not authenticated.");

        var me = await _db.Users.FirstAsync(u => u.Id == _currentUser.UserId.Value, ct);

        var member = await _db.Members.Include(m => m.Branch)
            .FirstOrDefaultAsync(m => m.Id == r.Id && m.OrganizationId == me.OrganizationId, ct)
            ?? throw new NotFoundException("Member not found.");

        if (!_currentUser.IsOwner && !_currentUser.BranchIds.Contains(member.BranchId))
            throw new ForbiddenException("You do not have access to this member.");

        if (member.CancelledAt.HasValue)
            throw new ConflictException("This member is already cancelled.");

        var now = _clock.UtcNow;
        var reason = r.Reason.Trim();

        member.CancelledAt = now;
        member.CancelReason = reason;
        member.CancelledByUserId = me.Id;
        member.CancelledByName = me.FullName;
        member.IsActive = false;

        // Auto-cancel active memberships
        var activeMemberships = await _db.Memberships
            .Where(x => x.MemberId == member.Id && x.CancelledAt == null)
            .ToListAsync(ct);

        foreach (var ms in activeMemberships)
        {
            ms.CancelledAt = now;
            ms.CancelReason = $"Member cancelled: {reason}";
        }

        await _db.SaveChangesAsync(ct);

        return new MemberDto(
            member.Id, member.MemberCode, member.FullName, member.FatherFullName, member.Mobile,
            member.WhatsApp, member.Email, member.DateOfBirth, member.Gender, member.BloodGroup,
            member.MaritalStatus, member.Occupation, member.Address, member.City, member.Pincode,
            member.IdProofType, member.IdProofNumber,
            member.EmergencyContactName, member.EmergencyContactRelation, member.EmergencyContactPhone,
            member.ReferredBy, member.Notes,
            member.BranchId, member.Branch?.Name ?? "", "CANCELLED",
            member.PhotoBase64, member.PhotoContentType,
            member.CreatedAt,
            member.CancelledAt, member.CancelReason, member.CancelledByName);
    }
}
