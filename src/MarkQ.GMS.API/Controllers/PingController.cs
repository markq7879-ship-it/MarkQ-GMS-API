using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MarkQ.GMS.API.Controllers;

[ApiController]
[Route("api/v1/ping")]
public class PingController : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public IActionResult Get() => Ok(new
    {
        service = "MarkQ.GMS.API",
        status  = "ok",
        utc     = DateTime.UtcNow
    });
}
