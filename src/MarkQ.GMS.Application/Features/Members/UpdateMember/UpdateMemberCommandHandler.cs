using MarkQ.GMS.Application.Abstractions;
using MarkQ.GMS.Application.Common.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace MarkQ.GMS.Application.Features.Members.UpdateMember;

public class UpdateMemberCommandHandler : IRequestHandler<UpdateMemberCommand, MemberDto>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdateMemberCommandHandler(IAppDbContext db, ICurrentUserService cu)
    {
        _db = db; _currentUser = cu;
    }

    public async Task<MemberDto> Handle(UpdateMemberCommand request, CancellationToken ct)
    {
        if (_currentUser.UserId is null)
            throw new UnauthorizedAccessException("Not authenticated.");

        var me = await _db.Users.FirstAsync(u => u.Id == _currentUser.UserId.Value, ct);

        var member = await _db.Members.Include(m => m.Branch)
            .FirstOrDefaultAsync(m => m.Id == request.Id && m.OrganizationId == me.OrganizationId, ct)
            ?? throw new NotFoundException("Member not found.");

        if (!_currentUser.IsOwner && !_currentUser.BranchIds.Contains(member.BranchId))
            throw new ForbiddenException("You do not have access to this member.");

        var branch = await _db.Branches
            .FirstOrDefaultAsync(b => b.Id == request.BranchId && b.OrganizationId == me.OrganizationId, ct)
            ?? throw new NotFoundException("Branch not found.");

        if (!_currentUser.IsOwner && !_currentUser.BranchIds.Contains(branch.Id))
            throw new ForbiddenException("You do not have access to this branch.");

        // Duplicate mobile check (excluding self)
        var normalizedMobile = NormalizeMobile(request.Mobile);
        var dup = await _db.Members
            .Where(m => m.OrganizationId == me.OrganizationId && m.Id != member.Id && m.Mobile == normalizedMobile)
            .Select(m => new { m.MemberCode, m.FullName })
            .FirstOrDefaultAsync(ct);
        if (dup is not null)
            throw new ConflictException(
                $"Another member with this mobile number exists ({dup.MemberCode} · {dup.FullName}).");

        member.FullName = request.FullName.Trim();
        member.FatherFullName = Clean(request.FatherFullName);
        member.Mobile = normalizedMobile;
        member.WhatsApp = string.IsNullOrWhiteSpace(request.WhatsApp) ? null : NormalizeMobile(request.WhatsApp);
        member.Email = Clean(request.Email);
        member.DateOfBirth = request.DateOfBirth;
        member.Gender = Clean(request.Gender);
        member.BloodGroup = Clean(request.BloodGroup);
        member.MaritalStatus = Clean(request.MaritalStatus);
        member.Occupation = Clean(request.Occupation);
        member.Address = Clean(request.Address);
        member.City = Clean(request.City);
        member.Pincode = Clean(request.Pincode);
        member.IdProofType = Clean(request.IdProofType);
        member.IdProofNumber = Clean(request.IdProofNumber);
        member.EmergencyContactName = Clean(request.EmergencyContactName);
        member.EmergencyContactRelation = Clean(request.EmergencyContactRelation);
        member.EmergencyContactPhone = Clean(request.EmergencyContactPhone);
        member.ReferredBy = Clean(request.ReferredBy);
        member.Notes = Clean(request.Notes);
        member.BranchId = branch.Id;
        member.PhotoBase64 = Clean(request.PhotoBase64);
        member.PhotoContentType = Clean(request.PhotoContentType);

        await _db.SaveChangesAsync(ct);

        return new MemberDto(
            member.Id, member.MemberCode, member.FullName, member.FatherFullName, member.Mobile,
            member.WhatsApp, member.Email, member.DateOfBirth, member.Gender, member.BloodGroup,
            member.MaritalStatus, member.Occupation, member.Address, member.City, member.Pincode,
            member.IdProofType, member.IdProofNumber,
            member.EmergencyContactName, member.EmergencyContactRelation, member.EmergencyContactPhone,
            member.ReferredBy, member.Notes,
            branch.Id, branch.Name, "NO_MEMBERSHIP",
            member.PhotoBase64, member.PhotoContentType,
            member.CreatedAt);
    }

    private static string? Clean(string? s) => string.IsNullOrWhiteSpace(s) ? null : s.Trim();
    private static string NormalizeMobile(string mobile) =>
        new string(mobile.Where(c => char.IsDigit(c) || c == '+').ToArray());
}
