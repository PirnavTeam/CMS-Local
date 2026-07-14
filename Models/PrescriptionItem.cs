namespace AuthDemo.Models;

public class PrescriptionItem
{
    public int Id { get; set; }

    // =====================================================
    // PRESCRIPTION
    // =====================================================

    public int PrescriptionId
    { get; set; }

    public Prescription Prescription
    { get; set; }

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