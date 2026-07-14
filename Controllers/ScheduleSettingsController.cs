//using Microsoft.AspNetCore.Mvc;
//using Microsoft.EntityFrameworkCore;
//using AuthDemo.Data;
//using AuthDemo.DTOs;
//using AuthDemo.Models;

//namespace AuthDemo.Controllers;

//[ApiController]
//[Route("api/[controller]")]
//public class ScheduleSettingsController : ControllerBase
//{
//    private readonly AppDbContext _context;

//    public ScheduleSettingsController(
//        AppDbContext context)
//    {
//        _context = context;
//    }

//    // =====================================================
//    // GET SETTINGS
//    // =====================================================

//    // GET:
//    // api/ScheduleSettings

//    [HttpGet]
//    public async Task<IActionResult> GetSettings()
//    {
//        var setting = await _context
//            .ScheduleSettings
//            .OrderByDescending(x => x.Id)
//            .FirstOrDefaultAsync();

//        if (setting == null)
//        {
//            return Ok(new
//            {
//                SlotDuration = 30,
//                ClinicOpen = "09:00",
//                ClinicClose = "18:00"
//            });
//        }

//        return Ok(new
//        {
//            setting.Id,
//            setting.SlotDuration,

//            ClinicOpen = setting.ClinicOpen
//                .ToString(@"hh\:mm"),

//            ClinicClose = setting.ClinicClose
//                .ToString(@"hh\:mm")
//        });
//    }

//    // =====================================================
//    // CREATE SETTINGS
//    // =====================================================

//    // POST:
//    // api/ScheduleSettings

//    [HttpPost]
//    public async Task<IActionResult> CreateSettings(
//        [FromBody]
//        CreateScheduleSettingDto dto)
//    {
//        var setting =
//            new ScheduleSetting
//            {
//                SlotDuration =
//                    dto.SlotDuration,

//                ClinicOpen =
//                    dto.ClinicOpen,

//                ClinicClose =
//                    dto.ClinicClose
//            };

//        _context.ScheduleSettings
//            .Add(setting);

//        await _context
//            .SaveChangesAsync();

//        return Ok(new
//        {
//            message =
//                "Schedule settings created"
//        });
//    }

//    // =====================================================
//    // UPDATE SETTINGS
//    // =====================================================

//    // PUT:
//    // api/ScheduleSettings/1

//    [HttpPut("{id}")]
//    public async Task<IActionResult> UpdateSettings(
//        int id,
//        [FromBody]
//        CreateScheduleSettingDto dto)
//    {
//        var setting = await _context
//            .ScheduleSettings
//            .FindAsync(id);

//        if (setting == null)
//            return NotFound(
//                "Settings not found");

//        setting.SlotDuration =
//            dto.SlotDuration;

//        setting.ClinicOpen =
//            dto.ClinicOpen;

//        setting.ClinicClose =
//            dto.ClinicClose;

//        await _context
//            .SaveChangesAsync();

//        return Ok(new
//        {
//            message =
//                "Settings updated"
//        });
//    }

//    // =====================================================
//    // DELETE SETTINGS
//    // =====================================================

//    // DELETE:
//    // api/ScheduleSettings/1

//    [HttpDelete("{id}")]
//    public async Task<IActionResult> DeleteSettings(
//        int id)
//    {
//        var setting = await _context
//            .ScheduleSettings
//            .FindAsync(id);

//        if (setting == null)
//            return NotFound(
//                "Settings not found");

//        _context.ScheduleSettings
//            .Remove(setting);

//        await _context
//            .SaveChangesAsync();

//        return Ok(new
//        {
//            message =
//                "Settings deleted"
//        });
//    }

//    // =====================================================
//    // GET HOLIDAYS
//    // =====================================================

//    // GET:
//    // api/ScheduleSettings/holidays

//    [HttpGet("holidays")]
//    public async Task<IActionResult> GetHolidays()
//    {
//        var holidays = await _context
//            .Holidays
//            .OrderBy(x => x.Date)
//            .Select(x => new
//            {
//                x.Id,
//                x.Name,

//                Date = x.Date
//                    .ToString("yyyy-MM-dd")
//            })
//            .ToListAsync();

