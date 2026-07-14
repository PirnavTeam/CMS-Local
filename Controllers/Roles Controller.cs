using AuthDemo.Data;
using AuthDemo.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthDemo.Controllers;

public class RoleRequest
{
    public string RoleName { get; set; } = string.Empty;
    public string? Module { get; set; }
    public string? Status { get; set; }
    public bool CanView { get; set; } = true;
    public bool CanCreate { get; set; }
    public bool CanEdit { get; set; }
    public bool CanDelete { get; set; }
}

[ApiController]
[Route("api/roles")]
[Authorize(Roles = "SuperAdmin")]
public class RolesController : ControllerBase
{
    private readonly AppDbContext _context;

    public RolesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var roles = await _context.RolePermissions
            .OrderBy(x => x.RoleName)
            .Select(x => new
            {
                x.Id,
                x.RoleName,
                roleName = x.RoleName,
                x.Module,
                module = x.Module,
                x.CanView,
                x.CanCreate,
                x.CanEdit,
                x.CanDelete,
                permissions = new
                {
                    view = x.CanView,
                    create = x.CanCreate,
                    edit = x.CanEdit,
                    delete = x.CanDelete
                },
                status = "active",
                assignedUsers = _context.Users.Count(u => u.Role == x.RoleName)
            })
            .ToListAsync();

        return Ok(roles);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var permission = await _context.RolePermissions.FindAsync(id);

        if (permission == null)
        {
            return NotFound(new { message = "Role not found" });
        }

        return Ok(permission);
    }

    [HttpPost]
    public async Task<IActionResult> Create(RoleRequest model)
    {
        var role = new RolePermission
        {
            RoleName = model.RoleName,
            Module = string.IsNullOrWhiteSpace(model.Module) ? "System" : model.Module,
            CanView = model.CanView,
            CanCreate = model.CanCreate,
            CanEdit = model.CanEdit,
            CanDelete = model.CanDelete
        };

        _context.RolePermissions.Add(role);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Role created successfully", role });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, RoleRequest model)
    {
        var permission = await _context.RolePermissions.FindAsync(id);

        if (permission == null)
        {
            return NotFound(new { message = "Role not found" });
        }

        permission.RoleName = model.RoleName;
        permission.Module = string.IsNullOrWhiteSpace(model.Module) ? permission.Module : model.Module;
        permission.CanView = model.CanView;
        permission.CanCreate = model.CanCreate;
        permission.CanEdit = model.CanEdit;
        permission.CanDelete = model.CanDelete;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Role updated successfully", permission });
    }

    [HttpPut("{id}/permissions")]
    public async Task<IActionResult> UpdatePermissions(int id, RoleRequest model)
    {
        return await Update(id, model);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var permission = await _context.RolePermissions.FindAsync(id);

        if (permission == null)
        {
            return NotFound(new { message = "Role not found" });
        }

        _context.RolePermissions.Remove(permission);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Role deleted successfully" });
    }

    [HttpGet("roles")]
    public IActionResult GetRoles()
    {
        return Ok(new[]
        {
            "Admin",
            "Doctor",
            "Patient",
            "Receptionist"
        });
    }
}
