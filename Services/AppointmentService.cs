using AuthDemo.Data;
using AuthDemo.DTOs;
using AuthDemo.Models;
using AuthDemo.Services.Interfaces;

using Microsoft.EntityFrameworkCore;

namespace AuthDemo.Services;

public class AppointmentService
    : IAppointmentService
{
    private readonly AppDbContext
        _context;

    public AppointmentService(
        AppDbContext context)
    {
        _context = context;
    }

    // =====================================================
    // CREATE APPOINTMENT
    // =====================================================

    public async Task CreateAsync(
        BookSlotDto dto,
        int hospitalId)
    {
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
            throw new Exception(
                "Doctor not found"
            );
        }

        if (!doctor.IsActive)
        {
            throw new Exception(
                "Doctor is inactive"
            );
        }

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
            throw new Exception(
                "Patient not found"
            );
        }

        // =================================================
        // CHECK DUPLICATE SLOT
        // =================================================

        var alreadyBooked =
            await _context.Appointments
                .AnyAsync(x =>

                    x.HospitalId ==
                    hospitalId &&

                    x.DoctorId ==
                    dto.DoctorId &&

                    x.Date.Date ==
                    dto.Date.Date &&

                    x.StartTime ==
                    dto.StartTime
                );

        if (alreadyBooked)
        {
            throw new Exception(
                "Slot already booked"
            );
        }

        // =================================================
        // TOKEN NUMBER
        // =================================================

        var tokenNumber =
            $"TKN-{Guid.NewGuid()
                .ToString()
                .Substring(0, 8)}";

        // =================================================
        // CREATE APPOINTMENT
        // =================================================

        var appointment =
            new Appointment
            {
                DoctorId =
                    dto.DoctorId,

                PatientId =
                    dto.PatientId,

                Date =
                    dto.Date,

                StartTime =
                    dto.StartTime,

                TokenNumber =
                    tokenNumber,

                ChiefComplaints =
                    dto.ChiefComplaints,

                BloodPressure =
                    dto.BloodPressure,

                SugarLevel =
                    dto.SugarLevel,

                Temperature =
                    dto.Temperature,

                Weight =
                    dto.Weight,

                PulseRate =
                    dto.PulseRate,

                RespiratoryRate =
                    dto.RespiratoryRate,

                Status =
                    "Waiting",

                HospitalId =
                    hospitalId
            };

        _context.Appointments
            .Add(appointment);

        await _context
            .SaveChangesAsync();
    }

    // =====================================================
    // GET ALL APPOINTMENTS
    // =====================================================

    public async Task<List<AppointmentResponseDto>>
        GetAllAsync(
            int hospitalId)
    {
        return await _context.Appointments

            // =========================================
            // FILTER HOSPITAL
            // =========================================

            .Where(x =>
                x.HospitalId ==
                hospitalId
            )

            // =========================================
            // INCLUDE
            // =========================================

            .Include(x =>
                x.Doctor
            )

            .Include(x =>
                x.Patient
            )

            // =========================================
            // ORDER
            // =========================================

            .OrderByDescending(x =>
                x.CreatedAt
            )

            // =========================================
            // DTO
            // =========================================

            .Select(x =>
                new AppointmentResponseDto
                {
                    // =====================================
                    // APPOINTMENT
                    // =====================================

                    Id =
                        x.Id,

                    DoctorId =
                        x.DoctorId,

                    PatientId =
                        x.PatientId,

                    TokenNumber =
                        x.TokenNumber,

                    Date =
                        x.Date,

                    Time =
                        x.StartTime
                            .ToString(
                                @"hh\:mm"
                            ),

                    Status =
                        x.Status,

                    // =====================================
                    // PATIENT
                    // =====================================

                    PatientName =
                        x.Patient.Name,

                    PatientCode =
                        x.Patient.PatientCode,

                    Age =
                        x.Patient.Age,

                    Gender =
                        x.Patient.Gender,

                    Phone =
                        x.Patient.Phone,

                    BloodGroup =
                        x.Patient.BloodGroup,

                    // =====================================
                    // DOCTOR
                    // =====================================

                    DoctorName =
                        x.Doctor.Name,

                    DoctorSpecialization =
                        x.Doctor.Specialization,

                    // =====================================
                    // VITALS
                    // =====================================

                    ChiefComplaints =
                        x.ChiefComplaints,

                    BloodPressure =
                        x.BloodPressure,

                    SugarLevel =
                        x.SugarLevel,

                    Temperature =
                        x.Temperature,

                    Weight =
                        x.Weight,

                    PulseRate =
                        x.PulseRate,

                    RespiratoryRate =
                        x.RespiratoryRate
                })

            .ToListAsync();
    }

    // =====================================================
    // UPDATE STATUS
    // =====================================================

    public async Task<bool>
        UpdateStatusAsync(
            int id,
            string status,
            int hospitalId)
    {
        var appointment =
            await _context.Appointments
                .FirstOrDefaultAsync(x =>

                    x.Id == id &&

                    x.HospitalId ==
                    hospitalId
                );

        if (appointment == null)
        {
            return false;
        }

        // =================================================
        // ALLOWED STATUS
        // =================================================

        var allowedStatus =
            new[]
            {
                "Waiting",
                "InProgress",
                "PrescriptionAdded",
                "Completed",
                "Cancelled"
            };

        if (!allowedStatus
                .Contains(status))
        {
            throw new Exception(
                "Invalid status"
            );
        }

        appointment.Status =
            status;

        await _context
            .SaveChangesAsync();

        return true;
    }
}