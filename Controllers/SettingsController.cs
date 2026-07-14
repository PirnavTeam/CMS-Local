using AuthDemo.Data;
using AuthDemo.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthDemo.Controllers;

public class SettingsRequest
{
    public string? ApplicationName { get; set; }
    public string? GeneralName { get; set; }
    public string? SupportEmail { get; set; }
    public string? SupportPhone { get; set; }
    public string? Address { get; set; }
    public string? ConfigurationNotes { get; set; }
    public string? Status { get; set; }
    public bool? EmailNotificationsEnabled { get; set; }
    public bool? SmsNotificationsEnabled { get; set; }
}

[ApiController]
[Route("api/settings")]
[Authorize(Roles = "SuperAdmin")]
public class SettingsController : ControllerBase
{
    private readonly AppDbContext _context;

    public SettingsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var setting = await _context.Settings.FirstOrDefaultAsync();

        if (setting == null)
        {
            return Ok(new
            {
                applicationName = "MediCore Platform",
                generalName = "MediCore Platform",
                status = "Enabled",
                emailNotificationsEnabled = true,
                smsNotificationsEnabled = false
            });
        }

        return Ok(new
        {
            setting.Id,
            applicationName = setting.ApplicationName,
            generalName = setting.ApplicationName,
            setting.SupportEmail,
            setting.SupportPhone,
            setting.Address,
            setting.EmailNotificationsEnabled,
            setting.SmsNotificationsEnabled,
            status = "Enabled",
            setting.UpdatedAt
        });
    }

    [HttpPost]
    [HttpPut]
    [HttpPut("general")]
    [HttpPut("email")]
    [HttpPut("sms")]
    [HttpPut("payment")]
    public async Task<IActionResult> Save(SettingsRequest model)
    {
        var setting = await _context.Settings.FirstOrDefaultAsync();

        if (setting == null)
        {
            setting = new Setting
            {
                ApplicationName = model.ApplicationName ?? model.GeneralName ?? "MediCore Platform",
                SupportEmail = model.SupportEmail ?? "",
                SupportPhone = model.SupportPhone ?? "",
                Address = model.Address ?? model.ConfigurationNotes ?? "",
                EmailNotificationsEnabled = model.EmailNotificationsEnabled ?? true,
                SmsNotificationsEnabled = model.SmsNotificationsEnabled ?? false,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Settings.Add(setting);
        }
        else
        {
            setting.ApplicationName = model.ApplicationName ?? model.GeneralName ?? setting.ApplicationName;
            setting.SupportEmail = model.SupportEmail ?? setting.SupportEmail;
            setting.SupportPhone = model.SupportPhone ?? setting.SupportPhone;
            setting.Address = model.Address ?? model.ConfigurationNotes ?? setting.Address;
            setting.EmailNotificationsEnabled = model.EmailNotificationsEnabled ?? setting.EmailNotificationsEnabled;
            setting.SmsNotificationsEnabled = model.SmsNotificationsEnabled ?? setting.SmsNotificationsEnabled;
            setting.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Settings saved successfully",
            setting
        });
    }
}
