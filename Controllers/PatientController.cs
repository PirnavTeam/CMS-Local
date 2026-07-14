

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
public class PatientController
    : ControllerBase
{
    private readonly AppDbContext
        _context;

    public PatientController(
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
    // CREATE PATIENT
    // =====================================================

    [Authorize(Roles =
        "Admin,Receptionist")]
    [HttpPost]
    public async Task<IActionResult>
        Create(
            CreatePatientDto dto)
    {
        var hospitalId =
            GetHospitalId();

        var patientCode =
            $"P-{new Random()
                .Next(10000, 99999)}";

        var patient =
            new Patient
            {
                PatientCode =
                    patientCode,

                Name =
                    dto.Name,

                Phone =
                    dto.Phone,

                Age =
                    dto.Age,

                Gender =
                    dto.Gender,

                Email =
                    dto.Email,

                Address =
                    dto.Address,

                BloodGroup =
                    dto.BloodGroup,

                DateOfBirth =
                    dto.DateOfBirth,

                EmergencyContactName =
                    dto.EmergencyContactName,

                EmergencyContactPhone =
                    dto.EmergencyContactPhone,

                HospitalId =
                    hospitalId
            };

        _context.Patients
            .Add(patient);

        await _context
            .SaveChangesAsync();

        return Ok(new
        {
            message =
                "Patient created successfully",

            patientId =
                patient.Id,

            patientCode
        });
    }

    // =====================================================
    // GET ALL PATIENTS
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

        var query =
            _context.Patients

                .Where(x =>
                    x.HospitalId ==
                    hospitalId
                );

        // =========================================
        // DOCTOR ONLY HIS PATIENTS
        // =========================================

        if (role == "Doctor")
        {
            var patientIds =
                await _context.Appointments

                    .Where(x =>
                        x.DoctorId ==
                        doctorId
                    )

                    .Select(x =>
                        x.PatientId
                    )

                    .Distinct()

                    .ToListAsync();

            query =
                query.Where(x =>
                    patientIds
                        .Contains(x.Id)
                );
        }

       
var patients =
    await query

        .OrderByDescending(x =>
            x.CreatedAt
        )

        .Select(x =>
            new
            {
                x.Id,

                x.PatientCode,

                x.Name,

                x.Phone,

                x.Age,

                x.Gender,

                x.Email,

                x.Address,

                x.BloodGroup,

                x.DateOfBirth,

                x.EmergencyContactName,

                x.EmergencyContactPhone,

                lastVisit =
                    _context.Appointments

                        .Where(a =>
                            a.PatientId ==
                            x.Id
                        )

                        .OrderByDescending(a =>
                            a.Date
                        )

                        .Select(a =>
                            a.Date
                                .ToString(
                                    "dd MMM yyyy"
                                )
                        )

                        .FirstOrDefault()
            })

        .ToListAsync();

        return Ok(patients);


    }

    // =====================================================
    // GET PATIENT DETAILS
    // =====================================================

    [HttpGet("{id}")]
    public async Task<IActionResult>
        GetById(
            int id)
    {
        var hospitalId =
            GetHospitalId();

        var patient =
            await _context.Patients

                .Include(x =>
                    x.MedicalHistories)

                .Include(x =>
                    x.Appointments)

                .ThenInclude(x =>
                    x.Doctor)

                .FirstOrDefaultAsync(x =>

                    x.Id == id &&

                    x.HospitalId ==
                    hospitalId
                );

        if (patient == null)
        {
            return NotFound(
                "Patient not found"
            );
        }

        var prescriptions =
            await _context.Prescriptions

                .Include(x =>
                    x.Medicines)

                .Where(x =>
                    x.PatientId ==
                    id
                )

                .OrderByDescending(x =>
                    x.CreatedAt
                )

                .ToListAsync();

        return Ok(new
        {
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

            patient.EmergencyContactName,

            patient.EmergencyContactPhone,

            medicalHistory =
                patient.MedicalHistories

                    .OrderByDescending(x =>
                        x.CreatedAt
                    )

                    .Select(x =>
                        new
                        {
                            x.Allergies,

                            x.ChronicDiseases,

                            x.CurrentMedications,

                            x.Surgeries
                        })

                    .FirstOrDefault(),

            previousVisits =
                patient.Appointments

                    .OrderByDescending(x =>
                        x.Date
                    )

                    .Select(x =>
                        new
                        {
                            appointmentId =
                                x.Id,

                            date =
                                x.Date
                                    .ToString(
                                        "dd MMM yyyy"
                                    ),

                            doctorName =
                                x.Doctor.Name,

                            symptoms =
                                x.ChiefComplaints,

                            status =
                                x.Status
                        }),

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

    // =====================================================
    // UPDATE PATIENT
    // =====================================================

    [Authorize(Roles =
        "Admin,Receptionist")]
    [HttpPut("{id}")]
    public async Task<IActionResult>
        Update(
            int id,

            CreatePatientDto dto)
    {
        var hospitalId =
            GetHospitalId();

        var patient =
            await _context.Patients

                .FirstOrDefaultAsync(x =>

                    x.Id == id &&

                    x.HospitalId ==
                    hospitalId
                );

        if (patient == null)
        {
            return NotFound(
                "Patient not found"
            );
        }

        patient.Name =
            dto.Name;

        patient.Phone =
            dto.Phone;

        patient.Age =
            dto.Age;

        patient.Gender =
            dto.Gender;

        patient.Email =
            dto.Email;

        patient.Address =
            dto.Address;

        patient.BloodGroup =
            dto.BloodGroup;

        patient.DateOfBirth =
            dto.DateOfBirth;

        patient.EmergencyContactName =
            dto.EmergencyContactName;

        patient.EmergencyContactPhone =
            dto.EmergencyContactPhone;

        await _context
            .SaveChangesAsync();

        return Ok(new
        {
            message =
                "Patient updated successfully"
        });
    }

    // =====================================================
    // DELETE PATIENT
    // =====================================================

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult>
        Delete(
            int id)
    {
        var hospitalId =
            GetHospitalId();

        var patient =
            await _context.Patients

                .FirstOrDefaultAsync(x =>

                    x.Id == id &&

                    x.HospitalId ==
                    hospitalId
                );

        if (patient == null)
        {
            return NotFound(
                "Patient not found"
            );
        }

        _context.Patients
            .Remove(patient);

        await _context
            .SaveChangesAsync();

        return Ok(new
        {
            message =
                "Patient deleted successfully"
        });
    }
}