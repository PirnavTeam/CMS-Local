using AuthDemo.Helpers;
using AuthDemo.Data;
using AuthDemo.DTOs;
using AuthDemo.Models;
using AuthDemo.Services;
using AuthDemo.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static System.Net.Mime.MediaTypeNames;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace AuthDemo.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AppointmentController
    : ControllerBase
{
    private readonly IAppointmentService
        _appointmentService;

    private readonly AppDbContext
        _context;

    public AppointmentController(
        IAppointmentService appointmentService,
        AppDbContext context)
    {
        _appointmentService =
            appointmentService;

        _context =
            context;
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
    [HttpPost("{appointmentId}/documents")]
    public async Task<IActionResult>
UploadDocument(
    int appointmentId,
    IFormFile file)
    {
        var hospitalId =
            GetHospitalId();

        var appointment =
            await _context.Appointments
                .FirstOrDefaultAsync(x =>

                    x.Id ==
                    appointmentId &&

                    x.HospitalId ==
                    hospitalId);

        if (appointment == null)
        {
            return NotFound(
                "Appointment not found");
        }

        if (file == null ||
            file.Length == 0)
        {
            return BadRequest(
                "File required");
        }

        var folder =
            Path.Combine(
                "wwwroot",
                "documents");

        Directory.CreateDirectory(
            folder);

        var uniqueName =
            Guid.NewGuid() +
            Path.GetExtension(
                file.FileName);

        var filePath =
            Path.Combine(
                folder,
                uniqueName);

        using var stream =
            new FileStream(
                filePath,
                FileMode.Create);

        await file.CopyToAsync(
            stream);

        var document =
            new AppointmentDocument
            {
                AppointmentId =
                    appointmentId,

                FileName =
                    file.FileName,

                FilePath =
                    "/documents/" +
                    uniqueName,

                HospitalId =
                    hospitalId
            };

        _context.AppointmentDocuments
            .Add(document);

        await _context
            .SaveChangesAsync();

        return Ok(new
        {
            message =
                "Document uploaded"
        });
    }
    [HttpGet("{appointmentId}/documents")]
    public async Task<IActionResult>
GetDocuments(
    int appointmentId)
    {
        var hospitalId =
            GetHospitalId();

        var data =
            await _context
                .AppointmentDocuments

                .Where(x =>

                    x.AppointmentId ==
                    appointmentId &&

                    x.HospitalId ==
                    hospitalId)

                .ToListAsync();

        return Ok(data);
    }
    [HttpGet("chief-complaints")]
    public async Task<IActionResult> GetChiefComplaints()
    {
        var defaults = new List<string>
    {
        "Fever",
        "Cold and Cough",
        "Headache",
        "Stomach Pain",
        "Body Pains",
        "Diabetes Follow-up",
        "High Blood Pressure",
        "Chest Pain",
        "Breathing Difficulty",
        "General Checkup"
    };

        var dbData =
            await _context.ChiefComplaints
                .Select(x => x.Name)
                .ToListAsync();

        var result =
            defaults
                .Union(dbData)
                .OrderBy(x => x)
                .ToList();

        return Ok(result);
    }
   
    
    }

