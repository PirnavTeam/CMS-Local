namespace AuthDemo.DTOs;

public class CreateConsultationDto
{
    // =====================================================
    // APPOINTMENT
    // =====================================================

    public int AppointmentId
    { get; set; }

    // =====================================================
    // PATIENT
    // =====================================================

    public int PatientId
    { get; set; }

    // =====================================================
    // DOCTOR NOTES
    // =====================================================

    public string Diagnosis
    { get; set; }

    public string ClinicalNotes
    { get; set; }
}