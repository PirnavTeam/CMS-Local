namespace AuthDemo.DTOs;

public class CreatePatientDto
{
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
}