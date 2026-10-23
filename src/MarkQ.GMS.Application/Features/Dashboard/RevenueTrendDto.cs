namespace MarkQ.GMS.Application.Features.Dashboard;

public record RevenueTrendPointDto(
    string Month,
    int Year,
    int MonthNumber,
    decimal Revenue);

public record RevenueTrendDto(
    IReadOnlyCollection<RevenueTrendPointDto> Points,
    decimal MomGrowthPercent,
    decimal TotalRevenue,
    DateTime AsOf);

public record PaymentMethodBreakdownDto(
    string Method,
    decimal Amount,
    int Count);

public record PaymentMethodBreakdownResponse(
    IReadOnlyCollection<PaymentMethodBreakdownDto> Methods,
    decimal Total);
