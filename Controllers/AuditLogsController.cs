using AuthDemo.Data;
using AuthDemo.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthDemo.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuditLogsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuditLogsController(AppDbContext context)
    {
        _context = context;
    }

    // =====================================
    // GET ALL AUDIT LOGS
    // =====================================

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var logs = await _context.AuditLogs
            .Where(x => !x.IsLoginActivity)
            .OrderByDescending(x => x.Timestamp)
            .ToListAsync();

        return Ok(logs);
    }

    // =====================================
    // GET LOGIN HISTORY
    // =====================================

    [HttpGet("login-history")]
    public async Task<IActionResult> LoginHistory()
    {
        var logs = await _context.AuditLogs
            .Where(x => x.IsLoginActivity)
            .OrderByDescending(x => x.Timestamp)
            .ToListAsync();

        return Ok(logs);
    }

    // =====================================
    // GET BY ID
    // =====================================

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var log = await _context.AuditLogs
            .FindAsync(id);

        if (log == null)
            return NotFound();

        return Ok(log);
    }

    // =====================================
    // CREATE LOG
    // =====================================

    [HttpPost]
    public async Task<IActionResult> Create(AuditLog model)
    {
        model.Timestamp = DateTime.UtcNow;

        _context.AuditLogs.Add(model);

        await _context.SaveChangesAsync();

        return Ok(model);
    }

    // =====================================
    // DELETE LOG
    // =====================================

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var log = await _context.AuditLogs
            .FindAsync(id);

        if (log == null)
            return NotFound();

        _context.AuditLogs.Remove(log);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Audit log deleted successfully"
        });
    }
}