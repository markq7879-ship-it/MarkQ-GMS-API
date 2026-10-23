using MarkQ.GMS.Application.Features.Branches;
using MarkQ.GMS.Application.Features.Branches.CreateBranch;
using MarkQ.GMS.Application.Features.Branches.GetBranch;
using MarkQ.GMS.Application.Features.Branches.GetBranches;
using MarkQ.GMS.Application.Features.Branches.ToggleBranchStatus;
using MarkQ.GMS.Application.Features.Branches.UpdateBranch;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MarkQ.GMS.API.Controllers;

[ApiController]
[Route("api/v1/branches")]
[Authorize]
public class BranchesController : ControllerBase
{
    private readonly IMediator _mediator;
    public BranchesController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<BranchDto>>> List(
        [FromQuery] string? search, CancellationToken ct)
        => Ok(await _mediator.Send(new GetBranchesQuery(search), ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<BranchDto>> Get(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new GetBranchQuery(id), ct));

    [HttpPost]
    [Authorize(Roles = "OWNER")]
    public async Task<ActionResult<BranchDto>> Create([FromBody] CreateBranchRequest req, CancellationToken ct)
    {
        var result = await _mediator.Send(new CreateBranchCommand(req.Name), ct);
        return Created($"/api/v1/branches/{result.Id}", result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "OWNER")]
    public async Task<ActionResult<BranchDto>> Update(Guid id, [FromBody] UpdateBranchRequest req, CancellationToken ct)
        => Ok(await _mediator.Send(new UpdateBranchCommand(id, req.Name), ct));

    [HttpPost("{id:guid}/status")]
    [Authorize(Roles = "OWNER")]
    public async Task<IActionResult> SetStatus(Guid id, [FromBody] SetBranchStatusRequest req, CancellationToken ct)
    {
        await _mediator.Send(new ToggleBranchStatusCommand(id, req.IsActive), ct);
        return NoContent();
    }
}

public record CreateBranchRequest(string Name);
public record UpdateBranchRequest(string Name);
public record SetBranchStatusRequest(bool IsActive);
