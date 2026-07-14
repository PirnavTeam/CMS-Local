namespace AuthDemo.Models;

public class Receptionist
{
    public int Id
    { get; set; }

    public string Name
    { get; set; }

    public string Email
    { get; set; }

    public string Phone
    { get; set; }

    public string PasswordHash
    { get; set; }

    public bool IsActive
    { get; set; }
        = true;

    // =====================================
    // HOSPITAL
    // =====================================

    public int HospitalId
    { get; set; }

    public Hospital Hospital
    { get; set; }

    public DateTime CreatedAt
    { get; set; }
        = DateTime.UtcNow;
}