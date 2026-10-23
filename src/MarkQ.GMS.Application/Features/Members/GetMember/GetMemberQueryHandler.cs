using MarkQ.GMS.Application.Abstractions;
using MarkQ.GMS.Application.Common.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace MarkQ.GMS.Application.Features.Members.GetMember;

public class GetMemberQueryHandler : IRequestHandler<GetMemberQuery, MemberDto>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetMemberQueryHandler(IAppDbContext db, ICurrentUserService cu)
    {
        _db = db; _currentUser = cu;
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

        return new MemberDto(
            m.Id, m.MemberCode, m.FullName, m.FatherFullName, m.Mobile, m.WhatsApp, m.Email,
            m.DateOfBirth, m.Gender, m.BloodGroup, m.MaritalStatus, m.Occupation,
            m.Address, m.City, m.Pincode,
            m.IdProofType, m.IdProofNumber,
            m.EmergencyContactName, m.EmergencyContactRelation, m.EmergencyContactPhone,
            m.ReferredBy, m.Notes,
            m.BranchId, m.Branch?.Name ?? "", "NO_MEMBERSHIP",
            m.PhotoBase64, m.PhotoContentType,
            m.CreatedAt);
    }
}