//        return Ok(holidays);
//    }

//    // =====================================================
//    // CREATE HOLIDAY
//    // =====================================================

//    // POST:
//    // api/ScheduleSettings/holidays

//    [HttpPost("holidays")]
//    public async Task<IActionResult> CreateHoliday(
//        [FromBody]
//        CreateHolidayDto dto)
//    {
//        var holiday =
//            new Holiday
//            {
//                Name = dto.Name,
//                Date = dto.Date
//            };

//        _context.Holidays.Add(holiday);

//        await _context
//            .SaveChangesAsync();

//        return Ok(new
//        {
//            message =
//                "Holiday added"
//        });
//    }

//    // =====================================================
//    // UPDATE HOLIDAY
//    // =====================================================

//    // PUT:
//    // api/ScheduleSettings/holidays/1

//    [HttpPut("holidays/{id}")]
//    public async Task<IActionResult> UpdateHoliday(
//        int id,
//        [FromBody]
//        CreateHolidayDto dto)
//    {
//        var holiday = await _context
//            .Holidays
//            .FindAsync(id);

//        if (holiday == null)
//            return NotFound(
//                "Holiday not found");

//        holiday.Name = dto.Name;

//        holiday.Date = dto.Date;

//        await _context
//            .SaveChangesAsync();

//        return Ok(new
//        {
//            message =
//                "Holiday updated"
//        });
//    }

//    // =====================================================
//    // DELETE HOLIDAY
//    // =====================================================

//    // DELETE:
//    // api/ScheduleSettings/holidays/1

//    [HttpDelete("holidays/{id}")]
//    public async Task<IActionResult> DeleteHoliday(
//        int id)
//    {
//        var holiday = await _context
//            .Holidays
//            .FindAsync(id);

//        if (holiday == null)
//            return NotFound(
//                "Holiday not found");

//        _context.Holidays
//            .Remove(holiday);

//        await _context
//            .SaveChangesAsync();

