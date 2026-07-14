namespace AuthDemo.Models;

public class MedicalHistory
{
    public int Id { get; set; }

    // =====================================================
    // PATIENT
    // =====================================================

    public int PatientId
    { get; set; }

    public Patient Patient
    { get; set; }

    // =====================================================
    // MEDICAL HISTORY DETAILS
    // =====================================================

    public string Allergies
    { get; set; }

    public string ChronicDiseases
    { get; set; }

    public string CurrentMedications
    { get; set; }

    public string Surgeries
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