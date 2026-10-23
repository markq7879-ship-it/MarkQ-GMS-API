using MarkQ.GMS.Domain.Common;

namespace MarkQ.GMS.Domain.Entities;

public class Payment : BaseEntity
{
    public Guid OrganizationId { get; set; }
    public Organization? Organization { get; set; }

    // Denormalized for query performance
    public Guid MembershipId { get; set; }
    public Membership? Membership { get; set; }

    public Guid MemberId { get; set; }
    public Member? Member { get; set; }

    public Guid BranchId { get; set; }
    public Branch? Branch { get; set; }

    // Auto-generated: REC-B01-2026-000001
    public string ReceiptNumber { get; set; } = string.Empty;

    public decimal Amount { get; set; }
    public string Method { get; set; } = string.Empty;     // CASH | UPI | BANK_TRANSFER
    public string? Reference { get; set; }                 // UTR / txn ID

    public DateTime PaidAt { get; set; }

    public string Status { get; set; } = "COMPLETED";      // COMPLETED | VOIDED

    public Guid ReceivedByUserId { get; set; }
    public string ReceivedByName { get; set; } = string.Empty; // snapshot

    public DateTime? VoidedAt { get; set; }
    public string? VoidReason { get; set; }
    public Guid? VoidedByUserId { get; set; }
    public string? VoidedByName { get; set; }

    public string? Notes { get; set; }
}
