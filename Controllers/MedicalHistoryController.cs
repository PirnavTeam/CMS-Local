
//using Microsoft.AspNetCore.Mvc;

//using Microsoft.EntityFrameworkCore;

//using AuthDemo.Data;
//using AuthDemo.DTOs;
//using AuthDemo.Models;

//namespace AuthDemo.Controllers;

//[ApiController]
//[Route("api/[controller]")]
//public class MedicalHistoryController
//    : ControllerBase
//{
//    private readonly AppDbContext
//        _context;

//    public MedicalHistoryController(
//        AppDbContext context)
//    {
//        _context = context;
//    }

//    // =====================================================
//    // CREATE MEDICAL HISTORY
//    // =====================================================

//    [HttpPost]
//    public async Task<IActionResult>
//        Create(
//            CreateMedicalHistoryDto dto)
//    {
//        // =========================================
//        // STATIC HOSPITAL ID
//        // =========================================

//        var hospitalId = 1;

//        // =================================================
//        // CHECK PATIENT
//        // =================================================

//        var patient =
//            await _context.Patients
//                .FirstOrDefaultAsync(x =>

//                    x.Id ==
//                    dto.PatientId &&

//                    x.HospitalId ==
//                    hospitalId
//                );

//        if (patient == null)
//        {
//            return NotFound(
//                "Patient not found"
//            );
//        }

//        // =================================================
//        // CREATE HISTORY
//        // =================================================

//        var history =
//            new MedicalHistory
//            {
//                PatientId =
//                    dto.PatientId,

//                Allergies =
//                    dto.Allergies,

//                ChronicDiseases =
//                    dto.ChronicDiseases,

//                CurrentMedications =
//                    dto.CurrentMedications,

//                Surgeries =
//                    dto.Surgeries,

//                HospitalId =
//                    hospitalId
//            };

//        _context.MedicalHistories
//            .Add(history);

//        await _context
//            .SaveChangesAsync();

//        return Ok(new
//        {
//            message =
//                "Medical history added successfully"
//        });
//    }

//    // =====================================================
//    // GET LATEST MEDICAL HISTORY
//    // =====================================================

//    [HttpGet("{patientId}")]
//    public async Task<IActionResult>
//        GetLatest(
//            int patientId)
//    {
//        // =========================================
//        // STATIC HOSPITAL ID
//        // =========================================

//        var hospitalId = 1;

//        var history =
//            await _context.MedicalHistories

//                .Where(x =>

//                    x.PatientId ==
//                    patientId &&

//                    x.HospitalId ==
//                    hospitalId
//                )

//                .OrderByDescending(x =>
//                    x.CreatedAt)

//                .Select(x =>
//                    new
//                    {
//                        x.Id,

//                        x.PatientId,

//                        x.Allergies,

//                        x.ChronicDiseases,

//                        x.CurrentMedications,

//                        x.Surgeries,

//                        createdAt =
//                            x.CreatedAt
//                                .ToString(
//                                    "yyyy-MM-dd HH:mm"
//                                )
//                    })

//                .FirstOrDefaultAsync();

//        if (history == null)
//        {
//            return NotFound(
//                "No medical history found"
//            );
//        }

//        return Ok(history);
//    }

//    // =====================================================
//    // GET ALL MEDICAL HISTORY
//    // =====================================================

//    [HttpGet("all/{patientId}")]
//    public async Task<IActionResult>
//        GetAll(
//            int patientId)
//    {
//        // =========================================
//        // STATIC HOSPITAL ID
//        // =========================================

//        var hospitalId = 1;

//        var histories =
//            await _context.MedicalHistories

//                .Where(x =>

//                    x.PatientId ==
//                    patientId &&

//                    x.HospitalId ==
//                    hospitalId
//                )

//                .OrderByDescending(x =>
//                    x.CreatedAt)

//                .Select(x =>
//                    new
//                    {
//                        x.Id,

//                        x.PatientId,

//                        x.Allergies,

//                        x.ChronicDiseases,

//                        x.CurrentMedications,

//                        x.Surgeries,

//                        createdAt =
//                            x.CreatedAt
//                                .ToString(
//                                    "yyyy-MM-dd HH:mm"
//                                )
//                    })

//                .ToListAsync();

//        return Ok(histories);
//    }

//    // =====================================================
//    // DELETE MEDICAL HISTORY
//    // =====================================================

//    [HttpDelete("{id}")]
//    public async Task<IActionResult>
//        Delete(
//            int id)
//    {
//        // =========================================
//        // STATIC HOSPITAL ID
//        // =========================================

//        var hospitalId = 1;

//        var history =
//            await _context.MedicalHistories
//                .FirstOrDefaultAsync(x =>

//                    x.Id == id &&

//                    x.HospitalId ==
//                    hospitalId
//                );

//        if (history == null)
//        {
//            return NotFound(
//                "Medical history not found"
//            );
//        }

//        _context.MedicalHistories
//            .Remove(history);

//        await _context
//            .SaveChangesAsync();

