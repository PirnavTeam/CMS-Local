

using AuthDemo.DTOs;
using AuthDemo.Services.Interfaces;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthDemo.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class StaffController
    : ControllerBase
{
    private readonly IStaffService
        _staffService;

    private readonly IWebHostEnvironment
        _environment;

    public StaffController(
        IStaffService staffService,
        IWebHostEnvironment environment)
    {
        _staffService =
            staffService;

        _environment =
            environment;
    }

    // =====================================================
    // GET HOSPITAL ID
    // =====================================================

    private int GetHospitalId()
    {
        return int.Parse(
            User.Claims.First(
                x => x.Type ==
                    "HospitalId"
            ).Value
        );
    }

    // =====================================================
    // GET ALL STAFF
    // =====================================================

    [HttpGet]
    public async Task<IActionResult>
        GetAll()
    {
        var hospitalId =
            GetHospitalId();

        var data =
            await _staffService
                .GetAllAsync(
                    hospitalId
                );

        return Ok(data);
    }

    // =====================================================
    // CREATE STAFF
    // =====================================================

    [HttpPost]
    public async Task<IActionResult>
        Create(
            [FromForm]
            CreateStaffDto dto)
    {
        var hospitalId =
            GetHospitalId();

        var data =
            await _staffService
                .CreateAsync(
                    dto,
                    _environment
                        .WebRootPath,
                    hospitalId
                );

        return Ok(new
        {
            message =
                "Staff created successfully",

            data
        });
    }

    // =====================================================
    // UPDATE STAFF
    // =====================================================

    [HttpPut("{id}")]
    public async Task<IActionResult>
        Update(
            int id,

            [FromForm]
            CreateStaffDto dto)
    {
        var hospitalId =
            GetHospitalId();

        var updated =
            await _staffService
                .UpdateAsync(
                    id,
                    dto,
                    _environment
                        .WebRootPath,
                    hospitalId
                );

        if (!updated)
        {
            return NotFound(
                "Staff not found"
            );
        }

        return Ok(new
        {
            message =
                "Staff updated successfully"
        });
    }

    // =====================================================
    // TOGGLE STATUS
    // =====================================================

    [HttpPatch("{id}/toggle-status")]
    public async Task<IActionResult>
        ToggleStatus(
            int id)
    {
        var hospitalId =
            GetHospitalId();

        var updated =
            await _staffService
                .ToggleStatusAsync(
                    id,
                    hospitalId
                );

        if (!updated)
        {
            return NotFound(
                "Staff not found"
            );
        }

        return Ok(new
        {
            message =
                "Staff status updated"
        });
    }

    // =====================================================
    // DELETE STAFF
    // =====================================================

    [HttpDelete("{id}")]
    public async Task<IActionResult>
        Delete(int id)
    {
        var hospitalId =
            GetHospitalId();

        var deleted =
            await _staffService
                .DeleteAsync(
                    id,
                    hospitalId
                );

        if (!deleted)
        {
            return NotFound(
                "Staff not found"
            );
        }

        return Ok(new
        {
            message =
                "Staff deleted successfully"
        });
    }
}