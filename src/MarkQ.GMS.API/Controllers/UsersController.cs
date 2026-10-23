using MarkQ.GMS.Application.Features.Users.AssignBranches;
using MarkQ.GMS.Application.Features.Users.CreateUser;
using MarkQ.GMS.Application.Features.Users.GetUsers;
using MarkQ.GMS.Application.Features.Users.ToggleUserStatus;
using MarkQ.GMS.Application.Features.Users.UpdateUser;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MarkQ.GMS.API.Controllers;

[ApiController]
[Route("api/v1/users")]
[Authorize(Roles = "OWNER")]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;
    public UsersController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<UserSummaryDto>>> List(
        [FromQuery] string? search, CancellationToken ct)
        => Ok(await _mediator.Send(new GetUsersQuery(search), ct));

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CreateUserRequest req, CancellationToken ct)
    {
        var result = await _mediator.Send(new CreateUserCommand(
            req.Email, req.Password, req.FullName, req.Phone, req.Role,
            req.BranchIds ?? Array.Empty<Guid>()), ct);
        return Created("/api/v1/users/" + result.Id, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult> Update(Guid id, [FromBody] UpdateUserRequest req, CancellationToken ct)
        => Ok(await _mediator.Send(new UpdateUserCommand(id, req.FullName, req.Phone, req.Role), ct));

    [HttpPost("{id:guid}/branches")]
    public async Task<IActionResult> AssignBranches(Guid id, [FromBody] AssignBranchesRequest req, CancellationToken ct)
    {
        await _mediator.Send(new AssignBranchesCommand(id, req.BranchIds ?? Array.Empty<Guid>()), ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/status")]
    public async Task<IActionResult> SetStatus(Guid id, [FromBody] SetStatusRequest req, CancellationToken ct)
    {
        await _mediator.Send(new ToggleUserStatusCommand(id, req.IsActive), ct);
        return NoContent();
    }
}

public record CreateUserRequest(string Email, string Password, string FullName,
    string? Phone, string Role, IReadOnlyCollection<Guid>? BranchIds);
public record UpdateUserRequest(string FullName, string? Phone, string Role);
public record AssignBranchesRequest(IReadOnlyCollection<Guid>? BranchIds);
public record SetStatusRequest(bool IsActive);
