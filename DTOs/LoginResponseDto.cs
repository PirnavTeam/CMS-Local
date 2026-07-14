namespace AuthDemo.DTOs;

public class LoginResponseDto
{
    // =====================================================
    // JWT TOKEN
    // =====================================================

    public string Token
    { get; set; }

    // =====================================================
    // USER DETAILS
    // =====================================================

    public string Role
    { get; set; }

    public string Name
    { get; set; }

    public string Email
    { get; set; }

    // =====================================================
    // DOCTOR SUPPORT
    // =====================================================

    public int? DoctorId
    { get; set; }

    // =====================================================
    // MULTI HOSPITAL
    // =====================================================

    public int HospitalId
    { get; set; }

    public string HospitalName
    { get; set; }

    public bool MustChangePassword
    { get; set; }
}