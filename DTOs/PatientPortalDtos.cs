namespace AuthDemo.DTOs;

public class PatientPortalRegisterDto
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Gender { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? MobileNumber { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? Password { get; set; }
    public string? ConfirmPassword { get; set; }
}
public class PatientPortalLoginDto
{
    public string? EmailOrMobile { get; set; }
    public string? Password { get; set; }
}
public class PatientProfileUpdateDto
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Gender { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? BloodGroup { get; set; }
    public string? MobileNumber { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? EmergencyContactName { get; set; }
    public string? EmergencyContactRelationship { get; set; }
    public string? EmergencyContactPhone { get; set; }
    public string? Allergies { get; set; }
    public string? ChronicDiseases { get; set; }
    public string? CurrentMedications { get; set; }
}
public class PatientPortalBookAppointmentDto
{
    public int HospitalId { get; set; }
    public int DoctorId { get; set; }
    public DateTime Date { get; set; }
    public TimeSpan StartTime { get; set; }
    public string? ReasonForVisit { get; set; }
}
public class PatientPortalRescheduleDto
{
    public DateTime Date { get; set; }
    public TimeSpan StartTime { get; set; }
}
public class PatientPortalPaymentDto
{
    public string? PaymentMode { get; set; }
}