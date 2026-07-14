namespace AuthDemo.Models;

public class Patient
{
    public int Id { get; set; }

    // =====================================================
    // PATIENT CODE
    // =====================================================

    public string PatientCode
    { get; set; }

    // =====================================================
    // BASIC DETAILS
    // =====================================================

    public string Name
    { get; set; }

    public string Phone
    { get; set; }

    public int Age
    { get; set; }

    public string Gender
    { get; set; }

    public string? Email
    { get; set; }

    public string? Address
    { get; set; }

    // =====================================================
    // EXTRA DETAILS
    // =====================================================

    public string? BloodGroup
    { get; set; }

    public DateTime? DateOfBirth
    { get; set; }

    public string? EmergencyContactName
    { get; set; }

    public string? EmergencyContactPhone
    { get; set; }

    // =====================================================
    // MULTI HOSPITAL SUPPORT
    // =====================================================

    public int HospitalId
    { get; set; }

    public Hospital Hospital
    { get; set; }

    // =====================================================
    // CREATED DATE
    // =====================================================

    public DateTime CreatedAt
    { get; set; }
        = DateTime.UtcNow;

    // =====================================================
    // APPOINTMENTS
    // =====================================================

    public ICollection<Appointment>
        Appointments
    { get; set; }
        = new List<Appointment>();

    // =====================================================
    // MEDICAL HISTORY
    // =====================================================

    public ICollection<MedicalHistory>
        MedicalHistories
    { get; set; }
        = new List<MedicalHistory>();
}