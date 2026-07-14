

//using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Mvc;

//using Microsoft.EntityFrameworkCore;

//using AuthDemo.Data;
//using AuthDemo.DTOs;
//using AuthDemo.Models;

//namespace AuthDemo.Controllers;

//[ApiController]
//[Route("api/[controller]")]
//[Authorize]
//public class ScheduleController : ControllerBase
//{
//    private readonly AppDbContext _context;

//    public ScheduleController(
//        AppDbContext context)
//    {
//        _context = context;
//    }

//    // =====================================================
//    // GET HOSPITAL ID FROM JWT
//    // =====================================================

//    private int GetHospitalId()
//    {
//        return int.Parse(
//            User.Claims.First(
//                x => x.Type == "HospitalId"
//            ).Value
//        );
//    }

//    // =====================================================
//    // CREATE SCHEDULE
//    // =====================================================

//    [HttpPost]
//    public async Task<IActionResult> Create(
//        [FromBody] CreateScheduleDto dto)
//    {
//        var hospitalId =
//            GetHospitalId();

//        // =================================================
//        // VALIDATIONS
//        // =================================================

//        if (dto.StartDate > dto.EndDate)
//        {
//            return BadRequest(
//                "StartDate cannot be greater than EndDate"
//            );
//        }

//        if (dto.WorkStart >= dto.WorkEnd)
//        {
//            return BadRequest(
//                "WorkStart must be less than WorkEnd"
//            );
//        }

//        // =================================================
//        // CHECK DOCTOR
//        // =================================================

//        var doctor =
//            await _context.Doctors
//                .FirstOrDefaultAsync(x =>

//                    x.Id == dto.DoctorId &&

//                    x.HospitalId == hospitalId
//                );

//        if (doctor == null)
//        {
//            return NotFound(
//                "Doctor not found"
//            );
//        }

//        // =================================================
//        // CREATE SCHEDULE
//        // =================================================

//        var schedule =
//            new Schedule
//            {
//                DoctorId =
//                    dto.DoctorId,

//                StartDate =
//                    dto.StartDate,

//                EndDate =
//                    dto.EndDate,

//                Days =
//                    string.Join(
//                        ",",
//                        dto.Days
//                    ),

//                WorkStart =
//                    dto.WorkStart,

//                WorkEnd =
//                    dto.WorkEnd,

//                BreakStart =
//                    dto.BreakStart,

//                BreakEnd =
//                    dto.BreakEnd,

//                SlotDuration =
//                    dto.SlotDuration,

//                HospitalId =
//                    hospitalId
//            };

//        _context.Schedules.Add(
//            schedule
//        );

//        await _context.SaveChangesAsync();

//        return Ok(new
//        {
//            message =
//                "Schedule saved successfully"
//        });
//    }

//    // =====================================================
//    // GET DAY SLOTS
//    // =====================================================

//    [HttpGet("day-slots")]
//    public async Task<IActionResult>
//        GetSlots(
//            int doctorId,
//            DateTime date)
//    {
//        var hospitalId =
//            GetHospitalId();

//        // =================================================
//        // GET SCHEDULE
//        // =================================================

//        var schedule =
//            await _context.Schedules

//                .Where(x =>

//                    x.HospitalId == hospitalId &&

//                    x.DoctorId == doctorId &&

//                    date >= x.StartDate &&

//                    date <= x.EndDate
//                )

//                .OrderByDescending(x =>
//                    x.Id)

//                .FirstOrDefaultAsync();

//        if (schedule == null)
//        {
//            return NotFound(
//                "No schedule found"
//            );
//        }

//        // =================================================
//        // VALID DAYS
//        // =================================================

//        var validDays =
//            schedule.Days.Split(',');

//        if (!validDays.Contains(
//                date.DayOfWeek.ToString()))
//        {
//            return Ok(
//                new List<object>()
//            );
//        }

//        // =================================================
//        // BOOKINGS
//        // =================================================

//        var bookings =
//            await _context.Appointments

//                .Where(x =>

//                    x.HospitalId == hospitalId &&

//                    x.DoctorId == doctorId &&

//                    x.Date.Date == date.Date
//                )

//                .ToListAsync();

//        // =================================================
//        // GENERATE SLOTS
//        // =================================================

//        var result =
//            new List<object>();

//        var current =
//            schedule.WorkStart;

//        while (current < schedule.WorkEnd)
//        {
//            // =============================================
//            // BREAK TIME
//            // =============================================

//            if (current >= schedule.BreakStart &&
//                current < schedule.BreakEnd)
//            {
//                current =
//                    schedule.BreakEnd;

//                continue;
//            }

//            var end =
//                current.Add(
//                    TimeSpan.FromMinutes(
//                        schedule.SlotDuration
//                    )
//                );

//            bool isBooked =
//                bookings.Any(b =>
//                    b.StartTime == current);

//            result.Add(new
//            {
//                start = current,

