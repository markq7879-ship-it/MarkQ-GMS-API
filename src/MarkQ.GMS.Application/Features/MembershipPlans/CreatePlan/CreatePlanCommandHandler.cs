using MarkQ.GMS.Application.Abstractions;
using MarkQ.GMS.Application.Common.Exceptions;
using MarkQ.GMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace MarkQ.GMS.Application.Features.MembershipPlans.CreatePlan;

public class CreatePlanCommandHandler : IRequestHandler<CreatePlanCommand, MembershipPlanDto>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreatePlanCommandHandler(IAppDbContext db, ICurrentUserService cu)
    {
        _db = db; _currentUser = cu;
    }

    public async Task<MembershipPlanDto> Handle(CreatePlanCommand r, CancellationToken ct)
    {
        if (!_currentUser.IsOwner)
            throw new ForbiddenException("Only the owner can create membership plans.");

        var me = await _db.Users.FirstAsync(u => u.Id == _currentUser.UserId!.Value, ct);

        var name = r.Name.Trim();
        if (await _db.MembershipPlans.AnyAsync(p => p.OrganizationId == me.OrganizationId && p.Name == name, ct))
            throw new ConflictException($"A plan named '{name}' already exists.");

        var plan = new MembershipPlan
        {
            OrganizationId = me.OrganizationId,
            Name = name,
            DurationDays = r.DurationDays,
            BasePrice = r.BasePrice,
            RegistrationFee = r.RegistrationFee,
            Discount = r.Discount,
            GstPercent = r.GstPercent,
            GstIncluded = r.GstIncluded,
            FreezeEligible = r.FreezeEligible,
            MaxFreezeDays = r.MaxFreezeDays,
            IsActive = true
        };

        _db.MembershipPlans.Add(plan);
        await _db.SaveChangesAsync(ct);

        return ToDto(plan);
    }

    internal static MembershipPlanDto ToDto(MembershipPlan p) =>
        new(p.Id, p.Name, p.DurationDays, p.BasePrice, p.RegistrationFee, p.Discount,
            p.GstPercent, p.GstIncluded, p.FreezeEligible, p.MaxFreezeDays, p.IsActive);
}
