namespace MarkQ.GMS.Application.Features.Members;

public record MemberDto(
    Guid Id,
    string MemberCode,
    string FullName,
    string? FatherFullName,
    string Mobile,
    string? WhatsApp,
    string? Email,
    DateOnly? DateOfBirth,
    string? Gender,
    string? BloodGroup,
    string? MaritalStatus,
    string? Occupation,
    string? Address,
    string? City,
    string? Pincode,
    string? IdProofType,
    string? IdProofNumber,
    string? EmergencyContactName,
    string? EmergencyContactRelation,
    string? EmergencyContactPhone,
    string? ReferredBy,
    string? Notes,
    Guid BranchId,
    string BranchName,
    string Status,
    string? PhotoBase64,
    string? PhotoContentType,
    DateTime CreatedAt);

public record MemberListResult(IReadOnlyCollection<MemberDto> Items, int Total);

public record CheckMobileResult(bool Exists, string? MemberCode, string? MemberName);