//        return Ok(new
//        {
//            message =
//                "Holiday deleted"
//        });
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
public class ScheduleSettingsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ScheduleSettingsController(
        AppDbContext context)
    {
        _context = context;
    }

    // =====================================================
    // GET HOSPITAL ID FROM JWT
    // =====================================================

    private int GetHospitalId()
    {
        return int.Parse(
            User.Claims.First(
                x => x.Type == "HospitalId"
            ).Value
        );
    }

    // =====================================================
    // GET SETTINGS
    // =====================================================

    [HttpGet]
    public async Task<IActionResult>
        GetSettings()
    {
        var hospitalId =
            GetHospitalId();

        var setting =
            await _context.ScheduleSettings

                .Where(x =>
                    x.HospitalId == hospitalId)

                .OrderByDescending(x =>
                    x.Id)

                .FirstOrDefaultAsync();

        if (setting == null)
        {
            return Ok(new
            {
                SlotDuration = 30,

                ClinicOpen = "09:00",

                ClinicClose = "18:00"
            });
        }

        return Ok(new
        {
            setting.Id,

            setting.SlotDuration,

            ClinicOpen =
                setting.ClinicOpen
                    .ToString(@"hh\:mm"),

            ClinicClose =
                setting.ClinicClose
                    .ToString(@"hh\:mm")
        });
    }

    // =====================================================
    // CREATE SETTINGS
    // =====================================================

    [HttpPost]
    public async Task<IActionResult>
        CreateSettings(
            [FromBody]
            CreateScheduleSettingDto dto)
    {
        var hospitalId =
            GetHospitalId();

        var setting =
            new ScheduleSetting
            {
                SlotDuration =
                    dto.SlotDuration,

                ClinicOpen =
                    dto.ClinicOpen,

                ClinicClose =
                    dto.ClinicClose,

                HospitalId =
                    hospitalId
            };

        _context.ScheduleSettings
            .Add(setting);

        await _context
            .SaveChangesAsync();

        return Ok(new
        {
            message =
                "Schedule settings created"
        });
    }

    // =====================================================
    // UPDATE SETTINGS
    // =====================================================

    [HttpPut("{id}")]
    public async Task<IActionResult>
        UpdateSettings(
            int id,
            [FromBody]
            CreateScheduleSettingDto dto)
    {
        var hospitalId =
            GetHospitalId();

        var setting =
            await _context.ScheduleSettings
                .FirstOrDefaultAsync(x =>

                    x.Id == id &&

                    x.HospitalId == hospitalId
                );

        if (setting == null)
        {
            return NotFound(
                "Settings not found"
            );
        }

        setting.SlotDuration =
            dto.SlotDuration;

        setting.ClinicOpen =
            dto.ClinicOpen;

        setting.ClinicClose =
            dto.ClinicClose;

        await _context
            .SaveChangesAsync();

        return Ok(new
        {
            message =
                "Settings updated"
        });
    }

    // =====================================================
    // DELETE SETTINGS
    // =====================================================

    [HttpDelete("{id}")]
    public async Task<IActionResult>
        DeleteSettings(int id)
    {
        var hospitalId =
            GetHospitalId();

        var setting =
            await _context.ScheduleSettings
                .FirstOrDefaultAsync(x =>

                    x.Id == id &&

                    x.HospitalId == hospitalId
                );

        if (setting == null)
        {
            return NotFound(
                "Settings not found"
            );
        }

        _context.ScheduleSettings
            .Remove(setting);

        await _context
            .SaveChangesAsync();

        return Ok(new
        {
            message =
                "Settings deleted"
        });
    }

    // =====================================================
    // GET HOLIDAYS
    // =====================================================

    [HttpGet("holidays")]
    public async Task<IActionResult>
        GetHolidays()
    {
        var hospitalId =
            GetHospitalId();

        var holidays =
            await _context.Holidays

                .Where(x =>
                    x.HospitalId == hospitalId)

                .OrderBy(x =>
                    x.Date)

                .Select(x => new
                {
                    x.Id,

                    x.Name,

                    Date =
                        x.Date
                            .ToString(
                                "yyyy-MM-dd"
                            )
                })

                .ToListAsync();

        return Ok(holidays);
    }

    // =====================================================
    // CREATE HOLIDAY
    // =====================================================

    [HttpPost("holidays")]
    public async Task<IActionResult>
        CreateHoliday(
            [FromBody]
            CreateHolidayDto dto)
    {
        var hospitalId =
            GetHospitalId();

        var holiday =
            new Holiday
            {
                Name = dto.Name,

                Date = dto.Date,

                HospitalId =
                    hospitalId
            };

        _context.Holidays.Add(
            holiday
        );

        await _context
            .SaveChangesAsync();

        return Ok(new
        {
            message =
                "Holiday added"
        });
    }

    // =====================================================
    // UPDATE HOLIDAY
    // =====================================================

    [HttpPut("holidays/{id}")]
    public async Task<IActionResult>
        UpdateHoliday(
            int id,
            [FromBody]
            CreateHolidayDto dto)
    {
        var hospitalId =
            GetHospitalId();

        var holiday =
            await _context.Holidays
                .FirstOrDefaultAsync(x =>

                    x.Id == id &&

                    x.HospitalId == hospitalId
                );

        if (holiday == null)
        {
            return NotFound(
                "Holiday not found"
            );
        }

        holiday.Name =
            dto.Name;

        holiday.Date =
            dto.Date;

        await _context
            .SaveChangesAsync();

        return Ok(new
        {
            message =
                "Holiday updated"
        });
    }

    // =====================================================
    // DELETE HOLIDAY
    // =====================================================

    [HttpDelete("holidays/{id}")]
    public async Task<IActionResult>
        DeleteHoliday(int id)
    {
        var hospitalId =
            GetHospitalId();

        var holiday =
            await _context.Holidays
                .FirstOrDefaultAsync(x =>

                    x.Id == id &&

                    x.HospitalId == hospitalId
                );

        if (holiday == null)
        {
            return NotFound(
                "Holiday not found"
            );
        }

        _context.Holidays.Remove(
            holiday
        );

        await _context
            .SaveChangesAsync();

        return Ok(new
        {
            message =
                "Holiday deleted"
        });
    }
}