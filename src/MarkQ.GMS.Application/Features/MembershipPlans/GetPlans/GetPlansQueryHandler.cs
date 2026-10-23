using MarkQ.GMS.Application.Abstractions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace MarkQ.GMS.Application.Features.MembershipPlans.GetPlans;

public class GetPlansQueryHandler : IRequestHandler<GetPlansQuery, IReadOnlyCollection<MembershipPlanDto>>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetPlansQueryHandler(IAppDbContext db, ICurrentUserService cu)
    {
        _db = db; _currentUser = cu;
    }

    public async Task<IReadOnlyCollection<MembershipPlanDto>> Handle(GetPlansQuery r, CancellationToken ct)
    {
        if (_currentUser.UserId is null)
            throw new UnauthorizedAccessException("Not authenticated.");

        var me = await _db.Users.FirstAsync(u => u.Id == _currentUser.UserId.Value, ct);
        var query = _db.MembershipPlans.Where(p => p.OrganizationId == me.OrganizationId);

        if (!string.IsNullOrWhiteSpace(r.Search))
        {
            var s = r.Search.Trim().ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(s));
        }

        var plans = await query.OrderBy(p => p.Name).ToListAsync(ct);

        return plans.Select(p => new MembershipPlanDto(
            p.Id, p.Name, p.DurationDays, p.BasePrice, p.RegistrationFee, p.Discount,
            p.GstPercent, p.GstIncluded, p.FreezeEligible, p.MaxFreezeDays, p.IsActive)).ToArray();
    }
}
