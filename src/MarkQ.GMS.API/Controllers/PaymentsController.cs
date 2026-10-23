using MarkQ.GMS.Application.Features.Payments;
using MarkQ.GMS.Application.Features.Payments.CreatePayment;
using MarkQ.GMS.Application.Features.Payments.GetPayment;
using MarkQ.GMS.Application.Features.Payments.GetPayments;
using MarkQ.GMS.Application.Features.Payments.VoidPayment;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MarkQ.GMS.API.Controllers;

[ApiController]
[Route("api/v1/payments")]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly IMediator _mediator;
    public PaymentsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<PaymentDto>>> List(
        [FromQuery] string? search, CancellationToken ct)
        => Ok(await _mediator.Send(new GetPaymentsQuery(search), ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PaymentDto>> Get(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new GetPaymentQuery(id), ct));

    [HttpPost]
    public async Task<ActionResult<PaymentDto>> Create([FromBody] CreatePaymentRequest req, CancellationToken ct)
    {
        var result = await _mediator.Send(new CreatePaymentCommand(
            req.MembershipId, req.Amount, req.Method, req.Reference, req.Notes), ct);
        return Created($"/api/v1/payments/{result.Id}", result);
    }

    [HttpPost("{id:guid}/void")]
    public async Task<IActionResult> Void(Guid id, [FromBody] VoidPaymentRequest req, CancellationToken ct)
    {
        await _mediator.Send(new VoidPaymentCommand(id, req.Reason), ct);
        return NoContent();
    }
}

public record CreatePaymentRequest(Guid MembershipId, decimal Amount, string Method, string? Reference, string? Notes);
public record VoidPaymentRequest(string Reason);
