using FluentValidation;

namespace MarkQ.GMS.Application.Features.MembershipPlans.UpdatePlan;

public class UpdatePlanCommandValidator : AbstractValidator<UpdatePlanCommand>
{
    public UpdatePlanCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.DurationDays).GreaterThan(0);
        RuleFor(x => x.BasePrice).GreaterThanOrEqualTo(0);
        RuleFor(x => x.RegistrationFee).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Discount).GreaterThanOrEqualTo(0);
        RuleFor(x => x.GstPercent).InclusiveBetween(0, 100);
        RuleFor(x => x.MaxFreezeDays).GreaterThanOrEqualTo(0);
    }
}
