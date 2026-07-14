namespace AuthDemo.Models;

public class Hospital
{
    public int Id { get; set; }

    // =====================================================
    // HOSPITAL DETAILS
    // =====================================================

    public string? Name
    { get; set; }

    public string? Address
    { get; set; }

    public string? Phone
    { get; set; }

    public string? Email
    { get; set; }

    public string? City { get; set; }

    public string? State { get; set; }
    public string? District { get; set; }

    public string? Country { get; set; }

    public string? PostalCode { get; set; }


    // =====================================================
    // ACTIVE STATUS
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
}