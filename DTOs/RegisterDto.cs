namespace AuthDemo.DTOs;

public class RegisterDto
{
    // =====================================================
    // ADMIN DETAILS
    // =====================================================

    public string Name
    { get; set; }

    public string MobileNumber
    { get; set; }

    public string Email
    { get; set; }

    public string Password
    { get; set; }

    // =====================================================
    // ROLE
    // =====================================================

    public string Role
    { get; set; }
        = "Admin";

    // =====================================================
    // HOSPITAL DETAILS
    // =====================================================

    public string HospitalName
    { get; set; }

    public string? HospitalAddress
    { get; set; }

    public string? HospitalPhone
    { get; set; }

    public string? HospitalEmail
    { get; set; }
}