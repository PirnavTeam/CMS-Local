using AuthDemo.Data;
using AuthDemo.Models;
using AuthDemo.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthDemo.Controllers;

public class NotificationRequest
{
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Recipient { get; set; }
    public string? TargetUsers { get; set; }
    public string? Status { get; set; }
    public string? Type { get; set; }
}

[ApiController]
[Route("api/notifications")]
[Authorize(Roles = "SuperAdmin")]
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
    public async Task<IActionResult> Send(NotificationRequest model)
    {
        var recipient = !string.IsNullOrWhiteSpace(model.Recipient)
            ? model.Recipient
            : !string.IsNullOrWhiteSpace(model.TargetUsers)
                ? model.TargetUsers
                : "All Clinics";

        var shouldSend = string.IsNullOrWhiteSpace(model.Status) ||
                         !model.Status.Equals("draft", StringComparison.OrdinalIgnoreCase);

        if (shouldSend && recipient.Contains("@"))
        {
            await _service.SendEmail(recipient, model.Title, model.Message);
        }

        var notification = new Notification
        {
            Title = model.Title,
            Message = model.Message,
            Recipient = recipient,
            Type = string.IsNullOrWhiteSpace(model.Type) ? "Platform" : model.Type,
            IsSent = shouldSend,
            CreatedAt = DateTime.UtcNow
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = shouldSend ? "Notification sent successfully" : "Notification saved as draft",
            notification
        });
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var notifications = await _context.Notifications
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new
            {
                x.Id,
                x.Title,
                x.Message,
                targetUsers = x.Recipient,
                recipient = x.Recipient,
                type = x.Type,
                status = x.IsSent ? "sent" : "draft",
                x.IsSent,
                x.CreatedAt
            })
            .ToListAsync();

        return Ok(notifications);
    }

    [HttpGet("stats")]
    public async Task<IActionResult> Stats()
    {
        var total = await _context.Notifications.CountAsync();
        var delivered = await _context.Notifications.CountAsync(x => x.IsSent);
        var drafts = await _context.Notifications.CountAsync(x => !x.IsSent);

        return Ok(new
        {
            total,
            delivered,
            drafts
        });
    }
}
