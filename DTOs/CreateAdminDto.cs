using System.ComponentModel.DataAnnotations;

namespace AuthDemo.DTOs;

public class CreateAdminDto
{
    public string? Name { get; set; } = string.Empty;

    public string? FullName { get; set; }

    public string? MobileNumber { get; set; } = string.Empty;

    public string? Email { get; set; } = string.Empty;


    public string? Role { get; set; } = "Admin";

    public int HospitalId { get; set; }

    public bool SendWelcomeEmail { get; set; } = true;
}
