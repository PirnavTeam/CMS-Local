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
public class PrescriptionController
    : ControllerBase
{
    private readonly AppDbContext
        _context;

    public PrescriptionController(
        AppDbContext context)
    {
        _context = context;
    }

    // =====================================================
    // GET HOSPITAL ID
    // =====================================================

    private int GetHospitalId()
    {
        return int.Parse(
            User.Claims.First(
                x => x.Type ==
                    "HospitalId"
            ).Value
        );
    }

    // =====================================================
    // GET DOCTOR ID
    // =====================================================

    private int GetDoctorId()
    {
        return int.Parse(
            User.Claims.First(
                x => x.Type ==
                    "DoctorId"
            ).Value
        );
    }

    // =====================================================
    // CREATE PRESCRIPTION
    // =====================================================

    [Authorize(Roles = "Doctor")]
    [HttpPost]
    public async Task<IActionResult>
        Create(
            CreatePrescriptionDto dto)
    {
        try
        {
            var hospitalId =
                GetHospitalId();

            var doctorId =
                GetDoctorId();

            // =============================================
            // CHECK APPOINTMENT
            // =============================================

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
                return NotFound(
                    "Appointment not found"
                );
            }

            // =============================================
            // CHECK EXISTING PRESCRIPTION
            // =============================================

            var existingPrescription =
                await _context.Prescriptions

                    .FirstOrDefaultAsync(x =>

                        x.AppointmentId ==
                        dto.AppointmentId &&

                        x.HospitalId ==
                        hospitalId
                    );

            if (existingPrescription != null)
            {
                return BadRequest(
                    "Prescription already exists"
                );
            }

            // =============================================
            // CREATE PRESCRIPTION
            // =============================================

            var prescription =
                new Prescription
                {
                    AppointmentId =
                        dto.AppointmentId,

                    PatientId =
                        dto.PatientId,

                    Diagnosis =
                        dto.Diagnosis,

                    Instructions =
                        dto.Instructions,

                    FollowUpDate =
                        dto.FollowUpDate,

                    Status =
                        "Completed",

                    HospitalId =
                        hospitalId
                };

            _context.Prescriptions
                .Add(prescription);

            await _context
                .SaveChangesAsync();

            // =============================================
            // SAVE MEDICINES
            // =============================================

            foreach (var medicine
                in dto.Medicines)
            {
                var item =
                    new PrescriptionItem
                    {
                        PrescriptionId =
                            prescription.Id,

                        MedicineName =
                            medicine.MedicineName,

                        Dosage =
                            medicine.Dosage,

                        Frequency =
                            medicine.Frequency,

                        Duration =
                            medicine.Duration,

                        Notes =
                            medicine.Notes
                    };

                _context.PrescriptionItems
                    .Add(item);
            }

            // =============================================
            // UPDATE APPOINTMENT STATUS
            // =============================================

            appointment.Status =
                "Completed";

            await _context
                .SaveChangesAsync();

            return Ok(new
            {
                message =
                    "Prescription completed successfully"
            });
        }
        catch (Exception ex)
        {
            return StatusCode(
                500,
                ex.Message
            );
        }
    }

    // =====================================================
    // GET ALL PRESCRIPTIONS
    // =====================================================

    [Authorize(Roles = "Doctor")]
    [HttpGet]
    public async Task<IActionResult>
        GetAll()
    {
        try
        {
            var hospitalId =
                GetHospitalId();

            var doctorId =
                GetDoctorId();

            var prescriptions =
                await _context.Prescriptions

                    .Include(x =>
                        x.Patient)

                    .Include(x =>
                        x.Medicines)

                    .Include(x =>
                        x.Appointment)

                    .Where(x =>

                        x.HospitalId ==
                        hospitalId &&

                        x.Appointment.DoctorId ==
                        doctorId
                    )

                    .OrderByDescending(x =>
                        x.CreatedAt)

                    .ToListAsync();

            return Ok(
                prescriptions.Select(x =>
                    new
                    {
                        x.Id,

                        x.AppointmentId,

                        x.PatientId,

                        patientName =
                            x.Patient == null
                                ? ""
                                : x.Patient.Name,

                        diagnosis =
                            x.Diagnosis,

                        instructions =
                            x.Instructions,

                        followUpDate =
                            x.FollowUpDate,

                        status =
                            x.Status,

                        medicines =
                            x.Medicines
                                .Select(m =>
                                    new
                                    {
                                        m.Id,

                                        m.MedicineName,

                                        m.Dosage,

                                        m.Frequency,

                                        m.Duration,

                                        m.Notes
                                    })
                    }));
        }
        catch (Exception ex)
        {
            return StatusCode(
                500,
                ex.Message
            );
        }
    }

    // =====================================================
    // GET PRESCRIPTION BY APPOINTMENT
    // =====================================================

    [Authorize(Roles = "Doctor")]
    [HttpGet("appointment/{appointmentId}")]
    public async Task<IActionResult>
        GetByAppointment(
            int appointmentId)
    {
        try
        {
            var hospitalId =
                GetHospitalId();

            var doctorId =
                GetDoctorId();

            var prescription =
                await _context.Prescriptions

                    .Include(x =>
                        x.Medicines)

                    .Include(x =>
                        x.Appointment)

                    .FirstOrDefaultAsync(x =>

                        x.AppointmentId ==
                        appointmentId &&

                        x.HospitalId ==
                        hospitalId &&

                        x.Appointment.DoctorId ==
                        doctorId
                    );

            if (prescription == null)
            {
                return NotFound(
                    "Prescription not found"
                );
            }

            return Ok(new
            {
                prescription.Id,

                prescription.AppointmentId,

                prescription.PatientId,

                prescription.Diagnosis,

                prescription.Instructions,

                prescription.FollowUpDate,

                prescription.Status,

                medicines =
                    prescription.Medicines
                        .Select(m =>
                            new
                            {
                                m.Id,

                                m.MedicineName,

                                m.Dosage,

                                m.Frequency,

                                m.Duration,

                                m.Notes
                            })
            });
        }
        catch (Exception ex)
        {
            return StatusCode(
                500,
                ex.Message
            );
        }
    }
}