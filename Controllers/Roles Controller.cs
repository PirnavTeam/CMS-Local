using System.Text.Json;
using AuthDemo.Data;
using AuthDemo.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthDemo.Controllers;

public class RoleRequest
{
    public string? RoleName { get; set; }
    public string? Name { get; set; }

    public bool? CanView { get; set; }
    public bool? CanCreate { get; set; }
    public bool? CanEdit { get; set; }
    public bool? CanDelete { get; set; }

    public JsonElement? Permissions { get; set; }
}

[ApiController]
[Route("api/roles")]
[Authorize(Roles = "SuperAdmin,Admin,Receptionist")]
public class RolesController : ControllerBase
{
    private readonly AppDbContext _context;

    public RolesController(AppDbContext context)
    {
        _context = context;
    }

    private static string GetRoleName(RoleRequest model)
    {
        return !string.IsNullOrWhiteSpace(model.RoleName)
            ? model.RoleName.Trim()
            : (model.Name ?? string.Empty).Trim();
    }

    private static bool ReadPermission(RoleRequest model, string key, bool existing)
    {
        if (model.Permissions.HasValue)
        {
            var p = model.Permissions.Value;

            if (p.ValueKind == JsonValueKind.Object &&
                p.TryGetProperty(key, out var value) &&
                (value.ValueKind == JsonValueKind.True || value.ValueKind == JsonValueKind.False))
            {
                return value.GetBoolean();
            }

            if (p.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in p.EnumerateArray())
                {
                    if (item.ValueKind == JsonValueKind.String &&
                        string.Equals(item.GetString(), key, StringComparison.OrdinalIgnoreCase))
                    {
                        return true;
                    }
                }

                return false;
            }

            if (p.ValueKind == JsonValueKind.String)
            {
                return string.Equals(p.GetString(), key, StringComparison.OrdinalIgnoreCase);
            }
        }

        return key.ToLowerInvariant() switch
        {
            "view" => model.CanView ?? existing,
            "create" => model.CanCreate ?? existing,
            "edit" => model.CanEdit ?? existing,
            "delete" => model.CanDelete ?? existing,
            _ => existing
        };
    }

    private static object ToResponse(RolePermission role, int assignedUsers = 0)
    {
        return new
        {
            id = role.Id,
            roleName = role.RoleName,
            name = role.RoleName,
            canView = role.CanView,
            canCreate = role.CanCreate,
            canEdit = role.CanEdit,
            canDelete = role.CanDelete,
            permissions = new
            {
                view = role.CanView,
                create = role.CanCreate,
                edit = role.CanEdit,
                delete = role.CanDelete
            },
            status = "active",
            assignedUsers
        };
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var roles = await _context.RolePermissions
            .OrderBy(x => x.RoleName)
            .ToListAsync();

        var userCounts = await _context.Users
            .Where(x => x.Role != null)
            .GroupBy(x => x.Role!)
            .Select(g => new { RoleName = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.RoleName, x => x.Count);

        var result = roles.Select(role =>
            ToResponse(role, userCounts.TryGetValue(role.RoleName, out var count) ? count : 0));

        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var role = await _context.RolePermissions.FindAsync(id);

        if (role == null)
        {
            return NotFound(new { message = "Role not found" });
        }

        var assignedUsers = await _context.Users.CountAsync(x => x.Role == role.RoleName);
        return Ok(ToResponse(role, assignedUsers));
    }

    [HttpPost]
    public async Task<IActionResult> Create(RoleRequest model)
    {
        var roleName = GetRoleName(model);

        if (string.IsNullOrWhiteSpace(roleName))
        {
            return BadRequest(new { message = "Role name is required" });
        }

        var exists = await _context.RolePermissions
            .AnyAsync(x => x.RoleName.ToLower() == roleName.ToLower());

        if (exists)
        {
            return BadRequest(new { message = "Role already exists" });
        }

        var role = new RolePermission
        {
            RoleName = roleName,
            CanView = ReadPermission(model, "view", true),
            CanCreate = ReadPermission(model, "create", true),
            CanEdit = ReadPermission(model, "edit", true),
            CanDelete = ReadPermission(model, "delete", true)
        };

        _context.RolePermissions.Add(role);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Role created successfully",
            role = ToResponse(role)
        });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, RoleRequest model)
    {
        var role = await _context.RolePermissions.FindAsync(id);

        if (role == null)
        {
            return NotFound(new { message = "Role not found" });
        }

        var roleName = GetRoleName(model);

        if (!string.IsNullOrWhiteSpace(roleName))
        {
            var duplicate = await _context.RolePermissions
                .AnyAsync(x => x.Id != id && x.RoleName.ToLower() == roleName.ToLower());

            if (duplicate)
            {
                return BadRequest(new { message = "Role already exists" });
            }

            role.RoleName = roleName;
        }

        role.CanView = ReadPermission(model, "view", role.CanView);
        role.CanCreate = ReadPermission(model, "create", role.CanCreate);
        role.CanEdit = ReadPermission(model, "edit", role.CanEdit);
        role.CanDelete = ReadPermission(model, "delete", role.CanDelete);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Role updated successfully",
            role = ToResponse(role)
        });
    }

    [HttpPut("{id:int}/permissions")]
    public async Task<IActionResult> UpdatePermissions(int id, RoleRequest model)
    {
        return await Update(id, model);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var role = await _context.RolePermissions.FindAsync(id);

        if (role == null)
        {
            return NotFound(new { message = "Role not found" });
        }

        var assignedUsers = await _context.Users.CountAsync(x => x.Role == role.RoleName);
        if (assignedUsers > 0)
        {
            return BadRequest(new { message = "Cannot delete role because users are assigned to this role" });
        }

        _context.RolePermissions.Remove(role);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Role deleted successfully" });
    }

    [HttpGet("roles")]
    public IActionResult GetRoles()
    {
        return Ok(new[]
        {
            "SuperAdmin",
            "Admin",
            "Doctor",
            "Patient",
            "Receptionist",
            "Staff"
        });
    }
}
