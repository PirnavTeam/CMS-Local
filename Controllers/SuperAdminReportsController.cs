using AuthDemo.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthDemo.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SuperAdminReportsController : ControllerBase
{
    private readonly AppDbContext _context;

    public SuperAdminReportsController(
        AppDbContext context)
    {
        _context = context;
    }
    [HttpGet("summary")]
    public async Task<IActionResult> Summary()
    {
        var totalRevenue =
            await _context.Billings
            .SumAsync(x => (decimal?)x.TotalAmount) ?? 0;

        var activeClinics =
            await _context.Hospitals
            .CountAsync(x => x.IsActive);

        var activeAdmins =
            await _context.Users
            .CountAsync(x =>
                x.Role == "Admin" &&
                x.IsActive);

        return Ok(new
        {
            totalRevenue,
            activeClinics,
            activeAdmins,
            avgGrowth = 0
        });
    }
    [HttpGet("revenue-trend")]
    public async Task<IActionResult> RevenueTrend()
    {
        var data =
            await _context.Billings
            .GroupBy(x => x.CreatedAt.Date)
            .Select(x => new
            {
                date = x.Key,
                revenue =
                    x.Sum(y => y.TotalAmount)
            })
            .ToListAsync();

        return Ok(data);
    }
    [HttpGet("top-clinics")]
    public async Task<IActionResult> TopClinics()
    {
        var data =
            await _context.Hospitals
            .Select(x => new
            {
                clinic = x.Name,

                visits =
                    _context.Appointments
                    .Count(a =>
                        a.HospitalId == x.Id),

                revenue =
                    _context.Billings
                    .Where(b =>
                        b.HospitalId == x.Id)
                    .Sum(b =>
                        (decimal?)b.TotalAmount) ?? 0
            })
            .OrderByDescending(x =>
                x.revenue)
            .Take(10)
            .ToListAsync();

        return Ok(data);
    }
    [HttpGet("user-activity")]
    public async Task<IActionResult> UserActivity()
    {
        var totalUsers =
            await _context.Users
            .CountAsync();

        return Ok(new
        {
            users = totalUsers
        });
    }
}