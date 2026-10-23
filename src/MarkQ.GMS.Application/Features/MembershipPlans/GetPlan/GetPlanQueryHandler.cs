using MarkQ.GMS.Application.Abstractions;
using MarkQ.GMS.Application.Common.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace MarkQ.GMS.Application.Features.MembershipPlans.GetPlan;

public class GetPlanQueryHandler : IRequestHandler<GetPlanQuery, MembershipPlanDto>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetPlanQueryHandler(IAppDbContext db, ICurrentUserService cu)
    {
        _db = db; _currentUser = cu;
    }

    public async Task<MembershipPlanDto> Handle(GetPlanQuery r, CancellationToken ct)
    {
        if (_currentUser.UserId is null)
            throw new UnauthorizedAccessException("Not authenticated.");

        var me = await _db.Users.FirstAsync(u => u.Id == _currentUser.UserId.Value, ct);

        var p = await _db.MembershipPlans
            .FirstOrDefaultAsync(x => x.Id == r.Id && x.OrganizationId == me.OrganizationId, ct)
            ?? throw new NotFoundException("Membership plan not found.");

        return new MembershipPlanDto(
            p.Id, p.Name, p.DurationDays, p.BasePrice, p.RegistrationFee, p.Discount,
            p.GstPercent, p.GstIncluded, p.FreezeEligible, p.MaxFreezeDays, p.IsActive);
    }
}
