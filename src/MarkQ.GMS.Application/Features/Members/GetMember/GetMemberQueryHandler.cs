using MarkQ.GMS.Application.Abstractions;
using MarkQ.GMS.Application.Common.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace MarkQ.GMS.Application.Features.Members.GetMember;

public class GetMemberQueryHandler : IRequestHandler<GetMemberQuery, MemberDto>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IDateTimeProvider _clock;

    public GetMemberQueryHandler(IAppDbContext db, ICurrentUserService cu, IDateTimeProvider clock)
    {
        _db = db; _currentUser = cu; _clock = clock;
    }

    public async Task<MemberDto> Handle(GetMemberQuery request, CancellationToken ct)
    {
        if (_currentUser.UserId is null)
            throw new UnauthorizedAccessException("Not authenticated.");

        var me = await _db.Users.FirstAsync(u => u.Id == _currentUser.UserId.Value, ct);

        var m = await _db.Members.Include(x => x.Branch)
            .FirstOrDefaultAsync(x => x.Id == request.Id && x.OrganizationId == me.OrganizationId, ct)
            ?? throw new NotFoundException("Member not found.");

        if (!_currentUser.IsOwner && !_currentUser.BranchIds.Contains(m.BranchId))
            throw new ForbiddenException("You do not have access to this member.");

        var today = DateOnly.FromDateTime(_clock.UtcNow);
        var hasActiveMembership = await _db.Memberships.AnyAsync(x =>
            x.MemberId == m.Id && x.CancelledAt == null && x.EndDate >= today, ct);

        var hasAnyMembership = await _db.Memberships.AnyAsync(x => x.MemberId == m.Id, ct);

        string status;
        if (m.CancelledAt.HasValue) status = "CANCELLED";
        else if (!m.IsActive) status = "INACTIVE";
        else if (hasActiveMembership) status = "ACTIVE";
        else if (hasAnyMembership) status = "EXPIRED";
        else status = "NO_MEMBERSHIP";

        return new MemberDto(
            m.Id, m.MemberCode, m.FullName, m.FatherFullName, m.Mobile, m.WhatsApp, m.Email,
            m.DateOfBirth, m.Gender, m.BloodGroup, m.MaritalStatus, m.Occupation,
            m.Address, m.City, m.Pincode,
            m.IdProofType, m.IdProofNumber,
            m.EmergencyContactName, m.EmergencyContactRelation, m.EmergencyContactPhone,
            m.ReferredBy, m.Notes,
            m.BranchId, m.Branch?.Name ?? "", status,
            m.PhotoBase64, m.PhotoContentType,
            m.CreatedAt,
            m.CancelledAt, m.CancelReason, m.CancelledByName);
    }
}
