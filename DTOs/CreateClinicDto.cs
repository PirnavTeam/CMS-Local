using System.ComponentModel.DataAnnotations;

namespace AuthDemo.DTOs;

public class CreateClinicDto
{
    public string? ClinicName { get; set; }

    [Required]
    [RegularExpression(@"^[a-zA-Z0-9._%+-]+@gmail\.com$",
    ErrorMessage = "Only Gmail addresses are allowed")]
    public string Email { get; set; }

    [Required]
    [RegularExpression(@"^[6-9]\d{9}$",
     ErrorMessage = "Enter valid 10 digit mobile number")]
    public string PhoneNumber { get; set; }
    public string? Address { get; set; }
    public string? Location { get; set; }

    public string? City { get; set; }
    public string? State { get; set; }
    public string? District { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }

    public bool IsActive { get; set; } = true;
}
