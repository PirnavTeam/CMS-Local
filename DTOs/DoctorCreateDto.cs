using System.ComponentModel.DataAnnotations;

namespace AuthDemo.DTOs;

public class DoctorCreateDto
{
    public string Name { get; set; } = string.Empty;

    public string Specialization { get; set; } = string.Empty;

    public string? Experience { get; set; }

    public string? Qualification { get; set; }

    [Required(ErrorMessage = "Consultation fee is required.")]
    [Range(0.01, double.MaxValue, ErrorMessage = "Consultation fee must be required.")]
    public decimal? ConsultationFee { get; set; }

    public string? AreaofExpertise
    {
        get; set;
    }

    public bool IsActive { get; set; } = true;

    public string PhoneNumber { get; set; }

    public IFormFile? Image { get; set; }

    public string Email { get; set; }
}