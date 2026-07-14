using AuthDemo.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthDemo.Controllers;

[ApiController]
[Authorize(Roles = "SuperAdmin")]
public class ReportsCompatibilityController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReportsCompatibilityController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("api/revenue")]
    [HttpGet("api/reports/revenue")]
    public async Task<IActionResult> Revenue()
    {
        var totalRevenue = await _context.Billings
            .SumAsync(x => (decimal?)x.TotalAmount) ?? 0;

        var monthly = await _context.Billings
            .GroupBy(x => new { x.CreatedAt.Year, x.CreatedAt.Month })
            .Select(g => new
            {
                year = g.Key.Year,
                month = g.Key.Month,
                revenue = g.Sum(x => x.TotalAmount)
            })
            .OrderBy(x => x.year)
            .ThenBy(x => x.month)
            .ToListAsync();

        return Ok(new
        {
            totalRevenue,
            revenue = totalRevenue,
            monthly,
            items = monthly
        });
    }

    [HttpGet("api/activity")]
    [HttpGet("api/reports/activity")]
    public async Task<IActionResult> Activity()
    {
        var users = await _context.Users.CountAsync(x => x.Role != "SuperAdmin");
        var clinics = await _context.Hospitals.CountAsync(x => x.Email != "platform@cms.local");
        var admins = await _context.Users.CountAsync(x => x.Role == "Admin");

        var logs = await _context.AuditLogs
            .OrderByDescending(x => x.Timestamp)
            .Take(20)
            .Select(x => new
            {
                id = x.Id,
                user = x.UserName,
                action = x.Action,
                module = x.SystemAction,
                ip = x.IpAddress,
                time = x.Timestamp
            })
            .ToListAsync();

        return Ok(new
        {
            users,
            clinics,
            admins,
            logs,
            items = logs
        });
    }

    [HttpGet("api/reports/dashboard")]
    public async Task<IActionResult> Dashboard()
    {
        var totalRevenue = await _context.Billings
            .SumAsync(x => (decimal?)x.TotalAmount) ?? 0;

        var totalClinics = await _context.Hospitals
            .CountAsync(x => x.Email != "platform@cms.local" && x.IsActive);

        var totalAdmins = await _context.Users
            .CountAsync(x => x.Role == "Admin" && x.IsActive);

        return Ok(new
        {
            totalRevenue,
            totalClinics,
            totalAdmins
        });
    }
}
