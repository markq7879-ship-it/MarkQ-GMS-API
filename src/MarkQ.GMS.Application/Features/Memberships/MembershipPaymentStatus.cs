namespace MarkQ.GMS.Application.Features.Memberships;

public static class MembershipPaymentStatus
{
    public static string Compute(decimal total, decimal paid)
    {
        if (paid <= 0) return "PENDING";
        if (paid >= total) return "PAID";
        return "PARTIALLY_PAID";
    }
}
