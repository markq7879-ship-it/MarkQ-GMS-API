using MarkQ.GMS.Application.Abstractions;
using MarkQ.GMS.Application.Common.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace MarkQ.GMS.Application.Features.Memberships.GetMembership;

public class GetMembershipQueryHandler : IRequestHandler<GetMembershipQuery, MembershipDto>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IDateTimeProvider _clock;

    public GetMembershipQueryHandler(IAppDbContext db, ICurrentUserService cu, IDateTimeProvider clock)
    {
        _db = db; _currentUser = cu; _clock = clock;
    }

    public async Task<MembershipDto> Handle(GetMembershipQuery r, CancellationToken ct)
    {
        if (_currentUser.UserId is null)
            throw new UnauthorizedAccessException("Not authenticated.");

        var me = await _db.Users.FirstAsync(u => u.Id == _currentUser.UserId.Value, ct);
        var m = await _db.Memberships.Include(x => x.Member).Include(x => x.Plan)
            .FirstOrDefaultAsync(x => x.Id == r.Id && x.OrganizationId == me.OrganizationId, ct)
            ?? throw new NotFoundException("Membership not found.");

        var paid = await _db.Payments
            .Where(p => p.MembershipId == m.Id && p.Status == "COMPLETED")
            .SumAsync(p => (decimal?)p.Amount, ct) ?? 0m;

        var today = DateOnly.FromDateTime(_clock.UtcNow);
        return GetMemberships.GetMembershipsQueryHandler.ToDto(m, today, paid);
    }
}
