using MarkQ.GMS.Application.Features.Memberships;
using MarkQ.GMS.Application.Features.Memberships.CancelMembership;
using MarkQ.GMS.Application.Features.Memberships.CreateMembership;
using MarkQ.GMS.Application.Features.Memberships.FreezeMembership;
using MarkQ.GMS.Application.Features.Memberships.GetMembership;
using MarkQ.GMS.Application.Features.Memberships.GetMemberships;
using MarkQ.GMS.Application.Features.Memberships.RenewMembership;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MarkQ.GMS.API.Controllers;

[ApiController]
[Route("api/v1/memberships")]
[Authorize]
public class MembershipsController : ControllerBase
{
    private readonly IMediator _mediator;
    public MembershipsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<MembershipDto>>> List(
        [FromQuery] string? search,
        [FromQuery] Guid? memberId,
        CancellationToken ct)
        => Ok(await _mediator.Send(new GetMembershipsQuery(search, memberId), ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<MembershipDto>> Get(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new GetMembershipQuery(id), ct));

    [HttpPost]
    public async Task<ActionResult<MembershipDto>> Create([FromBody] CreateMembershipRequest req, CancellationToken ct)
    {
        var result = await _mediator.Send(new CreateMembershipCommand(
            req.MemberId, req.PlanId, req.StartDate,
            req.EndDateOverride, req.EndDateOverrideReason,
            req.RegistrationFeeOverride, req.DiscountOverride, req.DiscountReason,
            req.PaymentDueDate, req.Notes), ct);
        return Created($"/api/v1/memberships/{result.Id}", result);
    }

    [HttpPost("{id:guid}/renew")]
    public async Task<ActionResult<MembershipDto>> Renew(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new RenewMembershipCommand(id), ct));

    [HttpPost("{id:guid}/freeze")]
    public async Task<ActionResult<MembershipDto>> Freeze(Guid id, [FromBody] FreezeMembershipRequest req, CancellationToken ct)
        => Ok(await _mediator.Send(new FreezeMembershipCommand(id, req.FreezeFrom, req.FreezeTo, req.Reason), ct));

    [HttpPost("{id:guid}/cancel")]
    [Authorize(Roles = "OWNER")]
    public async Task<IActionResult> Cancel(Guid id, [FromBody] CancelMembershipRequest req, CancellationToken ct)
    {
        await _mediator.Send(new CancelMembershipCommand(id, req.Reason), ct);
        return NoContent();
    }
}

public record CreateMembershipRequest(
    Guid MemberId, Guid PlanId, DateOnly StartDate,
    DateOnly? EndDateOverride, string? EndDateOverrideReason,
    decimal? RegistrationFeeOverride, decimal? DiscountOverride, string? DiscountReason,
    DateOnly? PaymentDueDate, string? Notes);

public record FreezeMembershipRequest(DateOnly FreezeFrom, DateOnly FreezeTo, string Reason);
public record CancelMembershipRequest(string Reason);
