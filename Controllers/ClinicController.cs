using AuthDemo.Data;
using AuthDemo.DTOs;
using AuthDemo.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthDemo.Controllers;

[ApiController]
[Route("api/clinics")]
[Route("api/Clinic")]
[Authorize(Roles = "SuperAdmin")]
public class ClinicController : ControllerBase
{
    private readonly AppDbContext _context;

    public ClinicController(AppDbContext context)
    {
        _context = context;
    }

    private static string GetClinicName(CreateClinicDto dto)
    {
        return dto.ClinicName ?? dto.Name ?? string.Empty;
    }

    private static string GetPhone(CreateClinicDto dto)
    {
        return dto.PhoneNumber ?? dto.ContactNumber ?? dto.Phone ?? string.Empty;
    }

    private static string GetAddress(CreateClinicDto dto)
    {
        if (!string.IsNullOrWhiteSpace(dto.Address)) return dto.Address;
        if (!string.IsNullOrWhiteSpace(dto.Location)) return dto.Location;

        var parts = new[] { dto.City, dto.State, dto.Country, dto.PostalCode }
            .Where(x => !string.IsNullOrWhiteSpace(x));

        return string.Join(", ", parts);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateClinicDto dto)
    {
        var clinicName = GetClinicName(dto).Trim();
        var email = dto.Email?.Trim() ?? string.Empty;
        var phone = GetPhone(dto).Trim();
        var address = GetAddress(dto).Trim();

        if (string.IsNullOrWhiteSpace(clinicName))
            return BadRequest(new { message = "Clinic name is required" });

        if (string.IsNullOrWhiteSpace(email))
            return BadRequest(new { message = "Email is required" });

        var exists = await _context.Hospitals
            .AnyAsync(x => x.Email == email || x.Name == clinicName);

        if (exists)
            return BadRequest(new { message = "Clinic already exists" });

        var hospital = new Hospital
        {
            Name = clinicName,
            Email = email,
            Phone = phone,
            Address = address,
            IsActive = dto.IsActive
        };

        _context.Hospitals.Add(hospital);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Clinic created successfully",
            id = hospital.Id,
            clinicId = hospital.Id
        });
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var clinics = await _context.Hospitals
            .Where(x => x.Email != "platform@cms.local" && x.IsActive)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new
            {
                id = x.Id,
                clinicId = x.Id,
                clinicName = x.Name,
                name = x.Name,
                email = x.Email,
                phoneNumber = x.Phone,
                contactNumber = x.Phone,
                address = x.Address,
                location = x.Address,
                isActive = x.IsActive,
                status = x.IsActive ? "active" : "inactive",
                createdAt = x.CreatedAt
            })
            .ToListAsync();

        return Ok(clinics);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var clinic = await _context.Hospitals
            .Where(x => x.Id == id)
            .Select(x => new
            {
                id = x.Id,
                clinicId = x.Id,
                clinicName = x.Name,
                name = x.Name,
                email = x.Email,
                phoneNumber = x.Phone,
                contactNumber = x.Phone,
                address = x.Address,
                location = x.Address,
                isActive = x.IsActive,
                status = x.IsActive ? "active" : "inactive",
                createdAt = x.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (clinic == null)
            return NotFound(new { message = "Clinic not found" });

        return Ok(clinic);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, CreateClinicDto dto)
    {
        var hospital = await _context.Hospitals.FirstOrDefaultAsync(x => x.Id == id);

        if (hospital == null)
            return NotFound(new { message = "Clinic not found" });

        hospital.Name = GetClinicName(dto).Trim();
        hospital.Email = dto.Email?.Trim() ?? hospital.Email;
        hospital.Phone = GetPhone(dto).Trim();
        hospital.Address = GetAddress(dto).Trim();
        hospital.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Clinic updated successfully" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var hospital = await _context.Hospitals.FirstOrDefaultAsync(x => x.Id == id);

        if (hospital == null)
            return NotFound(new { message = "Clinic not found" });

        hospital.IsActive = false;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Clinic deactivated successfully" });
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> ChangeStatus(int id)
    {
        var hospital = await _context.Hospitals.FirstOrDefaultAsync(x => x.Id == id);

        if (hospital == null)
            return NotFound(new { message = "Clinic not found" });

        hospital.IsActive = !hospital.IsActive;
        await _context.SaveChangesAsync();

        return Ok(new
        {
            id = hospital.Id,
            isActive = hospital.IsActive,
            status = hospital.IsActive ? "active" : "inactive"
        });
    }
}
