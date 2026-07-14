using AuthDemo.Helpers;


using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using Microsoft.EntityFrameworkCore;

using AuthDemo.Data;

namespace AuthDemo.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OverviewController
    : ControllerBase
{
    private readonly AppDbContext
        _context;

    public OverviewController(
        AppDbContext context)
    {
        _context = context;
    }
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

        return int.Parse(claim.Value);
    }

    [HttpGet("patient/{patientId}")]
    public async Task<IActionResult>
        PatientOverview(
            int patientId)
    {
        try
        {
            // =====================================
            // CLAIMS
            // =====================================

            var hospitalId =
                int.Parse(
                    User.Claims.First(
                        x => x.Type ==
                            "HospitalId"
                    ).Value
                );

            var doctorClaim =
    User.Claims.FirstOrDefault(
        x => x.Type == "DoctorId"
    );

            int? doctorId = null;

            if (doctorClaim != null)
            {
                doctorId =
                    int.Parse(
                        doctorClaim.Value
                    );
            }

            // =====================================
            // PATIENT
            // =====================================

            var patient =
                await _context.Patients

                    .FirstOrDefaultAsync(x =>

                        x.Id ==
                        patientId &&

                        x.HospitalId ==
                        hospitalId
                    );

            if (patient == null)
            {
                return NotFound(
                    "Patient not found"
                );
            }

            // =====================================
            // MEDICAL HISTORY
            // =====================================

            var medicalHistory =
                await _context.MedicalHistories

                    .Where(x =>

                        x.PatientId ==
                        patientId &&

                        x.HospitalId ==
                        hospitalId
                    )

                    .OrderByDescending(x =>
                        x.CreatedAt)

                    .FirstOrDefaultAsync();

            // =====================================
            // APPOINTMENTS
            // =====================================

            var appointments =
                await _context.Appointments

                    .Include(x =>
                        x.Doctor)
.Where(x =>

    x.PatientId ==
    patientId &&

    x.HospitalId ==
    hospitalId &&

    (
        doctorId == null ||
        x.DoctorId == doctorId
    )
)

                    .OrderByDescending(x =>
                        x.Date)

                    .ToListAsync();

           

            // =====================================
            // PREVIOUS COMPLETED VISITS
            // =====================================

            var previousVisitsData =
                appointments
                    .Where(x =>
                        x.Status == "Completed")
                    .OrderByDescending(x =>
                        x.Date)
                    .ToList();

            // =====================================
            // LAST VISIT
            // =====================================

            var lastVisit =
                previousVisitsData
                    .FirstOrDefault();


            // =====================================
            // PRESCRIPTIONS
            // =====================================

            var prescriptions =
                await _context.Prescriptions

                    .Include(x =>
                        x.Medicines)

                    .Include(x =>
                        x.Appointment)

                    .Where(x =>

    x.PatientId ==
    patientId &&

    x.HospitalId ==
    hospitalId &&

    (
        doctorId == null ||
        x.Appointment.DoctorId == doctorId
    )
)

                    .OrderByDescending(x =>
                        x.CreatedAt)

                    .ToListAsync();

            // =====================================
            // REMOVE DUPLICATES
            // =====================================

            prescriptions =
                prescriptions

                    .GroupBy(x =>
                        x.AppointmentId)

                    .Select(g =>
                        g.First())

                    .ToList();

            // =====================================
            // RESPONSE
            // =====================================

            return Ok(new
            {
                // =================================
                // PATIENT INFO
                // =================================

                patient.Id,

                patient.PatientCode,

                patient.Name,

                patient.Phone,

                patient.Email,

                patient.Address,

                patient.Age,

                patient.Gender,

                patient.BloodGroup,

                patient.DateOfBirth,

                // =================================
                // MEDICAL HISTORY
                // =================================

                allergies =
                    medicalHistory == null
                        ? ""
                        : medicalHistory.Allergies,

                chronicDiseases =
                    medicalHistory == null
                        ? ""
                        : medicalHistory.ChronicDiseases,

                currentMedications =
                    medicalHistory == null
                        ? ""
                        : medicalHistory.CurrentMedications,

                surgeries =
                    medicalHistory == null
                        ? ""
                        : medicalHistory.Surgeries,

                // =================================
                // OVERALL APPOINTMENTS
                // =================================

                overallAppointments =
                    appointments.Count,

                // =================================
                // LAST VISIT
                // =================================

                lastVisit =
    lastVisit == null
        ? null
        : new
        {
            appointmentId = lastVisit.Id,
            tokenNumber = lastVisit.TokenNumber,
            doctorName = lastVisit.Doctor == null
                ? ""
                : lastVisit.Doctor.Name,
            date = lastVisit.Date.ToString("dd MMM yyyy"),
            symptoms = lastVisit.ChiefComplaints,
            bloodPressure = lastVisit.BloodPressure,
            sugarLevel = lastVisit.SugarLevel,
            temperature = lastVisit.Temperature,
            weight = lastVisit.Weight,
            pulseRate = lastVisit.PulseRate,
            respiratoryRate = lastVisit.RespiratoryRate,
            status = lastVisit.Status
        },

                // =================================
                // PREVIOUS VISITS
                // =================================

                hasPreviousVisits =
    previousVisitsData.Any(),

                previousVisitMessage =
    previousVisitsData.Any()
        ? ""
        : "No previous visits found",

                previousVisits =
    previousVisitsData
        .Select(x =>
            new
            {
                appointmentId = x.Id,
                tokenNumber = x.TokenNumber,
                doctorName = x.Doctor == null
                    ? ""
                    : x.Doctor.Name,
                date = x.Date.ToString("dd MMM yyyy"),
                symptoms = x.ChiefComplaints,
                status = x.Status
            }),
                // =================================
                // PAST PRESCRIPTIONS
                // =================================

                pastPrescriptions =
                    prescriptions.Select(x =>
                        new
                        {
                            x.Id,

                            x.Diagnosis,

                            x.Instructions,

                            x.FollowUpDate,

                            x.Status,

                            medicines =
                                x.Medicines.Select(m =>
                                    new
                                    {
                                        m.MedicineName,

                                        m.Dosage,

                                        m.Frequency,

                                        m.Duration,

                                        m.Notes
                                    })
                        })
            });
        }
        catch (Exception ex)
        {
            return StatusCode(
                500,
                new
                {
                    error =
                        ex.Message
                });
        }

    }

    [HttpGet("{appointmentId}/documents")]
    public async Task<IActionResult>
 GetDocuments(int appointmentId)
    {
        var hospitalId =
            GetHospitalId();

        var data =
            await _context.AppointmentDocuments

                .Where(x =>
                    x.AppointmentId == appointmentId &&
                    x.HospitalId == hospitalId)

                .Select(x => new
                {
                    x.Id,

                    x.FileName,

                    x.UploadedAt,

                    DocumentUrl =
                        $"{Request.Scheme}://{Request.Host}{x.FilePath}"
                })

                .ToListAsync();

        return Ok(data);
    }
}
