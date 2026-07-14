using AuthDemo.Data;
using AuthDemo.DTOs;
using AuthDemo.Helpers;
using AuthDemo.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthDemo.Controllers;

[ApiController]
[Route("api/admins")]
[Authorize(Roles = "SuperAdmin")]
public class AdminManagementController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly EmailHelper _emailHelper;

    public AdminManagementController(AppDbContext context, EmailHelper emailHelper)
    {
        _context = context;
        _emailHelper = emailHelper;
    }

    [HttpPost]
    public async Task<IActionResult> CreateAdmin(CreateAdminDto dto)
    {
        if (!dto.Email.EndsWith("@gmail.com"))
        {
            return BadRequest(new
            {
                message = "Only Gmail addresses are allowed."
            });
        }

  
        var hospitalId = dto.HospitalId; ;
        var name = !string.IsNullOrWhiteSpace(dto.Name) ? dto.Name : (dto.FullName ?? string.Empty);
            var phone = dto.MobileNumber; 

        if (hospitalId <= 0)
            return BadRequest(new { message = "Clinic is required" });

        if (string.IsNullOrWhiteSpace(name))
            return BadRequest(new { message = "Admin name is required" });

        if (string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest(new { message = "Email is required" });

        var hospital = await _context.Hospitals
            .FirstOrDefaultAsync(x => x.Id == hospitalId && x.IsActive);

        if (hospital == null)
            return BadRequest(new { message = "Clinic not found" });

        var exists = await _context.Users.AnyAsync(x => x.Email == dto.Email);

        if (exists)
            return BadRequest(new { message = "Email already exists" });

        var temporaryPassword =
    "Admin@" +
    Guid.NewGuid()
        .ToString("N")
        .Substring(0, 6);
                    

        var admin = new User
        {
            Name = name.Trim(),
            MobileNumber = phone.Trim(),
            Email = dto.Email.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(temporaryPassword),
            MustChangePassword = true,
            Role = "Admin",
            HospitalId = hospitalId,
            IsActive = true
        };

        _context.Users.Add(admin);
        await _context.SaveChangesAsync();

        if (dto.SendWelcomeEmail)
            await _emailHelper.SendAdminCredentials(dto.Email, temporaryPassword);

        return Ok(new
        {
            message = "Admin created successfully",
            temporaryPassword,
            id = admin.Id,
            adminId = admin.Id
        });
    }

    [HttpGet]
    public async Task<IActionResult> GetAllAdmins()
    {

       

        var admins = await _context.Users
            .Include(x => x.Hospital)
            .Where(x => x.Role == "Admin" )
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new
            {
                id = x.Id,
                name = x.Name,
                fullName = x.Name,
                email = x.Email,
                mobileNumber = x.MobileNumber,
                phone = x.MobileNumber,
                role = x.Role,
                roleName = x.Role,
                hospitalId = x.HospitalId,
                clinicId = x.HospitalId,
                clinicName = x.Hospital.Name,
                clinic = x.Hospital.Name,
                isActive = x.IsActive,
                status = x.IsActive ? "active" : "inactive",
                forcePasswordChange = x.MustChangePassword,
                mustChangePassword = x.MustChangePassword
            })
            .ToListAsync();

        return Ok(admins);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetAdmin(int id)
    {
        var admin = await _context.Users
            .Include(x => x.Hospital)
            .Where(x => x.Id == id && x.Role == "Admin" && x.IsActive)
            .Select(x => new
            {
                id = x.Id,
                name = x.Name,
                fullName = x.Name,
                email = x.Email,
                mobileNumber = x.MobileNumber,
                phone = x.MobileNumber,
                role = x.Role,
                roleName = x.Role,
                hospitalId = x.HospitalId,
                clinicId = x.HospitalId,
                clinicName = x.Hospital.Name,
                clinic = x.Hospital.Name,
                isActive = x.IsActive,
                status = x.IsActive ? "active" : "inactive",
                forcePasswordChange = x.MustChangePassword,
                mustChangePassword = x.MustChangePassword
            })
            .FirstOrDefaultAsync();

        if (admin == null)
            return NotFound(new { message = "Admin not found" });

        return Ok(admin);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAdmin(int id, CreateAdminDto dto)
    {
        var admin = await _context.Users
            .FirstOrDefaultAsync(x => x.Id == id && x.Role == "Admin");

        if (admin == null)
            return NotFound(new { message = "Admin not found" });

        var hospitalId = dto.HospitalId;
        var hospitalExists = await _context.Hospitals
            .AnyAsync(x => x.Id == hospitalId && x.IsActive);

        if (!hospitalExists)
            return BadRequest(new { message = "Clinic not found" });

        admin.Name = !string.IsNullOrWhiteSpace(dto.Name) ? dto.Name : (dto.FullName ?? admin.Name);
        admin.Email = dto.Email;
        admin.MobileNumber = dto.MobileNumber;
        admin.HospitalId = hospitalId;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Admin updated successfully" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAdmin(int id)
    {
        var admin = await _context.Users
            .FirstOrDefaultAsync(x => x.Id == id && x.Role == "Admin");

        if (admin == null)
            return NotFound(new { message = "Admin not found" });

        _context.Users.Remove(admin);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Admin deleted successfully"
        });
    }
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id,
    [FromQuery] string status)
    {
        var admin = await _context.Users
            .FirstOrDefaultAsync(x => x.Id == id && x.Role == "Admin");

        if (admin == null)
            return NotFound(new { message = "Admin not found" });

        if (status != "Active" && status != "Inactive")
        {
            return BadRequest(new
            {
                message = "Status must be Active or Inactive"
            });
        }

        admin.IsActive = status == "Active";

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = $"Admin {status.ToLower()} successfully"
        });
    }

}

