namespace AuthDemo.DTOs;

public class CreateMedicalHistoryDto
{
    // =====================================================
    // PATIENT
    // =====================================================

    public int PatientId
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
}