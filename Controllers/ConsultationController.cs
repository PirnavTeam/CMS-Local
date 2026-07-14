
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
[Authorize]
public class ConsultationController
    : ControllerBase
{
    private readonly AppDbContext
        _context;

    public ConsultationController(
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
    // CREATE / UPDATE CONSULTATION
    // =====================================================

    [Authorize(Roles = "Doctor")]
   
    [HttpPost]
    public async Task<IActionResult>
        Create(
            CreateConsultationDto dto)
    {
        var hospitalId =
            GetHospitalId();
        if (!string.IsNullOrWhiteSpace(dto.ClinicalNotes))
        {
            var exists =
                await _context.ClinicalNoteTemplates
                    .AnyAsync(x =>
                        x.Notes == dto.ClinicalNotes);

            if (!exists)
            {
                _context.ClinicalNoteTemplates.Add(
                    new ClinicalNoteTemplate
                    {
                        Name = dto.Diagnosis ?? "General",
                        Notes = dto.ClinicalNotes
                    });

                await _context.SaveChangesAsync();
            }
        }


        var doctorId =
            GetDoctorId();

        // =================================================
        // CHECK APPOINTMENT
        // =================================================

        var appointment =
            await _context.Appointments

                .FirstOrDefaultAsync(x =>

                    x.Id ==
                    dto.AppointmentId &&

                    x.DoctorId ==
                    doctorId &&

                    x.HospitalId ==
                    hospitalId
                );

        if (appointment == null)
        {
            return NotFound(new
            {
                message =
                    "Appointment not found"
            });
        }

        // =================================================
        // SAVE DIAGNOSIS DROPDOWN DATA
        // =================================================
        if (!string.IsNullOrWhiteSpace(dto.Diagnosis))
        {
            var exists = await _context.DoctorDiagnoses
                .AnyAsync(x =>
                    x.Name == dto.Diagnosis &&
                    x.DoctorId == doctorId &&
                    x.HospitalId == hospitalId);

            if (!exists)
            {
                _context.DoctorDiagnoses.Add(
                    new DoctorDiagnosis
                    {
                        Name = dto.Diagnosis,
                        DoctorId = doctorId,
                        HospitalId = hospitalId
                    });

                await _context.SaveChangesAsync();
            }
        }
        // =================================================
        // CHECK EXISTING CONSULTATION
        // =================================================

        var consultation =
            await _context.Consultations

                .FirstOrDefaultAsync(x =>

                    x.AppointmentId ==
                    dto.AppointmentId &&

                    x.HospitalId ==
                    hospitalId
                );

        // =================================================
        // UPDATE
        // =================================================

        if (consultation != null)
        {
            consultation.Diagnosis =
                dto.Diagnosis;

            consultation.ClinicalNotes =
                dto.ClinicalNotes;
        }

        // =================================================
        // CREATE
        // =================================================

        else
        {
            consultation =
                new Consultation
                {
                    AppointmentId =
                        dto.AppointmentId,

                    PatientId =
                        dto.PatientId,

                    Diagnosis =
                        dto.Diagnosis,

                    ClinicalNotes =
                        dto.ClinicalNotes,

                    HospitalId =
                        hospitalId,

                    CreatedAt =
                        DateTime.UtcNow
                };

            _context.Consultations
                .Add(consultation);
        }

        // =================================================
        // UPDATE STATUS
        // =================================================

        appointment.Status =
            "InProgress";

        await _context
            .SaveChangesAsync();

        return Ok(new
        {
            message =
                "Consultation updated successfully",

            appointmentStatus =
                "InProgress"
        });
    }

    // =====================================================
    // DIAGNOSIS DROPDOWN
    // =====================================================

    [Authorize(Roles = "Doctor")]
    [HttpGet("diagnosis-dropdown")]
    public async Task<IActionResult> DiagnosisDropdown()
    {
        var hospitalId = GetHospitalId();

        var doctorId = GetDoctorId();

        var defaults = new List<string>
    {
        "Allergic rhinitis",
        "Back pain",
        "Diabetes follow-up",
        "Fever",
        "Gastritis",
        "Hypertension",
        "Migraine",
        "Nerve sensitivity",
        "Psoriasis",
        "Upper respiratory infection"
    };

        var diagnosisData =
            await _context.DoctorDiagnoses
                .Where(x =>
                    x.DoctorId == doctorId &&
                    x.HospitalId == hospitalId)
                .Select(x => x.Name)
                .ToListAsync();

        var result =
            defaults
                .Union(diagnosisData)
                .OrderBy(x => x)
                .ToList();

        return Ok(result);
    }

    // =====================================================
    // GET CONSULTATION BY APPOINTMENT
    // =====================================================

    [HttpGet("appointment/{appointmentId}")]
    public async Task<IActionResult>
        GetByAppointment(
            int appointmentId)
    {
        var hospitalId =
            GetHospitalId();

        var consultation =
            await _context.Consultations

                .Where(x =>

                    x.AppointmentId ==
                    appointmentId &&

                    x.HospitalId ==
                    hospitalId
                )

                .Select(x =>
                    new
                    {
                        x.Id,

                        x.AppointmentId,

                        x.PatientId,

                        x.Diagnosis,

                        x.ClinicalNotes,

                        createdAt =
                            x.CreatedAt
                    })

                .FirstOrDefaultAsync();

        if (consultation == null)
        {
            return NotFound(new
            {
                message =
                    "Consultation not found"
            });
        }

        return Ok(consultation);
    }

    // =====================================================
    // GET CONSULTATIONS
    // =====================================================

    [Authorize(Roles = "Admin,Doctor")]
   
    [HttpGet]
    public async Task<IActionResult>
        GetAll()
    {
        var hospitalId =
            GetHospitalId();

        var role =
            User.Claims.FirstOrDefault(
                x => x.Type ==
                    "role"
            )?.Value;

        var doctorId =
            GetDoctorId();

        var query =
            _context.Consultations

                .Where(x =>
                    x.HospitalId ==
                    hospitalId
                );

        // =================================================
        // DOCTOR FILTER
        // =================================================

        if (role == "Doctor")
        {
            query =
                query.Where(x =>

                    x.Appointment
                        .DoctorId ==
                    doctorId
                );
        }

        var consultations =
            await query

                .OrderByDescending(x =>
                    x.CreatedAt
                )

                .Select(x =>
                    new
                    {
                        x.Id,

                        x.AppointmentId,

                        x.PatientId,

                        patientName =
                            x.Patient.Name,

                        diagnosis =
                            x.Diagnosis,

                        clinicalNotes =
                            x.ClinicalNotes,

                        appointmentStatus =
                            x.Appointment.Status,

                        createdAt =
                            x.CreatedAt
                    })

                .ToListAsync();

        return Ok(consultations);
    }
    [HttpGet("clinical-note-templates")]
    public async Task<IActionResult> GetTemplates()
    {
        return Ok(
            await _context.ClinicalNoteTemplates
                .OrderBy(x => x.Name)
                .ToListAsync());
    }
}
