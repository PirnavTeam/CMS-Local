namespace AuthDemo.Models;

public class Appointment
{
    public int Id { get; set; }

    // =====================================================
    // DOCTOR
    // =====================================================

    public int DoctorId
    { get; set; }

    public Doctor Doctor
    { get; set; }

    // =====================================================
    // PATIENT
    // =====================================================

    public int PatientId
    { get; set; }

    public Patient Patient
    { get; set; }

    // =====================================================
    // APPOINTMENT DATE & TIME
    // =====================================================

    public DateTime Date
    { get; set; }

    public TimeSpan StartTime
    { get; set; }

    // =====================================================
    // TOKEN NUMBER
    // =====================================================

    public string TokenNumber
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

    // =====================================================
    // STATUS FLOW
    // =====================================================

    // Waiting
    // InProgress
    // PrescriptionAdded
    // Completed

    public string Status
    { get; set; }
        = "Waiting";

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
}