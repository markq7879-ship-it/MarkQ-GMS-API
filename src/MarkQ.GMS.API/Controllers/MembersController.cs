using MarkQ.GMS.Application.Features.Members;
using MarkQ.GMS.Application.Features.Members.CancelMember;
using MarkQ.GMS.Application.Features.Members.CheckMobile;
using MarkQ.GMS.Application.Features.Members.CreateMember;
using MarkQ.GMS.Application.Features.Members.GetMember;
using MarkQ.GMS.Application.Features.Members.GetMembers;
using MarkQ.GMS.Application.Features.Members.ReactivateMember;
using MarkQ.GMS.Application.Features.Members.UpdateMember;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MarkQ.GMS.API.Controllers;

[ApiController]
[Route("api/v1/members")]
[Authorize]
public class MembersController : ControllerBase
{
    private readonly IMediator _mediator;
    public MembersController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<ActionResult<MemberListResult>> List(
        [FromQuery] string? search,
        [FromQuery] Guid? branchId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? filter = null,
        CancellationToken ct = default)
        => Ok(await _mediator.Send(new GetMembersQuery(search, branchId, page, pageSize, filter), ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<MemberDto>> Get(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new GetMemberQuery(id), ct));

    [HttpGet("check-mobile")]
    public async Task<ActionResult<CheckMobileResult>> CheckMobile(
        [FromQuery] string mobile,
        [FromQuery] Guid? excludeMemberId,
        CancellationToken ct)
        => Ok(await _mediator.Send(new CheckMobileQuery(mobile, excludeMemberId), ct));

    [HttpPost]
    public async Task<ActionResult<MemberDto>> Create([FromBody] CreateMemberRequest req, CancellationToken ct)
    {
        var result = await _mediator.Send(new CreateMemberCommand(
            req.FullName, req.FatherFullName, req.Mobile, req.WhatsApp, req.Email,
            req.DateOfBirth, req.Gender, req.BloodGroup, req.MaritalStatus, req.Occupation,
            req.Address, req.City, req.Pincode,
            req.IdProofType, req.IdProofNumber,
            req.EmergencyContactName, req.EmergencyContactRelation, req.EmergencyContactPhone,
            req.ReferredBy, req.Notes, req.BranchId, req.PhotoBase64, req.PhotoContentType), ct);
        return Created($"/api/v1/members/{result.Id}", result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<MemberDto>> Update(Guid id, [FromBody] UpdateMemberRequest req, CancellationToken ct)
    {
        var result = await _mediator.Send(new UpdateMemberCommand(
            id, req.FullName, req.FatherFullName, req.Mobile, req.WhatsApp, req.Email,
            req.DateOfBirth, req.Gender, req.BloodGroup, req.MaritalStatus, req.Occupation,
            req.Address, req.City, req.Pincode,
            req.IdProofType, req.IdProofNumber,
            req.EmergencyContactName, req.EmergencyContactRelation, req.EmergencyContactPhone,
            req.ReferredBy, req.Notes, req.BranchId, req.PhotoBase64, req.PhotoContentType), ct);
        return Ok(result);
    }

    [HttpPost("{id:guid}/cancel")]
    [Authorize(Roles = "OWNER,ADMIN")]
    public async Task<ActionResult<MemberDto>> Cancel(Guid id, [FromBody] CancelMemberRequest req, CancellationToken ct)
        => Ok(await _mediator.Send(new CancelMemberCommand(id, req.Reason), ct));

    [HttpPost("{id:guid}/reactivate")]
    [Authorize(Roles = "OWNER,ADMIN")]
    public async Task<ActionResult<MemberDto>> Reactivate(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new ReactivateMemberCommand(id), ct));
}

public record CancelMemberRequest(string Reason);
public record CreateMemberRequest(
    string FullName, string? FatherFullName, string Mobile, string? WhatsApp, string? Email,
    DateOnly? DateOfBirth, string? Gender, string? BloodGroup, string? MaritalStatus, string? Occupation,
    string? Address, string? City, string? Pincode,
    string? IdProofType, string? IdProofNumber,
    string? EmergencyContactName, string? EmergencyContactRelation, string? EmergencyContactPhone,
    string? ReferredBy, string? Notes, Guid BranchId,
    string? PhotoBase64, string? PhotoContentType);
public record UpdateMemberRequest(
    string FullName, string? FatherFullName, string Mobile, string? WhatsApp, string? Email,
    DateOnly? DateOfBirth, string? Gender, string? BloodGroup, string? MaritalStatus, string? Occupation,
    string? Address, string? City, string? Pincode,
    string? IdProofType, string? IdProofNumber,
    string? EmergencyContactName, string? EmergencyContactRelation, string? EmergencyContactPhone,
    string? ReferredBy, string? Notes, Guid BranchId,
    string? PhotoBase64, string? PhotoContentType);
