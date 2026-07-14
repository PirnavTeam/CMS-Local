namespace AuthDemo.Models;

public class Hospital
{
    public int Id { get; set; }

    // =====================================================
    // HOSPITAL DETAILS
    // =====================================================

    public string Name
    { get; set; }

    public string? Address
    { get; set; }

    public string? Phone
    { get; set; }

    public string? Email
    { get; set; }

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