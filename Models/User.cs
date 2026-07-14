namespace AuthDemo.Models;

public class User
{
    public int Id
    { get; set; }

    // =====================================================
    // BASIC DETAILS
    // =====================================================

    public string Name
    { get; set; }

    public string MobileNumber
    { get; set; }

    public string Email
    { get; set; }

    // =====================================================
    // AUTH
    // =====================================================

    public string PasswordHash
    { get; set; }

    public string Role
    { get; set; }

    // =====================================================
    // DOCTOR LINK
    // =====================================================

    public int? DoctorId
    { get; set; }

    // =====================================================
    // MULTI HOSPITAL
    // =====================================================

    public int HospitalId
    { get; set; }

    public Hospital Hospital
    { get; set; }

    // =====================================================
    // STATUS
    // =====================================================

    public bool IsActive
    { get; set; }
        = true;

    // =====================================================
    // CREATED DATE
    // =====================================================

    public DateTime CreatedAt
    { get; set; }
        = DateTime.UtcNow;
    //password//
    public bool MustChangePassword
    {
        get;
        set;
    } = true;
}