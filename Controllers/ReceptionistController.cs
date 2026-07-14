using AuthDemo.Helpers;
using AuthDemo.Data;
using AuthDemo.DTOs;
using AuthDemo.Models;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using Microsoft.EntityFrameworkCore;

namespace AuthDemo.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class ReceptionistController
    : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly EmailHelper _emailHelper;
    public ReceptionistController(
        AppDbContext context,
        EmailHelper emailHelper)
    {
        _context = context;
        _emailHelper = emailHelper;
    }

    // =====================================================
    // GET HOSPITAL ID
    // =====================================================

    private int GetHospitalId()
    {
        var claim =
            User.Claims.FirstOrDefault(
                x => x.Type ==
                    "HospitalId"
            );

        if (claim == null)
        {
            return 0;
        }

        return int.Parse(
            claim.Value
        );
    }

    // =====================================================
    // CREATE RECEPTIONIST
    // =====================================================
    [HttpPost]
    public async Task<IActionResult>
    Create(
        RegisterReceptionistDto dto)
    {
        var temporaryPassword =
            "Receptionist@" +
            Guid.NewGuid()
                .ToString("N")[..6];

        if (!dto.Email.EndsWith("@gmail.com"))
        {
            return BadRequest(new
            {
                message = "Only Gmail addresses are allowed."
            });
        }

        if (dto.Phone.Length != 10 ||
            !dto.Phone.All(char.IsDigit) ||
            !"6789".Contains(dto.Phone[0]))
        {
            return BadRequest(new
            {
                message = "Enter a valid mobile number."
            });
        }

        var hospitalId = GetHospitalId();

        var exists =
            await _context.Users
                .AnyAsync(x => x.Email == dto.Email);

        if (exists)
        {
            return BadRequest(new
            {
                message = "Email already exists"
            });
        }

        var passwordHash =
            BCrypt.Net.BCrypt
                .HashPassword(temporaryPassword);

        var receptionist =
            new Receptionist
            {
                Name = dto.Name,
                Email = dto.Email,
                Phone = dto.Phone,
                PasswordHash = passwordHash,
                HospitalId = hospitalId
            };

        _context.Receptionists.Add(receptionist);

        var user =
            new User
            {
                Name = dto.Name,
                Email = dto.Email,
                MobileNumber = dto.Phone,
                PasswordHash = passwordHash,
                Role = "Receptionist",
                HospitalId = hospitalId
            };

        _context.Users.Add(user);

        await _context.SaveChangesAsync();

        await _emailHelper.SendAdminCredentials(
    dto.Email,
    temporaryPassword);

        return Ok(new
        {
            message = "Receptionist created successfully",
            temporaryPassword = temporaryPassword,
            receptionistId = receptionist.Id
        });
    }

    // =====================================================
    // GET ALL RECEPTIONISTS
    // =====================================================

    
    [HttpGet]
    public async Task<IActionResult>
        GetAll()
    {
        var hospitalId =
            GetHospitalId();

        var data =
            await _context.Receptionists

                .Where(x =>
                    x.HospitalId ==
                    hospitalId
                )

                .OrderByDescending(x =>
                    x.CreatedAt
                )

                .Select(x =>
                    new
                    {
                        x.Id,
                        x.Name,
                        x.Email,
                        x.Phone,
                        x.IsActive,
                        x.HospitalId,
                        x.CreatedAt
                    })

                .ToListAsync();

        return Ok(data);
    }

    // =====================================================
    // GET RECEPTIONIST BY ID
    // =====================================================
    
    
    [HttpGet("{id}")]
    public async Task<IActionResult>
        GetById(
            int id)
    {
        var hospitalId =
            GetHospitalId();

        var receptionist =
            await _context.Receptionists

                .Where(x =>

                    x.Id == id &&

                    x.HospitalId ==
                    hospitalId
                )

                .Select(x =>
                    new
                    {
                        x.Id,
                        x.Name,
                        x.Email,
                        x.Phone,
                        x.IsActive,
                        x.HospitalId,
                        x.CreatedAt
                    })

                .FirstOrDefaultAsync();

        if (receptionist == null)
        {
            return NotFound(new
            {
                message =
                    "Receptionist not found"
            });
        }

        return Ok(receptionist);
    }

    // =====================================================
    // UPDATE RECEPTIONIST
    // =====================================================
    
   
    [HttpPut("{id}")]
    public async Task<IActionResult>
        Update(
            int id,

            RegisterReceptionistDto dto)
    {
        var hospitalId =
            GetHospitalId();

        var receptionist =
            await _context.Receptionists

                .FirstOrDefaultAsync(x =>

                    x.Id == id &&

                    x.HospitalId ==
                    hospitalId
                );

        if (receptionist == null)
        {
            return NotFound(new
            {
                message =
                    "Receptionist not found"
            });
        }

        receptionist.Name =
            dto.Name;

        receptionist.Email =
            dto.Email;

        receptionist.Phone =
            dto.Phone;

        // =================================================
        // UPDATE LOGIN USER
        // =================================================

        var user =
            await _context.Users

                .FirstOrDefaultAsync(x =>
                    x.Email ==
                    receptionist.Email
                );

        if (user != null)
        {
            user.Name =
                dto.Name;

            user.Email =
                dto.Email;

            user.MobileNumber =
                dto.Phone;
        }

        await _context
            .SaveChangesAsync();

        return Ok(new
        {
            message =
                "Receptionist updated successfully"
        });
    }

    // =====================================================
    // DELETE RECEPTIONIST
    // =====================================================
    
   
    [HttpDelete("{id}")]
    public async Task<IActionResult>
        Delete(
            int id)
    {
        var hospitalId =
            GetHospitalId();

        var receptionist =
            await _context.Receptionists

                .FirstOrDefaultAsync(x =>

                    x.Id == id &&

                    x.HospitalId ==
                    hospitalId
                );

        if (receptionist == null)
        {
            return NotFound(new
            {
                message =
                    "Receptionist not found"
            });
        }

        // =================================================
        // DELETE LOGIN USER
        // =================================================

        var user =
            await _context.Users

                .FirstOrDefaultAsync(x =>
                    x.Email ==
                    receptionist.Email
                );

        if (user != null)
        {
            _context.Users
                .Remove(user);
        }

        _context.Receptionists
            .Remove(receptionist);

        await _context
            .SaveChangesAsync();

        return Ok(new
        {
            message =
                "Receptionist deleted successfully"
        });
    }
}
