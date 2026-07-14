using AuthDemo.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthDemo.Controllers;

[ApiController]
[Route("api/SuperAdmin")]
[Route("api/dashboard")]
[Authorize(Roles = "SuperAdmin")]
public class SuperAdminController : ControllerBase
{
    private readonly AppDbContext _context;

    public SuperAdminController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("dashboard")]
    [HttpGet("summary")]
    public async Task<IActionResult> GetDashboard()
    {
        var totalClinics = await _context.Hospitals
            .CountAsync(x => x.Email != "platform@cms.local" && x.IsActive);

        var totalAdmins = await _context.Users
            .CountAsync(x => x.Role == "Admin" && x.IsActive);

        var totalUsers = await _context.Users
            .CountAsync(x => x.Role != "SuperAdmin");

        var activeUsers = await _context.Users
            .CountAsync(x => x.Role != "SuperAdmin" && x.IsActive);

        var totalRevenue = await _context.Billings
            .SumAsync(x => (decimal?)x.TotalAmount) ?? 0;

        return Ok(new
        {
            totalClinics,
            clinics = totalClinics,
            totalAdmins,
            admins = totalAdmins,
            totalUsers,
            users = totalUsers,
            activeUsers,
            totalRevenue,
            revenue = totalRevenue,
            revenueSummary = totalRevenue,
            revenueMtd = totalRevenue
        });
    }
}
