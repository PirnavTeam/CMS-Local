

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using Microsoft.EntityFrameworkCore;

using AuthDemo.Data;
using AuthDemo.DTOs;

namespace AuthDemo.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportController
    : ControllerBase
{
    private readonly AppDbContext
        _context;

    public ReportController(
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
    // GET ROLE
    // =====================================================

    private string GetRole()
    {
        var claim =
            User.Claims.FirstOrDefault(
                x => x.Type ==
                    "role"
            );

        return claim == null
            ? ""
            : claim.Value;
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
    // DAILY APPOINTMENT REPORT
    // =====================================================

    [HttpGet("daily-appointments")]
    public async Task<IActionResult>
        GetDailyReport(
            DateTime? fromDate,
            DateTime? toDate,
            int? doctorId)
    {
        var hospitalId =
            GetHospitalId();

        var role =
            GetRole();

        var loggedDoctorId =
            GetDoctorId();

        var query =
            _context.Appointments

                .Where(x =>

                    x.HospitalId ==
                    hospitalId
                )

                .AsQueryable();

        // =================================================
        // DOCTOR ONLY OWN DATA
        // =================================================

        if (role == "Doctor")
        {
            query =
                query.Where(x =>
                    x.DoctorId ==
                    loggedDoctorId
                );
        }
        else if (
            doctorId.HasValue &&
            doctorId.Value > 0)
        {
            query =
                query.Where(x =>
                    x.DoctorId ==
                    doctorId.Value
                );
        }

        // =================================================
        // DATE FILTER
        // =================================================

        if (fromDate.HasValue)
        {
            query =
                query.Where(x =>
                    x.Date.Date >=
                    fromDate.Value.Date
                );
        }

        if (toDate.HasValue)
        {
            query =
                query.Where(x =>
                    x.Date.Date <=
                    toDate.Value.Date
                );
        }

        var data =
            await query
                .ToListAsync();

        var daysOrder =
            new[]
            {
                DayOfWeek.Monday,
                DayOfWeek.Tuesday,
                DayOfWeek.Wednesday,
                DayOfWeek.Thursday,
                DayOfWeek.Friday,
                DayOfWeek.Saturday,
                DayOfWeek.Sunday
            };

        var result =
            daysOrder
                .Select(day =>
                {
                    var dayData =
                        data.Where(x =>
                            x.Date.DayOfWeek ==
                            day);

                    return new
                    {
                        day =
                            day.ToString()
                                .Substring(0, 3),

                        appointments =
                            dayData.Count(),

                        completed =
                            dayData.Count(x =>
                                x.Status ==
                                "Completed")
                    };
                })

                .ToList();

        return Ok(result);
    }

    // =====================================================
    // REVENUE REPORT
    // =====================================================

    [HttpGet("revenue")]
    public async Task<IActionResult>
        GetRevenueReport(
            DateTime? fromDate,
            DateTime? toDate,
            int? doctorId)
    {
        var hospitalId =
            GetHospitalId();

        var role =
            GetRole();

        var loggedDoctorId =
            GetDoctorId();

        var query =
            _context.Appointments

                .Include(x =>
                    x.Doctor)

                .Where(x =>

                    x.HospitalId ==
                    hospitalId &&

                    x.Status ==
                    "Completed"
                )

                .AsQueryable();

        // =================================================
        // DOCTOR ONLY OWN REVENUE
        // =================================================

        if (role == "Doctor")
        {
            query =
                query.Where(x =>
                    x.DoctorId ==
                    loggedDoctorId
                );
        }
        else if (
            doctorId.HasValue &&
            doctorId.Value > 0)
        {
            query =
                query.Where(x =>
                    x.DoctorId ==
                    doctorId.Value
                );
        }

        // =================================================
        // DATE FILTER
        // =================================================

        if (fromDate.HasValue)
        {
            query =
                query.Where(x =>
                    x.Date.Date >=
                    fromDate.Value.Date
                );
        }

        if (toDate.HasValue)
        {
            query =
                query.Where(x =>
                    x.Date.Date <=
                    toDate.Value.Date
                );
        }

        var data =
            await query
                .ToListAsync();

        var grouped =
            data

                .GroupBy(x => new
                {
                    x.Date.Year,
                    x.Date.Month
                })

                .Select(g => new
                {
                    monthNumber =
                        g.Key.Month,

                    monthName =
                        new DateTime(
                            1,
                            g.Key.Month,
                            1
                        ).ToString("MMM"),

                    revenue =
                        g.Sum(x =>
                            x.Doctor == null
                                ? 0
                                : x.Doctor.Fees)
                })

                .OrderBy(x =>
                    x.monthNumber)

                .ToList();

        decimal previousRevenue = 0;

        var result =
            new List<RevenueReportDto>();

        foreach (var item in grouped)
        {
            double growth = 0;

            if (previousRevenue > 0)
            {
                growth =
                    (double)
                    (
                        (item.revenue -
                         previousRevenue)

                        / previousRevenue
                    ) * 100;
            }

            result.Add(
                new RevenueReportDto
                {
                    Month =
                        item.monthName,

                    Revenue =
                        item.revenue,

                    Growth =
                        Math.Round(
                            growth,
                            1
                        )
                });

            previousRevenue =
                item.revenue;
        }

        return Ok(result);
    }

    // =====================================================
    // DOCTOR WISE REPORT
    // =====================================================

    [HttpGet("doctor-wise")]
    public async Task<IActionResult>
        GetDoctorWiseReport(
            DateTime? fromDate,
            DateTime? toDate,
            int? doctorId)
    {
        var hospitalId =
            GetHospitalId();

        var role =
            GetRole();

        var loggedDoctorId =
            GetDoctorId();

        var query =
            _context.Appointments

                .Include(x =>
                    x.Doctor)

                .Where(x =>

                    x.HospitalId ==
                    hospitalId &&

                    x.Status ==
                    "Completed"
                )

                .AsQueryable();

        // =================================================
        // DOCTOR ONLY OWN REPORT
        // =================================================

        if (role == "Doctor")
        {
            query =
                query.Where(x =>
                    x.DoctorId ==
                    loggedDoctorId
                );
        }
        else if (
            doctorId.HasValue &&
            doctorId.Value > 0)
        {
            query =
                query.Where(x =>
                    x.DoctorId ==
                    doctorId.Value
                );
        }

        // =================================================
        // DATE FILTER
        // =================================================

        if (fromDate.HasValue)
        {
            query =
                query.Where(x =>
                    x.Date.Date >=
                    fromDate.Value.Date
                );
        }

        if (toDate.HasValue)
        {
            query =
                query.Where(x =>
                    x.Date.Date <=
                    toDate.Value.Date
                );
        }

        var data =
            await query
                .ToListAsync();

        var result =
            data

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
                    new DoctorWiseReportDto
                    {
                        DoctorName =
                            g.Key.doctorName,

                        Specialization =
                            g.Key.specialization,

                        Appointments =
                            g.Count(),

                        Revenue =
                            g.Sum(x =>
                                x.Doctor == null
                                    ? 0
                                    : x.Doctor.Fees)
                    })

                .OrderByDescending(x =>
                    x.Appointments)

                .ToList();

        return Ok(result);
    }
}