//                end = end,

//                isBooked = isBooked
//            });

//            current = end;
//        }

//        return Ok(result);
//    }
//}




using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using Microsoft.EntityFrameworkCore;

using AuthDemo.Data;
using AuthDemo.DTOs;
using AuthDemo.Models;

namespace AuthDemo.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ScheduleController
    : ControllerBase
{
    private readonly AppDbContext
        _context;

    public ScheduleController(
        AppDbContext context)
    {
        _context = context;
    }

    // =====================================================
    // GET HOSPITAL ID FROM TOKEN
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
    // CREATE SCHEDULE
    // =====================================================

    [Authorize(Roles =
        "Admin")]
    [HttpPost]
    public async Task<IActionResult>
        Create(
            [FromBody]
            CreateScheduleDto dto)
    {
        // =========================================
        // GET HOSPITAL ID
        // =========================================

        var hospitalId =
            GetHospitalId();

        // =================================================
        // VALIDATIONS
        // =================================================

        if (dto.StartDate >
            dto.EndDate)
        {
            return BadRequest(
                "StartDate cannot be greater than EndDate"
            );
        }

        if (dto.WorkStart >=
            dto.WorkEnd)
        {
            return BadRequest(
                "WorkStart must be less than WorkEnd"
            );
        }

        // =================================================
        // CHECK DOCTOR
        // =================================================

        var doctor =
            await _context.Doctors

                .FirstOrDefaultAsync(x =>

                    x.Id ==
                    dto.DoctorId &&

                    x.HospitalId ==
                    hospitalId
                );

        if (doctor == null)
        {
            return NotFound(new
            {
                message =
                    "Doctor not found"
            });
        }

        // =================================================
        // CREATE SCHEDULE
        // =================================================

        var schedule =
            new Schedule
            {
                DoctorId =
                    dto.DoctorId,

                StartDate =
                    dto.StartDate,

                EndDate =
                    dto.EndDate,

                Days =
                    string.Join(
                        ",",
                        dto.Days
                    ),

                WorkStart =
                    dto.WorkStart,

                WorkEnd =
                    dto.WorkEnd,

                BreakStart =
                    dto.BreakStart,

                BreakEnd =
                    dto.BreakEnd,

                SlotDuration =
                    dto.SlotDuration,

                HospitalId =
                    hospitalId
            };

        _context.Schedules
            .Add(schedule);

        await _context
            .SaveChangesAsync();

        return Ok(new
        {
            message =
                "Schedule saved successfully"
        });
    }

    // =====================================================
    // GET DAY SLOTS
    // =====================================================

    [HttpGet("day-slots")]
    public async Task<IActionResult>
        GetSlots(
            int doctorId,
            DateTime date)
    {
        // =========================================
        // GET HOSPITAL ID
        // =========================================

        var hospitalId =
            GetHospitalId();

        // =================================================
        // GET SCHEDULE
        // =================================================

        var schedule =
            await _context.Schedules

                .Where(x =>

                    x.HospitalId ==
                    hospitalId &&

                    x.DoctorId ==
                    doctorId &&

                    date.Date >=
                    x.StartDate.Date &&

                    date.Date <=
                    x.EndDate.Date
                )

                .OrderByDescending(x =>
                    x.Id)

                .FirstOrDefaultAsync();

        if (schedule == null)
        {
            return NotFound(new
            {
                message =
                    "No schedule found"
            });
        }

        // =================================================
        // VALID DAYS
        // =================================================

        var validDays =
            schedule.Days
                .Split(',');

        if (!validDays.Contains(
                date.DayOfWeek
                    .ToString()))
        {
            return Ok(
                new List<object>()
            );
        }

        // =================================================
        // BOOKINGS
        // =================================================

        var bookings =
            await _context.Appointments

                .Where(x =>

                    x.HospitalId ==
                    hospitalId &&

                    x.DoctorId ==
                    doctorId &&

                    x.Date.Date ==
                    date.Date
                )

                .ToListAsync();

        // =================================================
        // GENERATE SLOTS
        // =================================================

        var result =
            new List<object>();

        var current =
            schedule.WorkStart;

        while (current <
               schedule.WorkEnd)
        {
            // =============================================
            // BREAK TIME
            // =============================================

            if (current >=
                    schedule.BreakStart &&

                current <
                    schedule.BreakEnd)
            {
                current =
                    schedule.BreakEnd;

                continue;
            }

            var end =
                current.Add(
                    TimeSpan.FromMinutes(
                        schedule
                            .SlotDuration
                    )
                );

            bool isBooked =
                bookings.Any(b =>
                    b.StartTime ==
                    current);

            result.Add(new
            {
                start =
                    current
                        .ToString(
                            @"hh\:mm"
                        ),

                end =
                    end
                        .ToString(
                            @"hh\:mm"
                        ),

                isBooked
            });

            current = end;
        }

        return Ok(result);
    }
}