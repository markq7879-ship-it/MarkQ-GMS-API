using MarkQ.GMS.Application.Abstractions;
using MarkQ.GMS.Application.Common.Exceptions;
using MarkQ.GMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace MarkQ.GMS.Application.Features.Members.CreateMember;

public class CreateMemberCommandHandler : IRequestHandler<CreateMemberCommand, MemberDto>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateMemberCommandHandler(IAppDbContext db, ICurrentUserService cu)
    {
        _db = db; _currentUser = cu;
    }

    public async Task<MemberDto> Handle(CreateMemberCommand request, CancellationToken ct)
    {
        if (_currentUser.UserId is null)
            throw new UnauthorizedAccessException("Not authenticated.");

        var me = await _db.Users.FirstAsync(u => u.Id == _currentUser.UserId.Value, ct);

        var branch = await _db.Branches
            .FirstOrDefaultAsync(b => b.Id == request.BranchId && b.OrganizationId == me.OrganizationId, ct)
            ?? throw new NotFoundException("Branch not found.");

        if (!_currentUser.IsOwner && !_currentUser.BranchIds.Contains(branch.Id))
            throw new ForbiddenException("You do not have access to this branch.");

        // Duplicate mobile check
        var normalizedMobile = NormalizeMobile(request.Mobile);
        var existing = await _db.Members
            .Where(m => m.OrganizationId == me.OrganizationId && m.Mobile == normalizedMobile)
            .Select(m => new { m.MemberCode, m.FullName })
            .FirstOrDefaultAsync(ct);

        if (existing is not null)
            throw new ConflictException(
                $"A member with this mobile number already exists ({existing.MemberCode} · {existing.FullName}).");

        // Member code generation
        var prefix = $"MQG-{branch.Code}-";
        var lastCode = await _db.Members
            .Where(m => m.OrganizationId == me.OrganizationId && m.MemberCode.StartsWith(prefix))
            .OrderByDescending(m => m.MemberCode)
            .Select(m => m.MemberCode)
            .FirstOrDefaultAsync(ct);

        var nextSeq = 1;
        if (lastCode != null)
        {
            var suffix = lastCode.Substring(prefix.Length);
            if (int.TryParse(suffix, out var n)) nextSeq = n + 1;
        }
        var memberCode = $"{prefix}{nextSeq:D6}";

        var member = new Member
        {
            OrganizationId = me.OrganizationId,
            BranchId = branch.Id,
            MemberCode = memberCode,
            FullName = request.FullName.Trim(),
            FatherFullName = Clean(request.FatherFullName),
            Mobile = normalizedMobile,
            WhatsApp = string.IsNullOrWhiteSpace(request.WhatsApp) ? null : NormalizeMobile(request.WhatsApp),
            Email = Clean(request.Email)?.ToLowerInvariant(),
            DateOfBirth = request.DateOfBirth,
            Gender = Clean(request.Gender),
            BloodGroup = Clean(request.BloodGroup),
            MaritalStatus = Clean(request.MaritalStatus),
            Occupation = Clean(request.Occupation),
            Address = Clean(request.Address),
            City = Clean(request.City),
            Pincode = Clean(request.Pincode),
            IdProofType = Clean(request.IdProofType),
            IdProofNumber = Clean(request.IdProofNumber),
            EmergencyContactName = Clean(request.EmergencyContactName),
            EmergencyContactRelation = Clean(request.EmergencyContactRelation),
            EmergencyContactPhone = Clean(request.EmergencyContactPhone),
            ReferredBy = Clean(request.ReferredBy),
            Notes = Clean(request.Notes),
            PhotoBase64 = Clean(request.PhotoBase64),
            PhotoContentType = Clean(request.PhotoContentType),
            IsActive = true
        };

        _db.Members.Add(member);
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
            member.CreatedAt,
            null, null, null);   // CancelledAt, CancelReason, CancelledByName
    }

    private static string? Clean(string? s) => string.IsNullOrWhiteSpace(s) ? null : s.Trim();
    private static string NormalizeMobile(string mobile) =>
        new string(mobile.Where(c => char.IsDigit(c) || c == '+').ToArray());
}
