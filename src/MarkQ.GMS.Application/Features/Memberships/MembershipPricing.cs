namespace MarkQ.GMS.Application.Features.Memberships;

/// <summary>
/// Centralized pricing engine (spec §9 + §10).
/// Never duplicate GST math anywhere else.
/// </summary>
public static class MembershipPricing
{
    public static (decimal total, decimal gstAmount, decimal subtotalBeforeGst) Calculate(
        decimal basePrice, decimal registrationFee, decimal discount,
        decimal gstPercent, bool gstIncluded)
    {
        var preGst = basePrice + registrationFee - discount;
        if (preGst < 0) preGst = 0;

        if (gstPercent <= 0)
            return (preGst, 0m, preGst);

        if (gstIncluded)
        {
            // GST is inside preGst
            var gstAmount = Math.Round(preGst - (preGst / (1 + gstPercent / 100m)), 2, MidpointRounding.AwayFromZero);
            return (preGst, gstAmount, preGst - gstAmount);
        }
        else
        {
            var gstAmount = Math.Round(preGst * (gstPercent / 100m), 2, MidpointRounding.AwayFromZero);
            return (preGst + gstAmount, gstAmount, preGst);
        }
    }
}
