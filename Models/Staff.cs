using System.ComponentModel.DataAnnotations;

namespace AuthDemo.Models;

public class Staff
{
    public int Id { get; set; }

    // =====================================================
    // LINK TO USER (AUTH)
    // =====================================================

    public int UserId
    { get; set; }

    public User User
    { get; set; }

    // =====================================================
    // STAFF DETAILS
    // =====================================================

    [Required]
    public string Role
    { get; set; }


    // =====================================================
    // ACTIVE STATUS
    // =====================================================

    public bool IsActive
    { get; set; }
        = true;

    // =====================================================
    // MULTI HOSPITAL SUPPORT
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