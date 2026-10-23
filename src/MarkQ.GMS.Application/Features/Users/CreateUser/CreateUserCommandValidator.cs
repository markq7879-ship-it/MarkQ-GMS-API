using FluentValidation;
using MarkQ.GMS.Domain.Constants;

namespace MarkQ.GMS.Application.Features.Users.CreateUser;

public class CreateUserCommandValidator : AbstractValidator<CreateUserCommand>
{
    public CreateUserCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8);
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Role).NotEmpty().Must(r => AppRoles.All.Contains(r))
            .WithMessage("Role must be one of: " + string.Join(", ", AppRoles.All));
    }
}
