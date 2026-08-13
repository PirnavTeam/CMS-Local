using AuthDemo.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthDemo.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "LabTechnician,Lab Technician,Receptionist,Admin,SuperAdmin")]
public class LabController : ControllerBase
{
    private readonly AppDbContext _context;

    public LabController(AppDbContext context)
    {
        _context = context;
    }

    private int GetHospitalId()
    {
        var claim = User.Claims.FirstOrDefault(x => x.Type == "HospitalId");
        return int.TryParse(claim?.Value, out var hospitalId) ? hospitalId : 0;
    }

    private IQueryable<AuthDemo.Models.Billing> LabBills()
    {
        var hospitalId = GetHospitalId();
        return _context.Billings
            .Include(x => x.Patient)
            .Include(x => x.Doctor)
            .Include(x => x.Appointment)
            .Where(x => x.HospitalId == hospitalId && x.LabCharge > 0);
    }

    private static string ToLabStatus(string status)
    {
        return string.Equals(status, "Paid", StringComparison.OrdinalIgnoreCase)
            ? "Pending"
            : status;
    }

    private static object ToLabOrder(AuthDemo.Models.Billing bill)
    {
        var labStatus = ToLabStatus(bill.Status);

        return new
    {
        id = bill.Id,
        Id = bill.Id,
        orderId = bill.Id,
        OrderId = bill.Id,
        billingId = bill.Id,
        BillingId = bill.Id,
        appointmentId = bill.AppointmentId,
        AppointmentId = bill.AppointmentId,
        patientId = bill.PatientId,
        PatientId = bill.PatientId,
        patientName = bill.Patient != null ? bill.Patient.Name : "",
        PatientName = bill.Patient != null ? bill.Patient.Name : "",
        phone = bill.Patient != null ? bill.Patient.Phone : "",
        Phone = bill.Patient != null ? bill.Patient.Phone : "",
        doctorId = bill.DoctorId,
        doctorName = bill.Doctor != null ? bill.Doctor.Name : "",
        labCharge = bill.LabCharge,
        labCharges = bill.LabCharge,
        totalAmount = bill.TotalAmount,
        status = labStatus,
        Status = labStatus,
        orderStatus = labStatus,
        sampleStatus = labStatus,
        resultStatus = labStatus,
        visitDate = bill.Appointment != null ? bill.Appointment.Date : bill.CreatedAt,
        VisitDate = bill.Appointment != null ? bill.Appointment.Date : bill.CreatedAt,
        appointmentDate = bill.Appointment != null ? bill.Appointment.Date : bill.CreatedAt,
        createdAt = bill.CreatedAt,
        CreatedAt = bill.CreatedAt,
        billingType = "Diagnostic",
        BillingType = "Diagnostic",
        invoiceType = "diagnostic",
        InvoiceType = "diagnostic"
    };
    }

    [HttpGet("orders")]
    public async Task<IActionResult> GetOrders()
    {
        var rows = await LabBills()
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return Ok(rows.Select(ToLabOrder));
    }

    [HttpGet("doctor/reports")]
    public async Task<IActionResult> GetDoctorReports()
    {
        var rows = await LabBills()
            .Where(x => x.Status == "Completed" || x.Status == "Reported" || x.Status == "Pending Report")
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return Ok(rows.Select(ToLabOrder));
    }

    [HttpGet("patient/reports")]
    public async Task<IActionResult> GetPatientReports()
    {
        return await GetDoctorReports();
    }

    [HttpPatch("orders/{id:int}/sample-collected")]
    public Task<IActionResult> MarkSampleCollected(int id)
    {
        return UpdateOrderStatus(id, "Sample Collected");
    }

    [HttpPatch("orders/{id:int}/start")]
    public Task<IActionResult> StartOrder(int id)
    {
        return UpdateOrderStatus(id, "In Progress");
    }

    [HttpPatch("orders/{id:int}/complete")]
    public Task<IActionResult> CompleteOrder(int id)
    {
        return UpdateOrderStatus(id, "Completed");
    }

    [HttpPost("orders/{id:int}/report")]
    public Task<IActionResult> MarkReported(int id)
    {
        return UpdateOrderStatus(id, "Reported");
    }

    private async Task<IActionResult> UpdateOrderStatus(int id, string status)
    {
        var bill = await LabBills().FirstOrDefaultAsync(x => x.Id == id);
        if (bill == null)
        {
            return NotFound(new { message = "Lab order not found." });
        }

        bill.Status = status;
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = $"Lab order marked as {status}.",
            data = ToLabOrder(bill)
        });
    }
}
