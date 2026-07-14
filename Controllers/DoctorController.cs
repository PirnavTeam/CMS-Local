using AuthDemo.Data;
using AuthDemo.DTOs;
using AuthDemo.Helpers;
using AuthDemo.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthDemo.Controllers;

[ApiController]
[Route("api/Doctor")]
[Authorize]
public class DoctorController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly EmailHelper _emailHelper;

    public DoctorController(AppDbContext context, EmailHelper emailHelper)
    {
        _context = context;
        _emailHelper = emailHelper;
    }

    private int GetHospitalId()
    {
        var claim = User.Claims.FirstOrDefault(x => x.Type == "HospitalId");
        return claim == null ? 0 : int.Parse(claim.Value);
    }

    private int GetDoctorId()
    {
        var claim = User.Claims.FirstOrDefault(x => x.Type == "DoctorId");
        return claim == null ? 0 : int.Parse(claim.Value);
    }

    private static int ParseExperience(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return 0;

        var digits = new string(value.Where(char.IsDigit).ToArray());

        return int.TryParse(digits, out var years) ? years : 0;
    }

    [Authorize(Roles = "Doctor")]
    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard()
    {
        var doctorId = GetDoctorId();
        var hospitalId = GetHospitalId();
        var today = DateTime.Today;

        var appointments = await _context.Appointments
            .Include(x => x.Patient)
            .Where(x =>
                x.DoctorId == doctorId &&
                x.HospitalId == hospitalId &&
                x.Date.Date == today)
            .OrderBy(x => x.StartTime)
            .ToListAsync();

        var totalAppointments = appointments.Count;
        var waiting = appointments.Count(x => x.Status == "Waiting");
        var inProgress = appointments.Count(x => x.Status == "InProgress");
        var completed = appointments.Count(x => x.Status == "Completed");

        var todayQueue = appointments.Select(x => new
        {
            appointmentId = x.Id,
            patientId = x.PatientId,
            tokenNumber = x.TokenNumber,
            patientName = x.Patient.Name,
            age = x.Patient.Age,
            gender = x.Patient.Gender,
            phone = x.Patient.Phone,
            bloodGroup = x.Patient.BloodGroup,
            chiefComplaints = x.ChiefComplaints,
            bloodPressure = x.BloodPressure,
            sugarLevel = x.SugarLevel,
            temperature = x.Temperature,
            weight = x.Weight,
            pulseRate = x.PulseRate,
            respiratoryRate = x.RespiratoryRate,
            time = x.StartTime.ToString(@"hh\:mm"),
            status = x.Status
        });

        return Ok(new
        {
            totalAppointments,
            waiting,
            inProgress,
            completed,
            todayQueue
        });
    }

    [Authorize(Roles = "Doctor")]
    [HttpGet("patients")]
    public async Task<IActionResult> GetPatients()
    {
        var doctorId = GetDoctorId();
        var hospitalId = GetHospitalId();

        var patients = await _context.Appointments
            .Include(x => x.Patient)
            .Where(x => x.DoctorId == doctorId && x.HospitalId == hospitalId)
            .GroupBy(x => x.PatientId)
            .Select(g => new
            {
                patientId = g.First().Patient.Id,
                patientCode = g.First().Patient.PatientCode,
                patientName = g.First().Patient.Name,
                phone = g.First().Patient.Phone,
                age = g.First().Patient.Age,
                gender = g.First().Patient.Gender,
                bloodGroup = g.First().Patient.BloodGroup,
                totalAppointments = g.Count()
            })
            .ToListAsync();

        return Ok(patients);
    }

    [Authorize(Roles = "Admin,SuperAdmin,Receptionist")]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var hospitalId = GetHospitalId();
        var query = _context.Doctors.AsQueryable();

        if (!User.IsInRole("SuperAdmin"))
        {
            query = query.Where(x => x.HospitalId == hospitalId);
        }

        var doctors = await query
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new
            {
                id = x.Id,
                name = x.Name,
                specialization = x.Specialization,
                areaofExpertise = x.AreaofExpertise,
                experience = x.Experience,
                qualification = x.Qualification,
                fees = x.Fees,
                consultationFee = x.Fees,
                email = x.Email,
                phone = x.Phone,
                Image = x.Image,
                isActive = x.IsActive,
                status = x.IsActive ? "active" : "inactive",
                hospitalId = x.HospitalId,
                createdAt = x.CreatedAt.ToString("dd MMM yyyy")
            })
            .ToListAsync();

        return Ok(doctors);
    }

    [Authorize(Roles = "Admin,SuperAdmin,Receptionist")]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var hospitalId = GetHospitalId();
        var query = _context.Doctors.Where(x => x.Id == id);

        if (!User.IsInRole("SuperAdmin"))
        {
            query = query.Where(x => x.HospitalId == hospitalId);
        }

        var doctor = await query
            .Select(x => new
            {
                id = x.Id,
                name = x.Name,
                specialization = x.Specialization,
                areaofExpertise = x.AreaofExpertise,
                experience = x.Experience,
                qualification = string.Empty,
                fees = x.Fees,
                consultationFee = x.Fees,
                email = x.Email,
                phone = x.Phone,
                Image = x.Image,
                isActive = x.IsActive,
                status = x.IsActive ? "active" : "inactive",
                hospitalId = x.HospitalId,
                createdAt = x.CreatedAt.ToString("dd MMM yyyy")
            })
            .FirstOrDefaultAsync();

        if (doctor == null)
        {
            return NotFound(new { message = "Doctor not found" });
        }

        return Ok(doctor);
    }

    [Authorize(Roles = "Admin")]
    [Consumes("multipart/form-data")]
    [HttpPost]
    public async Task<IActionResult> Create(DoctorCreateDto dto)
    {
        // Consultation fee validation
        if (!dto.ConsultationFee.HasValue || dto.ConsultationFee.Value <= 0)
        {
            return BadRequest(new
            {
                message = "Consultation fee must be greater than zero."
            });
        }

        if (!dto.Email.EndsWith("@gmail.com"))
        {
            return BadRequest(new
            {
                message = "Only Gmail addresses are allowed."
            });
        }

        if (dto.PhoneNumber.Length != 10 ||
            !dto.PhoneNumber.All(char.IsDigit) ||
            !"6789".Contains(dto.PhoneNumber[0]))
        {
            return BadRequest(new
            {
                message = "Enter a valid mobile number."
            });
        }

        var hospitalId = GetHospitalId();

        var exists = await _context.Doctors.AnyAsync(x => x.Email == dto.Email) ||
                     await _context.Users.AnyAsync(x => x.Email == dto.Email);

        if (exists)
        {
            return BadRequest(new
            {
                message = "Doctor email already exists"
            });
        }

        var temporaryPassword = "Doctor@" + Guid.NewGuid().ToString("N")[..6];
        string? imagePath = null;

        if (dto.Image != null)
        {
            var folder = Path.Combine(
                Directory.GetCurrentDirectory(),
                "wwwroot",
                "images",
                "doctors");

            Directory.CreateDirectory(folder);

            var fileName = Guid.NewGuid() + Path.GetExtension(dto.Image.FileName);
            var fullPath = Path.Combine(folder, fileName);

            using var stream = new FileStream(fullPath, FileMode.Create);

            await dto.Image.CopyToAsync(stream);

            imagePath = "/images/doctors/" + fileName;
        }

        var doctor = new Doctor
        {
            Name = dto.Name,
            Email = dto.Email,
            Phone = dto.PhoneNumber,
            Specialization = dto.Specialization,
            Qualification = dto.Qualification,
            Experience = ParseExperience(dto.Experience),
            Fees = dto.ConsultationFee.Value,
            Image = imagePath,
            IsActive = true,
            HospitalId = hospitalId,
            AreaofExpertise = dto.AreaofExpertise,
            CreatedAt = DateTime.UtcNow
        };

        _context.Doctors.Add(doctor);

        if (!_context.DoctorSpecializations.Any(x => x.Name == dto.Specialization))
        {
            _context.DoctorSpecializations.Add(new DoctorSpecialization
            {
                Name = dto.Specialization
            });
        }

        await _context.SaveChangesAsync();

        var doctorUser = new User
        {
            Name = doctor.Name,
            MobileNumber = doctor.Phone,
            Email = doctor.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(temporaryPassword),
            Role = "Doctor",
            DoctorId = doctor.Id,
            HospitalId = hospitalId,
            IsActive = true,
            MustChangePassword = true
        };

        _context.Users.Add(doctorUser);

        await _context.SaveChangesAsync();

        await _emailHelper.SendAdminCredentials(dto.Email, temporaryPassword);

        return Ok(new
        {
            message = "Doctor created successfully",
            temporaryPassword,
            id = doctor.Id,
            doctorId = doctor.Id
        });
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, DoctorCreateDto dto)
    {
        // Consultation fee validation
        if (!dto.ConsultationFee.HasValue || dto.ConsultationFee.Value <= 0)
        {
            return BadRequest(new
            {
                message = "Consultation fee must be greater than zero."
            });
        }

        var hospitalId = GetHospitalId();

        var doctor = await _context.Doctors
            .FirstOrDefaultAsync(x => x.Id == id && x.HospitalId == hospitalId);

        if (doctor == null)
        {
            return NotFound(new { message = "Doctor not found" });
        }

        doctor.Name = dto.Name;
        doctor.Email = dto.Email;
        doctor.Phone = dto.PhoneNumber;
        doctor.Specialization = dto.Specialization;
        doctor.AreaofExpertise = dto.AreaofExpertise;
        doctor.Experience = ParseExperience(dto.Experience);
        doctor.Fees = dto.ConsultationFee.Value;
        doctor.IsActive = dto.IsActive;

        var doctorUser = await _context.Users
            .FirstOrDefaultAsync(x => x.DoctorId == doctor.Id && x.Role == "Doctor");

        if (doctorUser != null)
        {
            doctorUser.Name = doctor.Name;
            doctorUser.Email = doctor.Email;
            doctorUser.MobileNumber = doctor.Phone;
            doctorUser.IsActive = doctor.IsActive;
        }

        await _context.SaveChangesAsync();

        return Ok(new { message = "Doctor updated successfully" });
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var hospitalId = GetHospitalId();

        var doctor = await _context.Doctors
            .FirstOrDefaultAsync(x => x.Id == id && x.HospitalId == hospitalId);

        if (doctor == null)
        {
            return NotFound(new
            {
                message = "Doctor not found"
            });
        }

        var hasAppointments = await _context.Appointments
            .AnyAsync(x => x.DoctorId == id);

        if (hasAppointments)
        {
            return BadRequest(new
            {
                message = "Doctor cannot be deleted because appointments are associated with this doctor."
            });
        }

        _context.Doctors.Remove(doctor);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Doctor deleted successfully"
        });
    }

    [HttpGet("specializations")]
    public async Task<IActionResult> GetSpecializations()
    {
        var defaults = new List<string>
        {
            "Cardiology",
            "Dermatology",
            "ENT",
            "General Medicine",
            "Gynecology",
            "Neurology",
            "Orthopedics",
            "Pediatrics",
            "Psychiatry",
            "Radiology",
            "Other"
        };

        var masterData = await _context.DoctorSpecializations
            .Select(x => x.Name)
            .ToListAsync();

        var doctorData = await _context.Doctors
            .Where(x => !string.IsNullOrEmpty(x.Specialization))
            .Select(x => x.Specialization!)
            .Distinct()
            .ToListAsync();

        var result = defaults
            .Union(masterData)
            .Union(doctorData)
            .OrderBy(x => x)
            .ToList();

        return Ok(result);
    }

    [HttpGet("qualifications")]
    public async Task<IActionResult> GetQualifications()
    {
        var defaults = new List<string>
        {
            "Bachelor of Medicine and Bachelor of Surgery (MBBS)",
            "Bachelor of Dental Surgery (BDS)",
            "Bachelor of Ayurvedic Medicine and Surgery (BAMS)",
            "Bachelor of Homeopathic Medicine and Surgery (BHMS)",
            "Doctor of Medicine (MD)",
            "Master of Surgery (MS)",
            "Diplomate of National Board (DNB)",
            "Doctorate of Medicine (DM)",
            "Master of Chirurgiae (MCh)"
        };

        var masterData = await _context.DoctorQualifications
            .Select(x => x.Name)
            .ToListAsync();

        var doctorData = await _context.Doctors
            .Where(x => !string.IsNullOrEmpty(x.Qualification))
            .Select(x => x.Qualification!)
            .Distinct()
            .ToListAsync();

        var result = defaults
            .Union(masterData)
            .Union(doctorData)
            .OrderBy(x => x)
            .ToList();

        return Ok(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(
        int id,
        [FromBody] UpdateDoctorStatusDto dto)
    {
        var hospitalId = GetHospitalId();

        if (dto.Status != "Active" && dto.Status != "Inactive")
        {
            return BadRequest(new
            {
                message = "Status must be Active or Inactive"
            });
        }

        var doctor = await _context.Doctors
            .FirstOrDefaultAsync(x => x.Id == id && x.HospitalId == hospitalId);

        if (doctor == null)
        {
            return NotFound(new
            {
                message = "Doctor not found"
            });
        }

        doctor.IsActive = dto.Status == "Active";

        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.DoctorId == doctor.Id && x.Role == "Doctor");

        if (user != null)
        {
            user.IsActive = doctor.IsActive;
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = $"Doctor status updated to {dto.Status}"
        });
    }
}