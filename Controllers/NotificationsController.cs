using AuthDemo.Data;
using AuthDemo.Models;
using AuthDemo.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AuthDemo.Helpers;
namespace AuthDemo.Controllers;

public class NotificationRequest
{
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    
    public string? TargetUsers { get; set; }
   
}

[ApiController]
[Route("api/notifications")]
[Authorize(Roles = "SuperAdmin,Admin,Doctor,Receptionist")]
public class NotificationsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly NotificationService _service;

    public NotificationsController(AppDbContext context, NotificationService service)
    {
        _context = context;
        _service = service;
    }

    [HttpPost]
    [HttpPost("send")]
    public async Task<IActionResult> Send(
     NotificationRequest model)
    {
        var notification =
            new Notification
            {
                Title = model.Title,

                Message = model.Message,

                IsSent = true,

                CreatedAt = DateTime.UtcNow
            };

        _context.Notifications.Add(
            notification);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message =
                "Notification created successfully",

            notification
        });
    }
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var notifications =
            await _context.Notifications

                .OrderByDescending(x =>
                    x.CreatedAt)

                .ToListAsync();

        return Ok(notifications);
    }

    [HttpGet("stats")]
    public async Task<IActionResult> Stats()
    {
        var total =
            await _context.Notifications
                .CountAsync();

        return Ok(new
        {
            total
        });
    }
}

