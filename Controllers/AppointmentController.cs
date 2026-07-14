
using AuthDemo.DTOs;
using AuthDemo.Services.Interfaces;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthDemo.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AppointmentController
    : ControllerBase
{
    private readonly IAppointmentService
        _appointmentService;

    public AppointmentController(
        IAppointmentService appointmentService)
    {
        _appointmentService =
            appointmentService;
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
    // GET ROLE
    // =====================================================

    private string GetRole()
    {
        var claim =
            User.Claims.FirstOrDefault(
                x => x.Type ==
                    "role"
            );

        if (claim == null)
        {
            return "";
        }

        return claim.Value;
    }

    // =====================================================
    // GET DOCTOR ID
    // =====================================================

    private int GetDoctorId()
    {
        var claim =
            User.Claims.FirstOrDefault(
                x => x.Type ==
                    "DoctorId"
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
    // CREATE APPOINTMENT
    // =====================================================

    [Authorize(Roles =
        "Admin,Receptionist")]
    [HttpPost]
    public async Task<IActionResult>
        Create(
            BookSlotDto dto)
    {
        var hospitalId =
            GetHospitalId();

        await _appointmentService
            .CreateAsync(
                dto,
                hospitalId
            );

        return Ok(new
        {
            message =
                "Appointment booked successfully"
        });
    }

    // =====================================================
    // GET ALL APPOINTMENTS
    // =====================================================

    [HttpGet]
    public async Task<IActionResult>
        GetAll()
    {
        var hospitalId =
            GetHospitalId();

        var role =
            GetRole();

        var doctorId =
            GetDoctorId();

        var data =
            await _appointmentService
                .GetAllAsync(
                    hospitalId
                );

        // =========================================
        // DOCTOR ONLY HIS APPOINTMENTS
        // =========================================

        if (role == "Doctor")
        {
            data =
                data.Where(x =>
                    x.DoctorId ==
                    doctorId
                )

                .ToList();
        }

        return Ok(data);
    }

    // =====================================================
    // UPDATE STATUS
    // =====================================================

    [HttpPatch("{id}/status")]
    public async Task<IActionResult>
        UpdateStatus(
            int id,

            [FromQuery]
            string status)
    {
        var hospitalId =
            GetHospitalId();

        var updated =
            await _appointmentService
                .UpdateStatusAsync(
                    id,
                    status,
                    hospitalId
                );

        if (!updated)
        {
            return NotFound(
                "Appointment not found"
            );
        }

        return Ok(new
        {
            message =
                "Appointment status updated"
        });
    }
}