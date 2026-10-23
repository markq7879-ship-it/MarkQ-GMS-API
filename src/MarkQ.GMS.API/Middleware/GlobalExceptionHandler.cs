using System.Net;
using System.Text.Json;
using FluentValidation;
using MarkQ.GMS.Application.Common.Exceptions;
using Microsoft.AspNetCore.Diagnostics;

namespace MarkQ.GMS.API.Middleware;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) => _logger = logger;

    public async ValueTask<bool> TryHandleAsync(HttpContext ctx, Exception ex, CancellationToken ct)
    {
        _logger.LogError(ex, "Unhandled exception on {Method} {Path}",
            ctx.Request.Method, ctx.Request.Path);

        var (status, title, detail) = ex switch
        {
            ValidationException ve => ((int)HttpStatusCode.BadRequest, "Validation failed",
                string.Join("; ", ve.Errors.Select(e => e.ErrorMessage))),
            NotFoundException nf  => ((int)HttpStatusCode.NotFound, "Not found", nf.Message),
            ForbiddenException fb => ((int)HttpStatusCode.Forbidden, "Forbidden", fb.Message),
            ConflictException cf  => ((int)HttpStatusCode.Conflict, "Conflict", cf.Message),
            UnauthorizedAccessException ua => ((int)HttpStatusCode.Unauthorized, "Unauthorized", ua.Message),
            ArgumentException ae  => ((int)HttpStatusCode.BadRequest, "Bad request", ae.Message),
            KeyNotFoundException k => ((int)HttpStatusCode.NotFound, "Not found", k.Message),
            _ => ((int)HttpStatusCode.InternalServerError, "Server error", "An unexpected error occurred.")
        };

        ctx.Response.StatusCode = status;
        ctx.Response.ContentType = "application/problem+json";

        await ctx.Response.WriteAsync(JsonSerializer.Serialize(new
        {
            type = "about:blank", title, status, detail, traceId = ctx.TraceIdentifier
        }), ct);

        return true;
    }
}
