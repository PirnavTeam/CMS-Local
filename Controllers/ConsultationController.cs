//using AuthDemo.Data;
//using AuthDemo.DTOs;
//using AuthDemo.Models;

//using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Mvc;

//using Microsoft.EntityFrameworkCore;

//namespace AuthDemo.Controllers;

//[ApiController]
//[Route("api/[controller]")]
//[Authorize]
//public class ConsultationController
//    : ControllerBase
//{
//    private readonly AppDbContext
//        _context;

//    public ConsultationController(
//        AppDbContext context)
//    {
//        _context = context;
//    }

//    // =====================================================
//    // GET HOSPITAL ID
//    // =====================================================

//    private int GetHospitalId()
//    {
//        var claim =
//            User.Claims.FirstOrDefault(
//                x => x.Type ==
//                    "HospitalId"
//            );

//        if (claim == null)
//        {
//            return 0;
//        }

//        return int.Parse(
//            claim.Value
//        );
//    }

//    // =====================================================
//    // GET DOCTOR ID
//    // =====================================================

//    private int GetDoctorId()
//    {
//        var claim =
//            User.Claims.FirstOrDefault(
//                x => x.Type ==
//                    "DoctorId"
//            );

//        if (claim == null)
//        {
//            return 0;
//        }

//        return int.Parse(
//            claim.Value
//        );
//    }

//    // =====================================================
//    // CREATE / UPDATE CONSULTATION
//    // =====================================================

//    [Authorize(Roles = "Doctor")]
//    [HttpPost]
//    public async Task<IActionResult>
//        Create(
//            CreateConsultationDto dto)
//    {
//        var hospitalId =
//            GetHospitalId();

//        var doctorId =
//            GetDoctorId();

//        // =================================================
//        // CHECK APPOINTMENT
//        // =================================================

//        var appointment =
//            await _context.Appointments

//                .FirstOrDefaultAsync(x =>

//                    x.Id ==
//                    dto.AppointmentId &&

//                    x.DoctorId ==
//                    doctorId &&

//                    x.HospitalId ==
//                    hospitalId
//                );

//        if (appointment == null)
//        {
//            return NotFound(new
//            {
//                message =
//                    "Appointment not found"
//            });
//        }

//        // =================================================
//        // CHECK EXISTING CONSULTATION
//        // =================================================

//        var consultation =
//            await _context.Consultations

//                .FirstOrDefaultAsync(x =>

//                    x.AppointmentId ==
//                    dto.AppointmentId &&

//                    x.HospitalId ==
//                    hospitalId
//                );

//        // =================================================
//        // UPDATE
//        // =================================================

//        if (consultation != null)
//        {
//            consultation.Diagnosis =
//                dto.Diagnosis;

//            consultation.ClinicalNotes =
//                dto.ClinicalNotes;
//        }

//        // =================================================
//        // CREATE
//        // =================================================

//        else
//        {
//            consultation =
//                new Consultation
//                {
//                    AppointmentId =
//                        dto.AppointmentId,

//                    PatientId =
//                        dto.PatientId,

//                    Diagnosis =
//                        dto.Diagnosis,

//                    ClinicalNotes =
//                        dto.ClinicalNotes,

//                    HospitalId =
//                        hospitalId,

//                    CreatedAt =
//                        DateTime.UtcNow
//                };

//            _context.Consultations
//                .Add(consultation);
//        }

//        // =================================================
//        // UPDATE STATUS
//        // =================================================

//        appointment.Status =
//            "InProgress";

//        await _context
//            .SaveChangesAsync();

//        return Ok(new
//        {
//            message =
//                "Consultation updated successfully",

//            appointmentStatus =
//                "InProgress"
//        });
//    }

//    // =====================================================
//    // GET CONSULTATION BY APPOINTMENT
//    // =====================================================

//    [HttpGet("appointment/{appointmentId}")]
//    public async Task<IActionResult>
//        GetByAppointment(
//            int appointmentId)
//    {
//        var hospitalId =
//            GetHospitalId();

//        var consultation =
//            await _context.Consultations

//                .Where(x =>

//                    x.AppointmentId ==
//                    appointmentId &&

//                    x.HospitalId ==
//                    hospitalId
//                )

//                .Select(x =>
//                    new
//                    {
//                        x.Id,

//                        x.AppointmentId,

//                        x.PatientId,

//                        x.Diagnosis,

//                        x.ClinicalNotes,

//                        createdAt =
//                            x.CreatedAt
//                    })

//                .FirstOrDefaultAsync();

//        if (consultation == null)
//        {
//            return NotFound(new
//            {
//                message =
//                    "Consultation not found"
//            });
//        }

//        return Ok(consultation);
//    }

//    // =====================================================
//    // GET CONSULTATIONS
//    // =====================================================

//    [Authorize(Roles = "Admin,Doctor")]
//    [HttpGet]
//    public async Task<IActionResult>
//        GetAll()
//    {
//        var hospitalId =
//            GetHospitalId();

//        var role =
//            User.Claims.FirstOrDefault(
//                x => x.Type ==
//                    "role"
//            )?.Value;

//        var doctorId =
//            GetDoctorId();

//        // =========================================
//        // BASE QUERY
//        // =========================================

//        var query =
//            _context.Consultations

//                .Where(x =>
//                    x.HospitalId ==
//                    hospitalId
//                );

//        // =========================================
//        // DOCTOR FILTER
//        // =========================================

//        if (role == "Doctor")
//        {
//            query =
//                query.Where(x =>

//                    x.Appointment
//                        .DoctorId ==
//                    doctorId
//                );
//        }

//        // =========================================
//        // GET DATA
//        // =========================================

//        var consultations =
//            await query

//                .OrderByDescending(x =>
//                    x.CreatedAt
//                )

//                .Select(x =>
//                    new
//                    {
//                        x.Id,

//                        x.AppointmentId,

//                        x.PatientId,

//                        patientName =
//                            x.Patient.Name,

//                        diagnosis =
//                            x.Diagnosis,

//                        clinicalNotes =
//                            x.ClinicalNotes,

//                        appointmentStatus =
//                            x.Appointment.Status,

//                        createdAt =
//                            x.CreatedAt
//                    })

//                .ToListAsync();

//        return Ok(consultations);
//    }
//}

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

        if (!string.IsNullOrWhiteSpace(
                dto.Diagnosis))
        {
            var diagnosisExists =
                await _context
                    .DoctorDiagnoses

                    .AnyAsync(x =>

                        x.DoctorId ==
                        doctorId &&

                        x.HospitalId ==
                        hospitalId &&

                        x.Name.ToLower() ==
                        dto.Diagnosis
                            .Trim()
                            .ToLower()
                    );

            if (!diagnosisExists)
            {
                var diagnosis =
                    new DoctorDiagnosis
                    {
                        DoctorId =
                            doctorId,

                        HospitalId =
                            hospitalId,

                        Name =
                            dto.Diagnosis
                                .Trim()
                    };

                _context
                    .DoctorDiagnoses
                    .Add(diagnosis);
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
    public async Task<IActionResult>
        DiagnosisDropdown()
    {
        var hospitalId =
            GetHospitalId();

        var doctorId =
            GetDoctorId();

        var data =
            await _context
                .DoctorDiagnoses

                .Where(x =>

                    x.DoctorId ==
                    doctorId &&

                    x.HospitalId ==
                    hospitalId
                )

                .OrderBy(x =>
                    x.Name
                )

                .Select(x =>
                    x.Name
                )

                .Distinct()

                .ToListAsync();

        return Ok(data);
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
}