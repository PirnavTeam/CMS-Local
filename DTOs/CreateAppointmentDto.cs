namespace AuthDemo.DTOs;

public class CreateAppointmentDto
{
    // =====================================================
    // DOCTOR
    // =====================================================

    public int DoctorId
    { get; set; }

    // =====================================================
    // PATIENT
    // =====================================================

    public int PatientId
    { get; set; }

    // =====================================================
    // APPOINTMENT DATE & TIME
    // =====================================================

    public DateTime Date
    { get; set; }

    public TimeSpan StartTime
    { get; set; }

    // =====================================================
    // RECEPTIONIST FILLED DETAILS
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
}