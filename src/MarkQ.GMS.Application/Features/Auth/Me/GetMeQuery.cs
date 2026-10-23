using MarkQ.GMS.Application.Features.Auth.Login;
using MediatR;

namespace MarkQ.GMS.Application.Features.Auth.Me;

public record GetMeQuery : IRequest<UserInfoDto>;
