using FluentValidation;

namespace MarkQ.GMS.Application.Features.Members.CancelMember;

public class CancelMemberCommandValidator : AbstractValidator<CancelMemberCommand>
{
    public CancelMemberCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Reason).NotEmpty().MinimumLength(5).MaximumLength(500);
    }
}
