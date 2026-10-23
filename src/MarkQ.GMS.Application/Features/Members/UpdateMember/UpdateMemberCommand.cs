using MediatR;

namespace MarkQ.GMS.Application.Features.Members.UpdateMember;

public record UpdateMemberCommand(
    Guid Id,
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
    string? PhotoBase64,
    string? PhotoContentType) : IRequest<MemberDto>;
