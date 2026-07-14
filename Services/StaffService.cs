using AuthDemo.Data;
using AuthDemo.DTOs;
using AuthDemo.Helpers;
using AuthDemo.Models;
using AuthDemo.Services.Interfaces;

using Microsoft.EntityFrameworkCore;

namespace AuthDemo.Services;

public class StaffService
    : IStaffService
{
    private readonly AppDbContext
        _context;

    public StaffService(
        AppDbContext context)
    {
        _context = context;
    }

    // =====================================================
    // GET ALL STAFF
    // =====================================================

    public async Task<List<StaffResponseDto>>
        GetAllAsync(
            int hospitalId)
    {
        return await _context.Staffs

            .Where(x =>
                x.HospitalId ==
                hospitalId
            )

            .Include(x =>
                x.User
            )

            .OrderByDescending(x =>
                x.CreatedAt
            )

            .Select(x =>
                new StaffResponseDto
                {
                    Id =
                        x.Id,

                    Name =
                        x.User.Name,

                    Email =
                        x.User.Email,

                    Phone =
                        x.User.MobileNumber,

                    Role =
                        x.Role,

                    IsActive =
                        x.IsActive,

                    
                })

            .ToListAsync();
    }

    // =====================================================
    // CREATE STAFF
    // =====================================================

    public async Task<StaffResponseDto>
        CreateAsync(
            CreateStaffDto dto,
            string rootPath,
            int hospitalId)
    {
        // =================================================
        // EMAIL EXISTS
        // =================================================

        var exists =
            await _context.Users
                .AnyAsync(x =>
                    x.Email ==
                    dto.Email
                );

        if (exists)
        {
            throw new Exception(
                "Email already exists"
            );
        }

        // =================================================
        // CREATE USER
        // =================================================

        var user =
            new User
            {
                Name =
                    dto.Name,

                Email =
                    dto.Email,

                MobileNumber =
                    dto.Phone,

                Role =
                    dto.Role,

                PasswordHash =
                    BCrypt.Net.BCrypt
                        .HashPassword(
                            dto.Password
                        ),

                HospitalId =
                    hospitalId
            };

        _context.Users
            .Add(user);

        await _context
            .SaveChangesAsync();

        // =================================================
        // SAVE IMAGE
        // =================================================

        

        // =================================================
        // CREATE STAFF
        // =================================================

        var staff =
            new Staff
            {
                UserId =
                    user.Id,

                Role =
                    dto.Role,


                IsActive =
                    dto.IsActive,

                HospitalId =
                    hospitalId
            };

        _context.Staffs
            .Add(staff);

        await _context
            .SaveChangesAsync();

        // =================================================
        // RESPONSE
        // =================================================

        return new StaffResponseDto
        {
            Id =
                staff.Id,

            Name =
                user.Name,

            Email =
                user.Email,

            Phone =
                user.MobileNumber,

            Role =
                staff.Role,

            IsActive =
                staff.IsActive,

        };
    }

    // =====================================================
    // UPDATE STAFF
    // =====================================================

    public async Task<bool>
        UpdateAsync(
            int id,
            CreateStaffDto dto,
            string rootPath,
            int hospitalId)
    {
        var staff =
            await _context.Staffs

                .Include(x =>
                    x.User
                )

                .FirstOrDefaultAsync(x =>

                    x.Id == id &&

                    x.HospitalId ==
                    hospitalId
                );

        if (staff == null)
        {
            return false;
        }

        // =================================================
        // UPDATE USER
        // =================================================

        staff.User.Name =
            dto.Name;

        staff.User.Email =
            dto.Email;

        staff.User.MobileNumber =
            dto.Phone;

        // =================================================
        // UPDATE STAFF
        // =================================================

        staff.Role =
            dto.Role;

        staff.IsActive =
            dto.IsActive;

        // =================================================
        // UPDATE PASSWORD
        // =================================================

        if (!string.IsNullOrWhiteSpace(
                dto.Password))
        {
            staff.User.PasswordHash =
                BCrypt.Net.BCrypt
                    .HashPassword(
                        dto.Password
                    );
        }

        // =================================================
        // UPDATE IMAGE
        // =================================================



        await _context
            .SaveChangesAsync();

        return true;
    }



    // =====================================================
    // TOGGLE STAFF STATUS
    // =====================================================

    public async Task<bool>
        ToggleStatusAsync(
            int id,
            int hospitalId)
    {
        var staff =
            await _context.Staffs
                .FirstOrDefaultAsync(x =>

                    x.Id == id &&

                    x.HospitalId ==
                    hospitalId
                );

        if (staff == null)
        {
            return false;
        }

        staff.IsActive =
            !staff.IsActive;

        await _context
            .SaveChangesAsync();

        return true;
    }

    // =====================================================
    // DELETE STAFF
    // =====================================================

    public async Task<bool>
        DeleteAsync(
            int id,
            int hospitalId)
    {
        var staff =
            await _context.Staffs

                .Include(x =>
                    x.User
                )

                .FirstOrDefaultAsync(x =>

                    x.Id == id &&

                    x.HospitalId ==
                    hospitalId
                );

        if (staff == null)
        {
            return false;
        }

        // =================================================
        // DELETE USER
        // =================================================

        _context.Users
            .Remove(staff.User);

        // =================================================
        // DELETE STAFF
        // =================================================

        _context.Staffs
            .Remove(staff);

        await _context
            .SaveChangesAsync();

        return true;
    }
}
