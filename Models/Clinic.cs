namespace AuthDemo.Models;

public class Clinic
{
    public int Id { get; set; }

    public string ClinicName { get; set; }

    public string Email { get; set; }

    public string PhoneNumber { get; set; }

    public string Address { get; set; }

    public string City { get; set; }

    public string State { get; set; }

    public string Country { get; set; }

    public string PostalCode { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; }
        = DateTime.UtcNow;
}