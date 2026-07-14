namespace AuthDemo.DTOs;

public class CreateAdminDto
{
    public string Name { get; set; } = string.Empty;

    public string? FullName { get; set; }

    public string MobileNumber { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public string Email { get; set; } = string.Empty;

    public string? Password { get; set; }

    public string? TemporaryPassword { get; set; }

    public string Role { get; set; } = "Admin";

    public int HospitalId { get; set; }

    public int? ClinicId { get; set; }

    public bool SendWelcomeEmail { get; set; } = true;
}
