namespace AuthDemo.Models;

public class Consultation
{
    public int Id { get; set; }

    // =====================================================
    // APPOINTMENT
    // =====================================================

    public int AppointmentId
    { get; set; }

    public Appointment Appointment
    { get; set; }

    // =====================================================
    // PATIENT
    // =====================================================

    public int PatientId
    { get; set; }

    public Patient Patient
    { get; set; }

    // =====================================================
    // DOCTOR NOTES
    // =====================================================

    public string Diagnosis
    { get; set; }

    public string ClinicalNotes
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
}