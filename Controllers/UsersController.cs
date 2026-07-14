using AuthDemo.Data;
using AuthDemo.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthDemo.Controllers;

public class CreateUserRequest
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Clinic { get; set; }
    public int? HospitalId { get; set; }
    public int? ClinicId { get; set; }
    public string Type { get; set; } = "Patient";
    public string Role { get; set; } = "Patient";
    public string? Status { get; set; }
    public string? Phone { get; set; }
    public string? MobileNumber { get; set; }
    public string? Password { get; set; }
}

[ApiController]
[Route("api/users")]
[Authorize(Roles = "SuperAdmin")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await _context.Users
            .Include(x => x.Hospital)
            .Where(x => x.Role != "SuperAdmin")
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new
            {
                x.Id,
                x.Name,
                x.Email,
                phone = x.MobileNumber,
                mobileNumber = x.MobileNumber,
                type = x.Role,
                role = x.Role,
                hospitalId = x.HospitalId,
                clinicId = x.HospitalId,
                clinic = x.Hospital == null ? "" : x.Hospital.Name,
                clinicName = x.Hospital == null ? "" : x.Hospital.Name,
                x.IsActive,
                status = x.IsActive ? "active" : "inactive",
                x.CreatedAt
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _context.Users
            .Include(x => x.Hospital)
            .Where(x => x.Id == id && x.Role != "SuperAdmin")
            .Select(x => new
            {
                x.Id,
                x.Name,
                x.Email,
                phone = x.MobileNumber,
                mobileNumber = x.MobileNumber,
                type = x.Role,
                role = x.Role,
                hospitalId = x.HospitalId,
                clinicId = x.HospitalId,
                clinic = x.Hospital == null ? "" : x.Hospital.Name,
                clinicName = x.Hospital == null ? "" : x.Hospital.Name,
                x.IsActive,
                status = x.IsActive ? "active" : "inactive"
            })
            .FirstOrDefaultAsync();

        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        return Ok(user);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateUserRequest dto)
    {
        var exists = await _context.Users.AnyAsync(x => x.Email == dto.Email);

        if (exists)
        {
            return BadRequest(new { message = "Email already exists" });
        }

        var hospitalId = dto.HospitalId ?? dto.ClinicId ?? 0;
        var hospital = await _context.Hospitals.FirstOrDefaultAsync(x => x.Id == hospitalId && x.IsActive);

        if (hospital == null)
        {
            return BadRequest(new { message = "Clinic not found" });
        }

        var role = !string.IsNullOrWhiteSpace(dto.Role) ? dto.Role : dto.Type;
        var password = !string.IsNullOrWhiteSpace(dto.Password)
            ? dto.Password
            : role + "@" + Guid.NewGuid().ToString("N")[..6];

        var user = new User
        {
            Name = dto.Name,
            Email = dto.Email,
            MobileNumber = !string.IsNullOrWhiteSpace(dto.MobileNumber) ? dto.MobileNumber : (dto.Phone ?? ""),
            Role = role,
            HospitalId = hospitalId,
            IsActive = string.IsNullOrWhiteSpace(dto.Status) || !dto.Status.Equals("inactive", StringComparison.OrdinalIgnoreCase),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            MustChangePassword = true
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "User created successfully",
            id = user.Id,
            temporaryPassword = password
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, CreateUserRequest dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == id && x.Role != "SuperAdmin");

        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        var hospitalId = dto.HospitalId ?? dto.ClinicId ?? user.HospitalId;
        var hospitalExists = await _context.Hospitals.AnyAsync(x => x.Id == hospitalId && x.IsActive);

        if (!hospitalExists)
        {
            return BadRequest(new { message = "Clinic not found" });
        }

        user.Name = dto.Name;
        user.Email = dto.Email;
        user.MobileNumber = !string.IsNullOrWhiteSpace(dto.MobileNumber) ? dto.MobileNumber : (dto.Phone ?? user.MobileNumber);
        user.Role = !string.IsNullOrWhiteSpace(dto.Role) ? dto.Role : dto.Type;
        user.HospitalId = hospitalId;
        user.IsActive = string.IsNullOrWhiteSpace(dto.Status) || !dto.Status.Equals("inactive", StringComparison.OrdinalIgnoreCase);

        await _context.SaveChangesAsync();

        return Ok(new { message = "User updated successfully" });
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, CreateUserRequest dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == id && x.Role != "SuperAdmin");

        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        user.IsActive = string.IsNullOrWhiteSpace(dto.Status) || !dto.Status.Equals("inactive", StringComparison.OrdinalIgnoreCase);

        await _context.SaveChangesAsync();

        return Ok(new { message = "User status updated successfully", user.IsActive });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == id && x.Role != "SuperAdmin");

        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        user.IsActive = false;
        await _context.SaveChangesAsync();

        return Ok(new { message = "User deactivated successfully" });
    }
}
