
using AuthDemo.Data;
using AuthDemo.DTOs;
using AuthDemo.Models;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthDemo.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Receptionist")]
public class BillingController
    : ControllerBase
{
    private readonly AppDbContext
        _context;

    public BillingController(
        AppDbContext context)
    {
        _context = context;
    }

    // =====================================
    // GET HOSPITAL ID
    // =====================================

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

    // =====================================
    // APPOINTMENT DROPDOWN
    // =====================================

    [HttpGet("appointments")]
    public async Task<IActionResult>
        GetAppointments()
    {
        var hospitalId =
            GetHospitalId();

        var data =
            await _context.Appointments

                .Include(x =>
                    x.Patient)

                .Include(x =>
                    x.Doctor)

                .Where(x =>
                    x.HospitalId ==
                    hospitalId)

                .OrderByDescending(x =>
                    x.Date)

                .ThenBy(x =>
                    x.StartTime)

                .Select(x =>
                    new
                    {
                        appointmentId =
                            x.Id,

                        patientId =
                            x.PatientId,

                        patientName =
                            x.Patient.Name,

                        doctorName =
                            x.Doctor.Name,

                        time =
                            x.StartTime
                                .ToString(),

                        status =
                            x.Status,

                        consultationCharge =
                            x.Doctor.Fees,

                        displayText =
                            x.Patient.Name
                            + " - "
                            + x.StartTime
                                .ToString(@"hh\:mm")
                            + " - "
                            + x.Status
                    })

                .ToListAsync();

        return Ok(data);
    }

    // =====================================
    // APPOINTMENT DETAILS
    // =====================================

    [HttpGet("appointment/{appointmentId}")]
    public async Task<IActionResult>
        GetAppointment(
            int appointmentId)
    {
        var hospitalId =
            GetHospitalId();

        var appointment =
            await _context.Appointments

                .Include(x =>
                    x.Patient)

                .Include(x =>
                    x.Doctor)

                .FirstOrDefaultAsync(x =>

                    x.Id ==
                    appointmentId &&

                    x.HospitalId ==
                    hospitalId
                );

        if (appointment == null)
        {
            return NotFound();
        }

        return Ok(new
        {
            appointmentId =
                appointment.Id,

            patientId =
                appointment.PatientId,

            patientName =
                appointment.Patient.Name,

            phone =
                appointment.Patient.Phone,

            address =
                appointment.Patient.Address,

            doctorName =
                appointment.Doctor.Name,

            doctorId =
                appointment.DoctorId,

            appointmentTime =
                appointment.StartTime,

            status =
                appointment.Status,

            consultationCharge =
                appointment.Doctor.Fees
        });
    }

    // =====================================
    // GET ALL BILLS
    // =====================================

    [HttpGet]
    public async Task<IActionResult>
        GetAllBills()
    {
        var hospitalId =
            GetHospitalId();

        var data =
            await _context.Billings

                .Include(x =>
                    x.Patient)

                .Include(x =>
                    x.Doctor)

                .Where(x =>
                    x.HospitalId ==
                    hospitalId)

                .OrderByDescending(x =>
                    x.CreatedAt)

                .Select(x =>
                    new
                    {
                        x.Id,

                        patientName =
                            x.Patient.Name,

                        doctorName =
                            x.Doctor.Name,

                        x.TotalAmount,

                        x.PaymentMode,

                        x.Status,

                        x.CreatedAt
                    })

                .ToListAsync();

        return Ok(data);
    }

    // =====================================
    // CREATE BILL
    // =====================================

    [HttpPost]
    public async Task<IActionResult>
        CreateBill(
            CreateBillingDto dto)
    {
        var hospitalId =
            GetHospitalId();

        var appointment =
            await _context.Appointments

                .Include(x =>
                    x.Doctor)

                .FirstOrDefaultAsync(x =>

                    x.Id ==
                    dto.AppointmentId &&

                    x.HospitalId ==
                    hospitalId
                );

        if (appointment == null)
        {
            return NotFound(
                "Appointment not found"
            );
        }

        var total =
            appointment.Doctor.Fees +
            dto.MedicineCharge +
            dto.LabCharge;

        var bill =
            new Billing
            {
                AppointmentId =
                    appointment.Id,

                PatientId =
                    appointment.PatientId,

                DoctorId =
                    appointment.DoctorId,

                ConsultationCharge =
                    appointment.Doctor.Fees,

                MedicineCharge =
                    dto.MedicineCharge,

                LabCharge =
                    dto.LabCharge,

                TotalAmount =
                    total,

                PaymentMode =
                    dto.PaymentMode,

                HospitalId =
                    hospitalId
            };

        _context.Billings
            .Add(bill);

        await _context
            .SaveChangesAsync();

        return Ok(new
        {
            message =
                "Bill generated successfully"
        });
    }

    // =====================================
    // UPDATE BILL
    // =====================================

    [HttpPut("{id}")]
    public async Task<IActionResult>
        UpdateBill(
            int id,

            CreateBillingDto dto)
    {
        var bill =
            await _context.Billings
                .FindAsync(id);

        if (bill == null)
        {
            return NotFound();
        }

        bill.MedicineCharge =
            dto.MedicineCharge;

        bill.LabCharge =
            dto.LabCharge;

        bill.PaymentMode =
            dto.PaymentMode;

        bill.TotalAmount =
            bill.ConsultationCharge +
            bill.MedicineCharge +
            bill.LabCharge;

        await _context
            .SaveChangesAsync();

        return Ok(new
        {
            message =
                "Bill updated successfully"
        });
    }

    // =====================================
    // DELETE BILL
    // =====================================

    [HttpDelete("{id}")]
    public async Task<IActionResult>
        DeleteBill(
            int id)
    {
        var bill =
            await _context.Billings
                .FindAsync(id);

        if (bill == null)
        {
            return NotFound();
        }

        _context.Billings
            .Remove(bill);

        await _context
            .SaveChangesAsync();

        return Ok(new
        {
            message =
                "Bill deleted successfully"
        });
    }
}

