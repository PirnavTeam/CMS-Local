namespace AuthDemo.DTOs;

public class RegisterDoctorDto
{
    // =====================================================
    // DOCTOR DETAILS
    // =====================================================

    public int DoctorId
    { get; set; }

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
        = "Doctor";
}