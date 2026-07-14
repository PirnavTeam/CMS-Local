using System.Security.Claims;

using AuthDemo.Data;

using AuthDemo.DTOs;

using AuthDemo.Helpers;

using AuthDemo.Models;

using Microsoft.AspNetCore.Authorization;

using Microsoft.AspNetCore.Mvc;

using Microsoft.EntityFrameworkCore;

namespace AuthDemo.Controllers;

[ApiController]

[Route("api/patient-portal")]

public class PatientPortalController : ControllerBase

{

    private readonly AppDbContext _context;

    private readonly JwtHelper _jwtHelper;

    public PatientPortalController(AppDbContext context, JwtHelper jwtHelper)

    {

        _context = context;

        _jwtHelper = jwtHelper;

    }

    // =====================================================

    // Helpers

    // =====================================================

    private string GetEmail()

    {

        return User.Claims.FirstOrDefault(x => x.Type == "email")?.Value

               ?? User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Email)?.Value

               ?? string.Empty;

    }

    private int GetHospitalId()

    {

        var value = User.Claims.FirstOrDefault(x => x.Type == "HospitalId")?.Value;

        return int.TryParse(value, out var hospitalId) ? hospitalId : 0;

    }

    private static string BuildName(string? firstName, string? lastName)

    {

        return string.Join(" ", new[] { firstName, lastName }

            .Where(x => !string.IsNullOrWhiteSpace(x)))

            .Trim();

    }

    private static int CalculateAge(DateTime? dob)

    {

        if (dob == null)

        {

            return 0;

        }

        var age = DateTime.Today.Year - dob.Value.Year;

        if (dob.Value.Date > DateTime.Today.AddYears(-age))

        {

            age--;

        }

        return age < 0 ? 0 : age;

    }

    private async Task<Patient?> GetLoggedInPatient()

    {

        var email = GetEmail();

        return await _context.Patients

            .FirstOrDefaultAsync(x => x.Email == email);

    }

    private async Task CreateNotification(string title, string message)

    {

        _context.Notifications.Add(new Notification

        {

            Title = title,

            Message = message,

            IsSent = true,

            CreatedAt = DateTime.UtcNow

        });

        await _context.SaveChangesAsync();

    }

    // =====================================================

    // 1. Login / Registration

    // =====================================================

    [AllowAnonymous]

    [HttpPost("register")]

    public async Task<IActionResult> Register(PatientPortalRegisterDto dto)

    {

        if (string.IsNullOrWhiteSpace(dto.FirstName) ||

            string.IsNullOrWhiteSpace(dto.MobileNumber) ||

            string.IsNullOrWhiteSpace(dto.Email) ||

            string.IsNullOrWhiteSpace(dto.Password))

        {

            return BadRequest(new { message = "First name, mobile number, email and password are required." });

        }

        if (dto.Password != dto.ConfirmPassword)

        {

            return BadRequest(new { message = "Password and confirm password do not match." });

        }

        if (!dto.Email.EndsWith("@gmail.com", StringComparison.OrdinalIgnoreCase))

        {

            return BadRequest(new { message = "Only Gmail addresses are allowed." });

        }

        if (dto.MobileNumber.Length != 10 ||

            !dto.MobileNumber.All(char.IsDigit) ||

            !"6789".Contains(dto.MobileNumber[0]))

        {

            return BadRequest(new { message = "Enter a valid mobile number." });

        }

        var existingUser = await _context.Users

            .AnyAsync(x => x.Email == dto.Email || x.MobileNumber == dto.MobileNumber);

        if (existingUser)

        {

            return BadRequest(new { message = "Email or mobile number already exists." });

        }

        var name = BuildName(dto.FirstName, dto.LastName);

        var patientCode = $"P-{Random.Shared.Next(10000, 99999)}";

        var patient = new Patient

        {

            PatientCode = patientCode,

            Name = name,

            Phone = dto.MobileNumber,

            Age = CalculateAge(dto.DateOfBirth),

            Gender = dto.Gender ?? string.Empty,

            Email = dto.Email,

            Address = dto.Address,

            DateOfBirth = dto.DateOfBirth,

            HospitalId = null

        };

        _context.Patients.Add(patient);

        await _context.SaveChangesAsync();

        var user = new User

        {

            Name = name,

            MobileNumber = dto.MobileNumber,

            Email = dto.Email,

            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),

            Role = "Patient",

            HospitalId = null,

            MustChangePassword = false,

            IsActive = true

        };

        _context.Users.Add(user);

        await _context.SaveChangesAsync();

        return Ok(new

        {

            message = "Patient registered successfully",

            patientId = patient.Id,

            patientCode = patient.PatientCode

        });

    }

    // Patient login is handled only by POST /api/Auth/login.

    // =====================================================

    // 2. Patient Dashboard

    // =====================================================

    [Authorize(Roles = "Patient")]

    [HttpGet("dashboard")]

    public async Task<IActionResult> Dashboard()

    {

        var patient = await GetLoggedInPatient();

        if (patient == null)

        {

            return NotFound(new { message = "Patient profile not found" });

        }

        var now = DateTime.Today;

        var upcomingAppointment = await _context.Appointments

            .Include(x => x.Doctor)

            .Include(x => x.Hospital)

            .Where(x => x.PatientId == patient.Id && x.Date.Date >= now && x.Status != "Cancelled")

            .OrderBy(x => x.Date)

            .ThenBy(x => x.StartTime)

            .Select(x => new

            {

                appointmentId = x.Id,

                doctorName = x.Doctor.Name,

                clinicName = x.Hospital.Name,

                date = x.Date,

                time = x.StartTime,

                status = x.Status

            })

            .FirstOrDefaultAsync();

        var previousAppointments = await _context.Appointments

            .CountAsync(x => x.PatientId == patient.Id && x.Date.Date < now);

        var prescriptions = await _context.Prescriptions

            .CountAsync(x => x.PatientId == patient.Id);

        var medicalRecords = await _context.MedicalHistories

            .CountAsync(x => x.PatientId == patient.Id);

        var billsPending = await _context.Billings

            .CountAsync(x => x.PatientId == patient.Id && x.Status == "Pending");

        return Ok(new

        {

            cards = new

            {

                upcomingAppointment,

                previousAppointments,

                prescriptions,

                medicalRecords,

                billsPending

            },

            quickActions = new[]

            {

                "Book Appointment",

                "View Reports",

                "View Prescriptions",

                "Payments"

            },

            notifications = await _context.Notifications

                .Where(x => x.IsSent)

                .OrderByDescending(x => x.CreatedAt)

                .Take(5)

                .ToListAsync()

        });

    }

    // =====================================================

    // 3. My Profile

    // =====================================================

    [Authorize(Roles = "Patient")]

    [HttpGet("profile")]

    public async Task<IActionResult> GetProfile()

    {

        var patient = await GetLoggedInPatient();

        if (patient == null)

        {

            return NotFound(new { message = "Patient profile not found" });

        }

        var history = await _context.MedicalHistories

            .Where(x => x.PatientId == patient.Id)

            .OrderByDescending(x => x.CreatedAt)

            .FirstOrDefaultAsync();

        return Ok(new

        {

            patient.Id,

            patient.PatientCode,

            patient.Name,

            patient.Gender,

            patient.DateOfBirth,

            patient.Age,

            patient.BloodGroup,

            mobile = patient.Phone,

            patient.Email,

            patient.Address,

            emergencyContact = new

            {

                name = patient.EmergencyContactName,

                phone = patient.EmergencyContactPhone

            },

            medicalInformation = new

            {

                allergies = history?.Allergies,

                chronicDiseases = history?.ChronicDiseases,

                currentMedications = history?.CurrentMedications

            }

        });

    }

    [Authorize(Roles = "Patient")]

    [HttpPut("profile")]

    public async Task<IActionResult> UpdateProfile(PatientProfileUpdateDto dto)

    {

        var patient = await GetLoggedInPatient();

        if (patient == null)

        {

            return NotFound(new { message = "Patient profile not found" });

        }

        var name = BuildName(dto.FirstName, dto.LastName);

        if (!string.IsNullOrWhiteSpace(name))

        {

            patient.Name = name;

        }

        patient.Gender = dto.Gender ?? patient.Gender;

        patient.DateOfBirth = dto.DateOfBirth ?? patient.DateOfBirth;

        patient.Age = CalculateAge(patient.DateOfBirth);

        patient.BloodGroup = dto.BloodGroup ?? patient.BloodGroup;

        patient.Phone = dto.MobileNumber ?? patient.Phone;

        patient.Email = dto.Email ?? patient.Email;

        patient.Address = dto.Address ?? patient.Address;

        patient.EmergencyContactName = dto.EmergencyContactName ?? patient.EmergencyContactName;

        patient.EmergencyContactPhone = dto.EmergencyContactPhone ?? patient.EmergencyContactPhone;

        var history = await _context.MedicalHistories

            .OrderByDescending(x => x.CreatedAt)

            .FirstOrDefaultAsync(x => x.PatientId == patient.Id);

        if (history == null)

        {

            if (patient.HospitalId == null)

            {

                return BadRequest(new { message = "Please book an appointment with a clinic before saving medical information." });

            }

            history = new MedicalHistory

            {

                PatientId = patient.Id,

                HospitalId = patient.HospitalId.Value

            };

            _context.MedicalHistories.Add(history);

        }

        history.Allergies = dto.Allergies ?? history.Allergies;

        history.ChronicDiseases = dto.ChronicDiseases ?? history.ChronicDiseases;

        history.CurrentMedications = dto.CurrentMedications ?? history.CurrentMedications;

        var user = await _context.Users.FirstOrDefaultAsync(x => x.Role == "Patient" && x.Email == GetEmail());

        if (user != null)

        {

            user.Name = patient.Name;

            user.MobileNumber = patient.Phone;

            user.Email = patient.Email;

            user.HospitalId = patient.HospitalId;

        }

        await _context.SaveChangesAsync();

        return Ok(new { message = "Profile updated successfully" });

    }

    // =====================================================// 4. Appointment Booking Supporting APIs// =====================================================
    [Authorize(Roles = "Patient")]
    [HttpGet("clinics")]
    public async Task<IActionResult> GetClinics()
    {
        var clinics = await _context.Hospitals
            .Where(x => x.IsActive)
            .OrderBy(x => x.Name)
            .Select(x => new {
                clinicId = x.Id,
                clinicName = x.Name,
                x.Address,
                phoneNumber = x.Phone,
                x.Email
            })
            .ToListAsync();

        return Ok(clinics);
    }

    [Authorize(Roles = "Patient")]
    [HttpGet("clinics/{clinicId}/departments")]
    public async Task<IActionResult> GetDepartments(int clinicId)
    {
        var departments = await _context.Doctors
            .Where(x => x.HospitalId == clinicId && x.IsActive && x.Specialization != null)
            .Select(x => x.Specialization!)
            .Distinct()
            .OrderBy(x => x)
            .ToListAsync();

        return Ok(departments);
    }

    [Authorize(Roles = "Patient")]
    [HttpGet("doctors")]
    public async Task<IActionResult> GetDoctors([FromQuery] int clinicId, [FromQuery] string? department)
    {
        var doctors = await _context.Doctors
            .Where(x =>
                x.HospitalId == clinicId &&
                x.IsActive &&
                (string.IsNullOrWhiteSpace(department) || x.Specialization == department))
            .OrderBy(x => x.Name)
            .Select(x => new {
                doctorId = x.Id,
                x.Name,
                department = x.Specialization,
                x.Qualification,
                x.Experience,
                x.Fees,
                photo = (string?)null,
                availableToday = !_context.Appointments.Any(a =>
                    a.DoctorId == x.Id &&
                    a.Date.Date == DateTime.Today &&
                    a.Status != "Cancelled")
            })
            .ToListAsync();

        return Ok(doctors);
    }

    [Authorize(Roles = "Patient")]
    [HttpGet("doctors/{doctorId}/slots")]
    public async Task<IActionResult> GetSlots(int doctorId, [FromQuery] DateTime date)
    {
        var doctor = await _context.Doctors.FirstOrDefaultAsync(x => x.Id == doctorId && x.IsActive);

        if (doctor == null)
        {
            return NotFound(new { message = "Doctor not found" });
        }

        var bookedSlots = await _context.Appointments
            .Where(x => x.DoctorId == doctorId && x.Date.Date == date.Date && x.Status != "Cancelled")
            .Select(x => x.StartTime)
            .ToListAsync();

        var slots = new List<object>();
        var start = new TimeSpan(9, 0, 0);
        var end = new TimeSpan(17, 0, 0);

        for (var slot = start; slot < end; slot = slot.Add(TimeSpan.FromMinutes(15)))
        {
            var status = bookedSlots.Contains(slot) ? "Booked" : "Available";

            if (date.Date == DateTime.Today && slot <= DateTime.Now.TimeOfDay)
            {
                status = "Locked";
            }

            slots.Add(new
            {
                time = slot.ToString(@"hh\:mm"),
                status
            });
        }

        return Ok(slots);
    }

    [Authorize(Roles = "Patient")]
    [HttpPost("appointments")]
    public async Task<IActionResult> BookAppointment(PatientPortalBookAppointmentDto dto)
    {
        var patient = await GetLoggedInPatient();

        if (patient == null)
        {
            return NotFound(new { message = "Patient profile not found" });
        }

        var doctor = await _context.Doctors.FirstOrDefaultAsync(x =>
            x.Id == dto.DoctorId &&
            x.HospitalId == dto.HospitalId &&
            x.IsActive);

        if (doctor == null)
        {
            return NotFound(new { message = "Doctor not found for selected clinic" });
        }

        var slotBooked = await _context.Appointments.AnyAsync(x =>
            x.DoctorId == dto.DoctorId &&
            x.Date.Date == dto.Date.Date &&
            x.StartTime == dto.StartTime &&
            x.Status != "Cancelled");

        if (slotBooked)
        {
            return BadRequest(new { message = "Selected slot is already booked." });
        }

        if (patient.HospitalId == null)
        {
            patient.HospitalId = dto.HospitalId;
        }

        var appointment = new Appointment
        {
            DoctorId = dto.DoctorId,
            PatientId = patient.Id,
            Date = dto.Date.Date,
            StartTime = dto.StartTime,
            TokenNumber = $"APT-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(100, 999)}",
            ChiefComplaints = dto.ReasonForVisit,
            Status = "Pending",
           
            HospitalId = dto.HospitalId
        };

        _context.Appointments.Add(appointment);
        await _context.SaveChangesAsync();

        await CreateNotification(
            "Appointment Booked",
            $"Appointment {appointment.TokenNumber} has been booked for {patient.Name}.");

        return Ok(new
        {
            message = "Appointment booked successfully",
            appointmentId = appointment.Id,
            appointmentNumber = appointment.TokenNumber,
            status = appointment.Status
        });
    }

    // =====================================================

    // 5. Appointment Details

    // =====================================================

    [Authorize(Roles = "Patient")]

    [HttpGet("appointments")]

    public async Task<IActionResult> GetAppointments()

    {

        var patient = await GetLoggedInPatient();

        if (patient == null)

        {

            return NotFound(new { message = "Patient profile not found" });

        }

        var appointments = await _context.Appointments

            .Include(x => x.Doctor)

            .Include(x => x.Hospital)

            .Where(x => x.PatientId == patient.Id)

            .OrderByDescending(x => x.Date)

            .ThenByDescending(x => x.StartTime)

            .Select(x => new

            {

                appointmentId = x.Id,

                appointmentNumber = x.TokenNumber,

                doctor = x.Doctor.Name,

                clinic = x.Hospital.Name,

                date = x.Date,

                time = x.StartTime,

                reasonForVisit = x.ChiefComplaints,

                status = x.Status

            })

            .ToListAsync();

        return Ok(appointments);

    }

    [Authorize(Roles = "Patient")]

    [HttpGet("appointments/{id}")]

    public async Task<IActionResult> GetAppointmentDetails(int id)

    {

        var patient = await GetLoggedInPatient();

        if (patient == null)

        {

            return NotFound(new { message = "Patient profile not found" });

        }

        var appointment = await _context.Appointments

            .Include(x => x.Doctor)

            .Include(x => x.Hospital)

            .FirstOrDefaultAsync(x => x.Id == id && x.PatientId == patient.Id);

        if (appointment == null)

        {

            return NotFound(new { message = "Appointment not found" });

        }

        return Ok(new

        {

            appointmentId = appointment.Id,

            appointmentNumber = appointment.TokenNumber,

            doctor = appointment.Doctor.Name,

            clinic = appointment.Hospital.Name,

            date = appointment.Date,

            time = appointment.StartTime,

            reasonForVisit = appointment.ChiefComplaints,

            status = appointment.Status,

            actions = new[] { "Cancel Appointment", "Reschedule", "Download Confirmation" }

        });

    }

    [Authorize(Roles = "Patient")]

    [HttpPatch("appointments/{id}/cancel")]

    public async Task<IActionResult> CancelAppointment(int id)

    {

        var patient = await GetLoggedInPatient();

        if (patient == null)

        {

            return NotFound(new { message = "Patient profile not found" });

        }

        var appointment = await _context.Appointments

            .FirstOrDefaultAsync(x => x.Id == id && x.PatientId == patient.Id);

        if (appointment == null)

        {

            return NotFound(new { message = "Appointment not found" });

        }

        if (appointment.Status == "Completed")

        {

            return BadRequest(new { message = "Completed appointment cannot be cancelled." });

        }

        appointment.Status = "Cancelled";

        await _context.SaveChangesAsync();

        await CreateNotification("Appointment Cancelled", $"Appointment {appointment.TokenNumber} was cancelled.");

        return Ok(new { message = "Appointment cancelled successfully" });

    }

    [Authorize(Roles = "Patient")]

    [HttpPut("appointments/{id}/reschedule")]

    public async Task<IActionResult> RescheduleAppointment(int id, PatientPortalRescheduleDto dto)

    {

        var patient = await GetLoggedInPatient();

        if (patient == null)

        {

            return NotFound(new { message = "Patient profile not found" });

        }

        var appointment = await _context.Appointments

            .FirstOrDefaultAsync(x => x.Id == id && x.PatientId == patient.Id);

        if (appointment == null)

        {

            return NotFound(new { message = "Appointment not found" });

        }

        var slotBooked = await _context.Appointments.AnyAsync(x =>

            x.Id != id &&

            x.DoctorId == appointment.DoctorId &&

            x.Date.Date == dto.Date.Date &&

            x.StartTime == dto.StartTime &&

            x.Status != "Cancelled");

        if (slotBooked)

        {

            return BadRequest(new { message = "Selected slot is already booked." });

        }

        appointment.Date = dto.Date.Date;

        appointment.StartTime = dto.StartTime;

        appointment.Status = "Pending";

        await _context.SaveChangesAsync();

        await CreateNotification("Appointment Rescheduled", $"Appointment {appointment.TokenNumber} was rescheduled.");

        return Ok(new { message = "Appointment rescheduled successfully" });

    }

    // =====================================================

    // 6. Medical History

    // =====================================================

    [Authorize(Roles = "Patient")]

    [HttpGet("medical-history")]

    public async Task<IActionResult> GetMedicalHistory()

    {

        var patient = await GetLoggedInPatient();

        if (patient == null)

        {

            return NotFound(new { message = "Patient profile not found" });

        }

        var data = await _context.Appointments

            .Include(x => x.Doctor)

            .Where(x => x.PatientId == patient.Id)

            .OrderByDescending(x => x.Date)

            .Select(x => new

            {

                visitId = x.Id,

                date = x.Date,

                doctorName = x.Doctor.Name,

                conditions = x.ChiefComplaints,

                reports = _context.AppointmentDocuments

                    .Where(d => d.AppointmentId == x.Id)

                    .Select(d => new { d.FileName, d.FilePath })

                    .ToList(),

                prescriptions = _context.Prescriptions

                    .Where(p => p.AppointmentId == x.Id)

                    .Select(p => new { p.Id, p.Diagnosis, p.Status })

                    .ToList()

            })

            .ToListAsync();

        return Ok(data);

    }

    // =====================================================

    // 7. Prescription

    // =====================================================

    [Authorize(Roles = "Patient")]

    [HttpGet("prescriptions")]

    public async Task<IActionResult> GetPrescriptions()

    {

        var patient = await GetLoggedInPatient();

        if (patient == null)

        {

            return NotFound(new { message = "Patient profile not found" });

        }

        var data = await _context.Prescriptions

            .Include(x => x.Appointment)

            .ThenInclude(x => x.Doctor)

            .Include(x => x.Medicines)

            .Where(x => x.PatientId == patient.Id)

            .OrderByDescending(x => x.CreatedAt)

            .Select(x => new

            {

                prescriptionId = x.Id,

                doctorName = x.Appointment.Doctor.Name,

                x.Diagnosis,

                x.Instructions,

                x.FollowUpDate,

                x.Status,

                medicines = x.Medicines.Select(m => new

                {

                    m.MedicineName,

                    m.Dosage,

                    m.Frequency,

                    m.Duration,

                    instructions = m.Notes

                })

            })

            .ToListAsync();

        return Ok(data);

    }

    [Authorize(Roles = "Patient")]

    [HttpGet("prescriptions/{id}")]

    public async Task<IActionResult> GetPrescriptionDetails(int id)

    {

        var patient = await GetLoggedInPatient();

        if (patient == null)

        {

            return NotFound(new { message = "Patient profile not found" });

        }

        var prescription = await _context.Prescriptions

            .Include(x => x.Appointment)

            .ThenInclude(x => x.Doctor)

            .Include(x => x.Medicines)

            .FirstOrDefaultAsync(x => x.Id == id && x.PatientId == patient.Id);

        if (prescription == null)

        {

            return NotFound(new { message = "Prescription not found" });

        }

        return Ok(new

        {

            prescriptionId = prescription.Id,

            doctorDetails = new

            {

                doctorId = prescription.Appointment.DoctorId,

                doctorName = prescription.Appointment.Doctor.Name,

                specialization = prescription.Appointment.Doctor.Specialization

            },

            prescription.Diagnosis,

            medicineList = prescription.Medicines.Select(m => new

            {

                m.MedicineName,

                m.Dosage,

                m.Frequency,

                m.Duration,

                instructions = m.Notes

            }),

            prescription.Instructions,

            buttons = new[] { "Download PDF", "Print", "Share" }

        });

    }

    // =====================================================

    // 8. Billing & Payment

    // =====================================================

    [Authorize(Roles = "Patient")]

    [HttpGet("bills")]

    public async Task<IActionResult> GetBills()

    {

        var patient = await GetLoggedInPatient();

        if (patient == null)

        {

            return NotFound(new { message = "Patient profile not found" });

        }

        var bills = await _context.Billings

            .Include(x => x.Appointment)

            .Where(x => x.PatientId == patient.Id)

            .OrderByDescending(x => x.CreatedAt)

            .ToListAsync();

        var data = bills.Select(x => new

        {

            billId = x.Id,

            billNumber = "BILL-" + x.Id,

            appointmentNumber = x.Appointment == null ? "" : x.Appointment.TokenNumber,

            consultationFee = x.ConsultationCharge,

            labCharges = x.LabCharge,

            medicineCharges = x.MedicineCharge,

            gst = Math.Round(x.TotalAmount * 0.18M, 2),

            total = x.TotalAmount,

            paymentMode = x.PaymentMode,

            status = x.Status,

            buttons = new[] { "Pay Now", "Download Invoice" }

        });

        return Ok(data);

    }

    [Authorize(Roles = "Patient")]

    [HttpPost("bills/{id}/pay")]

    public async Task<IActionResult> PayBill(int id, PatientPortalPaymentDto dto)

    {

        var patient = await GetLoggedInPatient();

        if (patient == null)

        {

            return NotFound(new { message = "Patient profile not found" });

        }

        var bill = await _context.Billings

            .FirstOrDefaultAsync(x => x.Id == id && x.PatientId == patient.Id);

        if (bill == null)

        {

            return NotFound(new { message = "Bill not found" });

        }

        bill.PaymentMode = string.IsNullOrWhiteSpace(dto.PaymentMode) ? "Online" : dto.PaymentMode;

        bill.Status = "Paid";

        await _context.SaveChangesAsync();

        await CreateNotification("Payment Completed", $"Payment completed for BILL-{bill.Id}.");

        return Ok(new

        {

            message = "Payment completed successfully",

            billId = bill.Id,

            status = bill.Status,

            paymentMode = bill.PaymentMode

        });

    }

    // =====================================================

    // 9. Notifications

    // =====================================================

    [Authorize(Roles = "Patient")]

    [HttpGet("notifications")]

    public async Task<IActionResult> GetNotifications()

    {

        var data = await _context.Notifications

            .Where(x => x.IsSent)

            .OrderByDescending(x => x.CreatedAt)

            .Select(x => new

            {

                x.Id,

                x.Title,

                x.Message,

                x.IsRead,

                x.CreatedAt

            })

            .ToListAsync();

        return Ok(data);

    }

    [Authorize(Roles = "Patient")]

    [HttpPatch("notifications/{id}/read")]

    public async Task<IActionResult> MarkNotificationAsRead(int id)

    {

        var notification = await _context.Notifications.FirstOrDefaultAsync(x => x.Id == id);

        if (notification == null)

        {

            return NotFound(new { message = "Notification not found" });

        }

        notification.IsRead = true;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Notification marked as read" });

    }

    [Authorize(Roles = "Patient")]

    [HttpDelete("notifications/{id}")]

    public async Task<IActionResult> DeleteNotification(int id)

    {

        var notification = await _context.Notifications.FirstOrDefaultAsync(x => x.Id == id);

        if (notification == null)

        {

            return NotFound(new { message = "Notification not found" });

        }

        _context.Notifications.Remove(notification);

        await _context.SaveChangesAsync();

        return Ok(new { message = "Notification deleted successfully" });

    }

}

