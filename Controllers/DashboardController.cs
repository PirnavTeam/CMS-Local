
using AuthDemo.Helpers;
using System.Security.Claims;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using AuthDemo.Data;
using AuthDemo.DTOs;

namespace AuthDemo.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class DashboardController
    : ControllerBase
{
    private readonly AppDbContext
        _context;

    public DashboardController(
        AppDbContext context)
    {
        _context = context;
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
    // ADMIN DASHBOARD
    // =====================================================

    [HttpGet]
    public async Task<IActionResult>
        GetDashboard()
    {
        var hospitalId =
            GetHospitalId();

        var today =
            DateTime.Today;

        // =================================================
        // TOTAL DOCTORS
        // =================================================

        var totalDoctors =
            await _context.Doctors

                .CountAsync(x =>

                    x.HospitalId ==
                    hospitalId
                );

        // =================================================
        // TOTAL PATIENTS
        // =================================================

        var totalPatients =
            await _context.Patients

                .CountAsync(x =>

                    x.HospitalId ==
                    hospitalId
                );

        // =================================================
        // TOTAL APPOINTMENTS
        // =================================================

        var totalAppointments =
            await _context.Appointments

                .CountAsync(x =>

                    x.HospitalId ==
                    hospitalId
                );

        // =================================================
        // TODAY APPOINTMENTS
        // =================================================

        var todayAppointments =
            await _context.Appointments

                .CountAsync(x =>

                    x.HospitalId ==
                    hospitalId &&

                    x.Date.Date ==
                    today
                );

        // =================================================
        // COMPLETED APPOINTMENTS
        // =================================================

        var completedAppointments =
            await _context.Appointments

                .CountAsync(x =>

                    x.HospitalId ==
                    hospitalId &&

                    x.Status ==
                    "Completed"
                );

        // =================================================
        // WAITING APPOINTMENTS
        // =================================================

        var waitingAppointments =
            await _context.Appointments

                .CountAsync(x =>

                    x.HospitalId ==
                    hospitalId &&

                    x.Status ==
                    "Waiting"
                );

        // =================================================
        // TOTAL REVENUE
        // =================================================

        var totalRevenue =
    await _context.Billings

        .Where(x =>

            x.HospitalId ==
            hospitalId &&

            x.Status ==
            "Paid"
        )

        .SumAsync(x =>
            x.TotalAmount
        );
        // =================================================
        // GROWTH CHART
        // =================================================

        var patientData =
            await _context.Patients

                .Where(x =>
                    x.HospitalId ==
                    hospitalId
                )

                .GroupBy(x =>
                    new
                    {
                        x.CreatedAt.Year,
                        x.CreatedAt.Month
                    })

                .Select(g =>
                    new
                    {
                        g.Key.Year,
                        g.Key.Month,

                        Patients =
                            g.Count()
                    })

                .ToListAsync();

        var appointmentData =
            await _context.Appointments

                .Where(x =>
                    x.HospitalId ==
                    hospitalId
                )

                .GroupBy(x =>
                    new
                    {
                        x.CreatedAt.Year,
                        x.CreatedAt.Month
                    })

                .Select(g =>
                    new
                    {
                        g.Key.Year,
                        g.Key.Month,

                        Appointments =
                            g.Count()
                    })

                .ToListAsync();

        // =================================================
        // MERGE MONTHS
        // =================================================

        var allMonths =
            patientData

                .Select(x =>
                    new
                    {
                        x.Year,
                        x.Month
                    })

                .Union(
                    appointmentData
                        .Select(x =>
                            new
                            {
                                x.Year,
                                x.Month
                            })
                )

                .Distinct()

                .OrderBy(x =>
                    x.Year
                )

                .ThenBy(x =>
                    x.Month
                )

                .ToList();

        // =================================================
        // FINAL GROWTH CHART
        // =================================================

        var growthChart =
            allMonths

                .Select(m =>
                {
                    var patient =
                        patientData
                            .FirstOrDefault(x =>

                                x.Year ==
                                m.Year &&

                                x.Month ==
                                m.Month
                            );

                    var appointment =
                        appointmentData
                            .FirstOrDefault(x =>

                                x.Year ==
                                m.Year &&

                                x.Month ==
                                m.Month
                            );

                    return new ChartDto
                    {
                        Month =
                            new DateTime(
                                m.Year,
                                m.Month,
                                1
                            ).ToString("MMM"),

                        Patients =
                            patient?.Patients
                            ?? 0,

                        Appointments =
                            appointment?.Appointments
                            ?? 0
                    };
                })

                .ToList();

        // =================================================
        // REVENUE TREND
        // =================================================
        var revenueData =
    await _context.Billings

        .Where(x =>

            x.HospitalId ==
            hospitalId &&

            x.Status ==
            "Paid"
        )

        .GroupBy(x =>
            new
            {
                x.CreatedAt.Year,
                x.CreatedAt.Month
            })

        .Select(g =>
            new
            {
                g.Key.Year,
                g.Key.Month,

                Revenue =
                    g.Sum(x =>
                        x.TotalAmount)
            })

        .OrderBy(x =>
            x.Year)

        .ThenBy(x =>
            x.Month)

        .ToListAsync();
        var revenueTrend =
    revenueData
        .Select(r =>
            new RevenueTrendDto
            {
                Month =
                    new DateTime(
                        r.Year,
                        r.Month,
                        1
                    ).ToString("MMM"),

                Revenue =
                    r.Revenue
            })
        .ToList();

        // =================================================
        // DOCTOR REPORTS
        // =================================================

        var doctorReports =
            await _context.Appointments

                .Include(x =>
                    x.Doctor)

                .Where(x =>

                    x.HospitalId ==
                    hospitalId &&

                    x.Status ==
                    "Completed"
                )

                .GroupBy(x => new
                {
                    x.DoctorId,

                    doctorName =
                        x.Doctor == null
                            ? ""
                            : x.Doctor.Name,

                    specialization =
                        x.Doctor == null
                            ? ""
                            : x.Doctor.Specialization
                })

                .Select(g =>
                    new
                    {
                        doctorId =
                            g.Key.DoctorId,

                        doctorName =
                            g.Key.doctorName,

                        specialization =
                            g.Key.specialization,

                        completedAppointments =
                            g.Count(),

                        revenue =
                            g.Sum(x =>
                                x.Doctor == null
                                    ? 0
                                    : x.Doctor.Fees)
                    })

                .OrderByDescending(x =>
                    x.completedAppointments)

                .ToListAsync();

        // =================================================
        // CLINIC STATUS
        // =================================================

        var availableDoctors =
            await _context.Doctors

                .CountAsync(x =>

                    x.HospitalId ==
                    hospitalId &&

                    x.IsActive
                );

        var onLeaveDoctors =
            await _context.Doctors

                .CountAsync(x =>

                    x.HospitalId ==
                    hospitalId &&

                    !x.IsActive
                );

        var busyDoctors =
            await _context.Appointments

                .CountAsync(x =>

                    x.HospitalId ==
                    hospitalId &&

                    x.Date.Date ==
                    today &&

                    x.Status ==
                    "InProgress"
                );

        var clinicStatus =
            new ClinicStatusDto
            {
                Available =
                    availableDoctors,

                Busy =
                    busyDoctors,

                OnLeave =
                    onLeaveDoctors
            };

        // =================================================
        // RECENT ACTIVITIES
        // =================================================

        var recentAppointments =
            await _context.Appointments

                .Include(x =>
                    x.Patient)

                .Include(x =>
                    x.Doctor)

                .Where(x =>
                    x.HospitalId ==
                    hospitalId
                )

                .OrderByDescending(x =>
                    x.CreatedAt
                )

                .Take(5)

                .ToListAsync();

        var recentActivities =
            recentAppointments

                .Select(x =>
                    new ActivityDto
                    {
                        Title =
                            $"{x.Patient.Name} booked appointment with Dr. {x.Doctor.Name}",

                        Time =
                            x.CreatedAt
                                .ToString(
                                    "dd MMM yyyy hh:mm tt"
                                )
                    })

                .ToList();

        // =================================================
        // FINAL RESPONSE
        // =================================================

        var dashboard =
            new
            {
                totalDoctors,
                totalPatients,
                totalAppointments,
                todayAppointments,
                completedAppointments,
                waitingAppointments,
                totalRevenue,
                growthChart,
                revenueTrend,
                clinicStatus,
                doctorReports,
                recentActivities
            };

        return Ok(dashboard);
    }
    [Authorize(Roles = "Admin")]
    [HttpGet("ClincData")]
    public async Task<IActionResult> Dashboard()
    {
        var hospitalId = GetHospitalId();

        var clinic = await _context.Hospitals
            .FirstOrDefaultAsync(x => x.Id == hospitalId);

        if (clinic == null)
        {
            return NotFound(new
            {
                message = "Clinic not found"
            });
        }

        return Ok(new
        {
            clinicName = clinic.Name,
            contactNumber = clinic.Phone,
            email = clinic.Email,
            status = clinic.IsActive ? "Active" : "Inactive",
            address = clinic.Address
        });
    }
}