
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using AuthDemo.Data;

namespace AuthDemo.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Receptionist")]
public class ReceptionistDashboardController
    : ControllerBase
{
    private readonly AppDbContext
        _context;

    public ReceptionistDashboardController(
        AppDbContext context)
    {
        _context = context;
    }

    // =====================================
    // GET HOSPITAL ID FROM TOKEN
    // =====================================

    private int GetHospitalId()
    {
        var claim =
            User.Claims.FirstOrDefault(
                x => x.Type == "HospitalId"
            );

        if (claim == null)
        {
            return 0;
        }

        return int.Parse(
            claim.Value
        );
    }

    // =====================================
    // DASHBOARD
    // =====================================

    [HttpGet]
    public async Task<IActionResult>
        Dashboard()
    {
        var hospitalId =
            GetHospitalId();

        var today =
            DateTime.Today;

        var appointments =
            _context.Appointments
                .Where(x =>
                    x.HospitalId ==
                    hospitalId
                );

        var totalToday =
            await appointments
                .CountAsync(x =>
                    x.Date.Date ==
                    today
                );

        var waiting =
            await appointments
                .CountAsync(x =>

                    x.Date.Date ==
                    today &&

                    x.Status ==
                    "Waiting"
                );

        var completed =
            await appointments
                .CountAsync(x =>

                    x.Date.Date ==
                    today &&

                    x.Status ==
                    "Completed"
                );

        return Ok(new
        {
            totalTodayAppointments =
                totalToday,

            waitingAppointments =
                waiting,

            completedAppointments =
                completed
        });
    }
}

