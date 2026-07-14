namespace AuthDemo.Models;

public class Doctor
{
    public int Id { get; set; }

    // =====================================================
    // BASIC DETAILS
    // =====================================================

    public string Name
    { get; set; }

    public string Specialization
    { get; set; }

    public int Experience
    { get; set; }

    public decimal Fees
    { get; set; }

    public string Email
    { get; set; }

    public string Phone
    { get; set; }

    // =====================================================
    // LOGIN
    // =====================================================

    

    public string Role
    { get; set; }
        = "Doctor";

    // =====================================================
    // IMAGE
    // =====================================================

    

    // =====================================================
    // STATUS
    // =====================================================

    public bool IsActive
    { get; set; }
        = true;

    // =====================================================
    // MULTI HOSPITAL
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