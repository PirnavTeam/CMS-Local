namespace AuthDemo.DTOs;

public class AppointmentResponseDto
{
    // =====================================================
    // APPOINTMENT
    // =====================================================

    public int Id
    { get; set; }

    public int DoctorId
    { get; set; }

    public int PatientId
    { get; set; }

    public string TokenNumber
    { get; set; }

    // =====================================================
    // PATIENT
    // =====================================================

    public string PatientName
    { get; set; }

    public string? PatientCode
    { get; set; }

    public int Age
    { get; set; }

    public string Gender
    { get; set; }

    public string Phone
    { get; set; }

    public string? BloodGroup
    { get; set; }

    // =====================================================
    // DOCTOR
    // =====================================================

    public string DoctorName
    { get; set; }

    public string? DoctorSpecialization
    { get; set; }

    // =====================================================
    // DATE & TIME
    // =====================================================

    public DateTime Date
    { get; set; }

    public string Time
    { get; set; }

    // =====================================================
    // RECEPTIONIST DETAILS
    // =====================================================

    public string? ChiefComplaints
    { get; set; }

    public string? BloodPressure
    { get; set; }

    public string? SugarLevel
    { get; set; }

    public string? Temperature
    { get; set; }

    public string? Weight
    { get; set; }

    public string? PulseRate
    { get; set; }

    public string? RespiratoryRate
    { get; set; }

    // =====================================================
    // STATUS
    // =====================================================

    public string Status
    { get; set; }
}