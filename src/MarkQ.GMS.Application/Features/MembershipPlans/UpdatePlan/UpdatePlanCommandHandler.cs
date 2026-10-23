using MarkQ.GMS.Application.Abstractions;
using MarkQ.GMS.Application.Common.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace MarkQ.GMS.Application.Features.MembershipPlans.UpdatePlan;

public class UpdatePlanCommandHandler : IRequestHandler<UpdatePlanCommand, MembershipPlanDto>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdatePlanCommandHandler(IAppDbContext db, ICurrentUserService cu)
    {
        _db = db; _currentUser = cu;
    }

    public async Task<MembershipPlanDto> Handle(UpdatePlanCommand r, CancellationToken ct)
    {
        if (!_currentUser.IsOwner)
            throw new ForbiddenException("Only the owner can update membership plans.");

        var me = await _db.Users.FirstAsync(u => u.Id == _currentUser.UserId!.Value, ct);

        var plan = await _db.MembershipPlans
            .FirstOrDefaultAsync(p => p.Id == r.Id && p.OrganizationId == me.OrganizationId, ct)
            ?? throw new NotFoundException("Membership plan not found.");

        var name = r.Name.Trim();
        if (await _db.MembershipPlans.AnyAsync(p => p.OrganizationId == me.OrganizationId && p.Name == name && p.Id != plan.Id, ct))
            throw new ConflictException($"A plan named '{name}' already exists.");

        plan.Name = name;
        plan.DurationDays = r.DurationDays;
        plan.BasePrice = r.BasePrice;
        plan.RegistrationFee = r.RegistrationFee;
        plan.Discount = r.Discount;
        plan.GstPercent = r.GstPercent;
        plan.GstIncluded = r.GstIncluded;
        plan.FreezeEligible = r.FreezeEligible;
        plan.MaxFreezeDays = r.MaxFreezeDays;

        await _db.SaveChangesAsync(ct);

        return new MembershipPlanDto(
            plan.Id, plan.Name, plan.DurationDays, plan.BasePrice, plan.RegistrationFee, plan.Discount,
            plan.GstPercent, plan.GstIncluded, plan.FreezeEligible, plan.MaxFreezeDays, plan.IsActive);
    }
}
