using FluentValidation;

namespace MarkQ.GMS.Application.Features.Memberships.FreezeMembership;

public class FreezeMembershipCommandValidator : AbstractValidator<FreezeMembershipCommand>
{
    public FreezeMembershipCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.FreezeFrom).NotEmpty();
        RuleFor(x => x.FreezeTo).NotEmpty().GreaterThanOrEqualTo(x => x.FreezeFrom);
        RuleFor(x => x.Reason).NotEmpty().MaximumLength(500);
    }
}
