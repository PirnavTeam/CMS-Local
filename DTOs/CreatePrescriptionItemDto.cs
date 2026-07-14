namespace AuthDemo.DTOs;

public class CreatePrescriptionItemDto
{
    // =====================================================
    // MEDICINE DETAILS
    // =====================================================

    public string MedicineName
    { get; set; }

    public string Dosage
    { get; set; }

    public string Frequency
    { get; set; }

    public string Duration
    { get; set; }

    public string Notes
    { get; set; }
}