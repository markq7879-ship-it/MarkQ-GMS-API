using MarkQ.GMS.Application.Abstractions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace MarkQ.GMS.Application.Features.Members.GetMembers;

public class GetMembersQueryHandler : IRequestHandler<GetMembersQuery, MemberListResult>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IDateTimeProvider _clock;

    public GetMembersQueryHandler(IAppDbContext db, ICurrentUserService cu, IDateTimeProvider clock)
    {
        _db = db; _currentUser = cu; _clock = clock;
    }

    public async Task<MemberListResult> Handle(GetMembersQuery r, CancellationToken ct)
    {
        if (_currentUser.UserId is null)
            throw new UnauthorizedAccessException("Not authenticated.");

        var me = await _db.Users.FirstAsync(u => u.Id == _currentUser.UserId.Value, ct);
        var now = _clock.UtcNow;
        var today = DateOnly.FromDateTime(now);
        var dayStart = now.Date;
        var seven = today.AddDays(7);

        var query = _db.Members.Include(m => m.Branch)
            .Where(m => m.OrganizationId == me.OrganizationId);

        if (!_currentUser.IsOwner)
        {
            var assigned = _currentUser.BranchIds.ToArray();
            query = query.Where(m => assigned.Contains(m.BranchId));
        }

        if (r.BranchId.HasValue)
            query = query.Where(m => m.BranchId == r.BranchId.Value);

        if (!string.IsNullOrWhiteSpace(r.Search))
        {
            var s = r.Search.Trim().ToLower();
            query = query.Where(m =>
                m.FullName.ToLower().Contains(s) ||
                m.Mobile.Contains(s) ||
                m.MemberCode.ToLower().Contains(s));
        }

        var filter = r.Filter?.Trim().ToLowerInvariant();
        switch (filter)
        {
            case "active":
                query = query.Where(m => _db.Memberships.Any(x =>
                    x.MemberId == m.Id && x.CancelledAt == null && x.EndDate >= today));
                break;

            case "inactive":
                query = query.Where(m => !_db.Memberships.Any(x =>
                    x.MemberId == m.Id && x.CancelledAt == null && x.EndDate >= today));
                break;

            case "expiring7":
                query = query.Where(m => _db.Memberships.Any(x =>
                    x.MemberId == m.Id && x.CancelledAt == null &&
                    x.EndDate > today && x.EndDate <= seven));
                break;

            case "expiringtoday":
                query = query.Where(m => _db.Memberships.Any(x =>
                    x.MemberId == m.Id && x.CancelledAt == null && x.EndDate == today));
                break;

            case "newtoday":
                query = query.Where(m => m.CreatedAt >= dayStart && m.CreatedAt < dayStart.AddDays(1));
                break;

            case "pending":
                var activeMemb = await _db.Memberships
                    .Where(x => x.CancelledAt == null && x.EndDate >= today)
                    .Select(x => new { x.Id, x.MemberId, x.TotalPayable })
                    .ToListAsync(ct);

                var paidMap = await _db.Payments
                    .Where(p => p.Status == "COMPLETED")
                    .GroupBy(p => p.MembershipId)
                    .Select(g => new { MembershipId = g.Key, Paid = g.Sum(p => p.Amount) })
                    .ToDictionaryAsync(x => x.MembershipId, x => x.Paid, ct);

                var pendingIds = activeMemb
                    .Where(x => x.TotalPayable - paidMap.GetValueOrDefault(x.Id, 0m) > 0)
                    .Select(x => x.MemberId)
                    .Distinct()
                    .ToArray();

                query = query.Where(m => pendingIds.Contains(m.Id));
                break;
        }

        var total = await query.CountAsync(ct);
        var page = Math.Max(1, r.Page);
        var size = Math.Clamp(r.PageSize, 1, 200);

        var items = await query
            .OrderByDescending(m => m.CreatedAt)
            .Skip((page - 1) * size)
            .Take(size)
            .ToListAsync(ct);

        var dtos = items.Select(m => new MemberDto(
            m.Id, m.MemberCode, m.FullName, m.FatherFullName, m.Mobile, m.WhatsApp, m.Email,
            m.DateOfBirth, m.Gender, m.BloodGroup, m.MaritalStatus, m.Occupation,
            m.Address, m.City, m.Pincode,
            m.IdProofType, m.IdProofNumber,
            m.EmergencyContactName, m.EmergencyContactRelation, m.EmergencyContactPhone,
            m.ReferredBy, m.Notes,
            m.BranchId, m.Branch?.Name ?? "", "NO_MEMBERSHIP",
            m.PhotoBase64, m.PhotoContentType,
            m.CreatedAt)).ToArray();

        return new MemberListResult(dtos, total);
    }
}
