using MarkQ.GMS.Application.Features.Dashboard;
using MarkQ.GMS.Application.Features.Dashboard.GetDashboardStats;
using MarkQ.GMS.Application.Features.Dashboard.GetRevenueTrend;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MarkQ.GMS.API.Controllers;

[ApiController]
[Route("api/v1/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IMediator _mediator;
    public DashboardController(IMediator mediator) => _mediator = mediator;

    [HttpGet("stats")]
    public async Task<ActionResult<DashboardStatsDto>> Stats(CancellationToken ct)
        => Ok(await _mediator.Send(new GetDashboardStatsQuery(), ct));

    [HttpGet("revenue-trend")]
    public async Task<ActionResult<RevenueTrendDto>> RevenueTrend(
        [FromQuery] int months = 6, CancellationToken ct = default)
        => Ok(await _mediator.Send(new GetRevenueTrendQuery(months), ct));

    [HttpGet("payment-methods")]
    public async Task<ActionResult<PaymentMethodBreakdownResponse>> PaymentMethods(CancellationToken ct)
        => Ok(await _mediator.Send(new GetPaymentMethodBreakdownQuery(), ct));
}