//        return Ok(new
//        {
//            message =
//                "Medical history deleted successfully"
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
public class MedicalHistoryController
    : ControllerBase
{
    private readonly AppDbContext
        _context;

    public MedicalHistoryController(
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
    // CREATE MEDICAL HISTORY
    // =====================================================

    [Authorize(Roles =
        "Admin,Receptionist")]
    [HttpPost]
    public async Task<IActionResult>
        Create(
            CreateMedicalHistoryDto dto)
    {
        var hospitalId =
            GetHospitalId();

        // =================================================
        // CHECK PATIENT
        // =================================================

        var patient =
            await _context.Patients

                .FirstOrDefaultAsync(x =>

                    x.Id ==
                    dto.PatientId &&

                    x.HospitalId ==
                    hospitalId
                );

        if (patient == null)
        {
            return NotFound(new
            {
                message =
                    "Patient not found"
            });
        }

        // =================================================
        // CREATE MEDICAL HISTORY
        // =================================================

        var history =
            new MedicalHistory
            {
                PatientId =
                    dto.PatientId,

                Allergies =
                    dto.Allergies,

                ChronicDiseases =
                    dto.ChronicDiseases,

                CurrentMedications =
                    dto.CurrentMedications,

                Surgeries =
                    dto.Surgeries,

                HospitalId =
                    hospitalId,

                CreatedAt =
                    DateTime.UtcNow
            };

        _context.MedicalHistories
            .Add(history);

        await _context
            .SaveChangesAsync();

        return Ok(new
        {
            message =
                "Medical history created successfully"
        });
    }

    // =====================================================
    // GET LATEST HISTORY
    // =====================================================

    [HttpGet("{patientId}")]
    public async Task<IActionResult>
        GetLatest(
            int patientId)
    {
        var hospitalId =
            GetHospitalId();

        var history =
            await _context.MedicalHistories

                .Where(x =>

                    x.PatientId ==
                    patientId &&

                    x.HospitalId ==
                    hospitalId
                )

                .OrderByDescending(x =>
                    x.CreatedAt
                )

                .Select(x =>
                    new
                    {
                        x.Id,

                        x.PatientId,

                        x.Allergies,

                        x.ChronicDiseases,

                        x.CurrentMedications,

                        x.Surgeries,

                        createdAt =
                            x.CreatedAt
                                .ToString(
                                    "dd MMM yyyy hh:mm tt"
                                )
                    })

                .FirstOrDefaultAsync();

        if (history == null)
        {
            return NotFound(new
            {
                message =
                    "No medical history found"
            });
        }

        return Ok(history);
    }

    // =====================================================
    // GET ALL HISTORY
    // =====================================================

    [HttpGet("all/{patientId}")]
    public async Task<IActionResult>
        GetAll(
            int patientId)
    {
        var hospitalId =
            GetHospitalId();

        var histories =
            await _context.MedicalHistories

                .Where(x =>

                    x.PatientId ==
                    patientId &&

                    x.HospitalId ==
                    hospitalId
                )

                .OrderByDescending(x =>
                    x.CreatedAt
                )

                .Select(x =>
                    new
                    {
                        x.Id,

                        x.PatientId,

                        x.Allergies,

                        x.ChronicDiseases,

                        x.CurrentMedications,

                        x.Surgeries,

                        createdAt =
                            x.CreatedAt
                                .ToString(
                                    "dd MMM yyyy hh:mm tt"
                                )
                    })

                .ToListAsync();

        return Ok(histories);
    }

    // =====================================================
    // UPDATE MEDICAL HISTORY
    // =====================================================

    [Authorize(Roles =
        "Admin,Receptionist")]
    [HttpPut("{id}")]
    public async Task<IActionResult>
        Update(
            int id,

            CreateMedicalHistoryDto dto)
    {
        var hospitalId =
            GetHospitalId();

        var history =
            await _context.MedicalHistories

                .FirstOrDefaultAsync(x =>

                    x.Id == id &&

                    x.HospitalId ==
                    hospitalId
                );

        if (history == null)
        {
            return NotFound(new
            {
                message =
                    "Medical history not found"
            });
        }

        history.Allergies =
            dto.Allergies;

        history.ChronicDiseases =
            dto.ChronicDiseases;

        history.CurrentMedications =
            dto.CurrentMedications;

        history.Surgeries =
            dto.Surgeries;

        await _context
            .SaveChangesAsync();

        return Ok(new
        {
            message =
                "Medical history updated successfully"
        });
    }

    // =====================================================
    // DELETE MEDICAL HISTORY
    // =====================================================

    [Authorize(Roles =
        "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult>
        Delete(
            int id)
    {
        var hospitalId =
            GetHospitalId();

        var history =
            await _context.MedicalHistories

                .FirstOrDefaultAsync(x =>

                    x.Id == id &&

                    x.HospitalId ==
                    hospitalId
                );

        if (history == null)
        {
            return NotFound(new
            {
                message =
                    "Medical history not found"
            });
        }

        _context.MedicalHistories
            .Remove(history);

        await _context
            .SaveChangesAsync();

        return Ok(new
        {
            message =
                "Medical history deleted successfully"
        });
    }
}