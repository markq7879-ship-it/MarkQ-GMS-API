using MarkQ.GMS.Application.Features.Auth.ChangePassword;
using MarkQ.GMS.Application.Features.Auth.Login;
using MarkQ.GMS.Application.Features.Auth.Me;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MarkQ.GMS.API.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;
    public AuthController(IMediator mediator) => _mediator = mediator;

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResult>> Login([FromBody] LoginRequest req, CancellationToken ct)
        => Ok(await _mediator.Send(new LoginCommand(req.Email, req.Password), ct));

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserInfoDto>> Me(CancellationToken ct)
        => Ok(await _mediator.Send(new GetMeQuery(), ct));

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest req, CancellationToken ct)
    {
        await _mediator.Send(new ChangePasswordCommand(req.CurrentPassword, req.NewPassword), ct);
        return NoContent();
    }
}

public record LoginRequest(string Email, string Password);
public record ChangePasswordRequest(string CurrentPassword, string NewPassword);
