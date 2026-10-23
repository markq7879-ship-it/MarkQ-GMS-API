using MarkQ.GMS.Application.Features.MembershipPlans;
using MarkQ.GMS.Application.Features.MembershipPlans.CreatePlan;
using MarkQ.GMS.Application.Features.MembershipPlans.GetPlan;
using MarkQ.GMS.Application.Features.MembershipPlans.GetPlans;
using MarkQ.GMS.Application.Features.MembershipPlans.TogglePlanStatus;
using MarkQ.GMS.Application.Features.MembershipPlans.UpdatePlan;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MarkQ.GMS.API.Controllers;

[ApiController]
[Route("api/v1/membership-plans")]
[Authorize]
public class MembershipPlansController : ControllerBase
{
    private readonly IMediator _mediator;
    public MembershipPlansController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<MembershipPlanDto>>> List(
        [FromQuery] string? search, CancellationToken ct)
        => Ok(await _mediator.Send(new GetPlansQuery(search), ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<MembershipPlanDto>> Get(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new GetPlanQuery(id), ct));

    [HttpPost]
    [Authorize(Roles = "OWNER")]
    public async Task<ActionResult<MembershipPlanDto>> Create([FromBody] CreatePlanRequest req, CancellationToken ct)
    {
        var result = await _mediator.Send(new CreatePlanCommand(
            req.Name, req.DurationDays, req.BasePrice, req.RegistrationFee, req.Discount,
            req.GstPercent, req.GstIncluded, req.FreezeEligible, req.MaxFreezeDays), ct);
        return Created($"/api/v1/membership-plans/{result.Id}", result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "OWNER")]
    public async Task<ActionResult<MembershipPlanDto>> Update(Guid id, [FromBody] UpdatePlanRequest req, CancellationToken ct)
    {
        var result = await _mediator.Send(new UpdatePlanCommand(
            id, req.Name, req.DurationDays, req.BasePrice, req.RegistrationFee, req.Discount,
            req.GstPercent, req.GstIncluded, req.FreezeEligible, req.MaxFreezeDays), ct);
        return Ok(result);
    }

    [HttpPost("{id:guid}/status")]
    [Authorize(Roles = "OWNER")]
    public async Task<IActionResult> SetStatus(Guid id, [FromBody] SetPlanStatusRequest req, CancellationToken ct)
    {
        await _mediator.Send(new TogglePlanStatusCommand(id, req.IsActive), ct);
        return NoContent();
    }
}

public record CreatePlanRequest(
    string Name, int DurationDays, decimal BasePrice, decimal RegistrationFee, decimal Discount,
    decimal GstPercent, bool GstIncluded, bool FreezeEligible, int MaxFreezeDays);

public record UpdatePlanRequest(
    string Name, int DurationDays, decimal BasePrice, decimal RegistrationFee, decimal Discount,
    decimal GstPercent, bool GstIncluded, bool FreezeEligible, int MaxFreezeDays);

public record SetPlanStatusRequest(bool IsActive);
