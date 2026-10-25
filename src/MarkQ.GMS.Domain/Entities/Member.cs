using MarkQ.GMS.Domain.Common;

namespace MarkQ.GMS.Domain.Entities;

public class Member : BaseEntity
{
    public Guid OrganizationId { get; set; }
    public Organization? Organization { get; set; }

    public Guid BranchId { get; set; }
    public Branch? Branch { get; set; }

    public string MemberCode { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;
    public string? FatherFullName { get; set; }
    public string Mobile { get; set; } = string.Empty;
    public string? WhatsApp { get; set; }
    public string? Email { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? BloodGroup { get; set; }
    public string? MaritalStatus { get; set; }
    public string? Occupation { get; set; }

    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Pincode { get; set; }

    public string? IdProofType { get; set; }
    public string? IdProofNumber { get; set; }

    public string? EmergencyContactName { get; set; }
    public string? EmergencyContactRelation { get; set; }
    public string? EmergencyContactPhone { get; set; }

    public string? ReferredBy { get; set; }
    public string? Notes { get; set; }

    public string? PhotoBase64 { get; set; }
    public string? PhotoContentType { get; set; }

    public bool IsActive { get; set; } = true;

    // Cancellation
    public DateTime? CancelledAt { get; set; }
    public string? CancelReason { get; set; }
    public Guid? CancelledByUserId { get; set; }
    public string? CancelledByName { get; set; }
}
