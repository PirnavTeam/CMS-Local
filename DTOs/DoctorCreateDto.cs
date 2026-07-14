namespace AuthDemo.DTOs;

public class DoctorCreateDto
{
    public string Name { get; set; } = string.Empty;

    public string Specialization { get; set; } = string.Empty;

    public string? Experience { get; set; }

    public string? Qualification { get; set; }

    public decimal Fees { get; set; }

    public decimal? ConsultationFee { get; set; }

    public string Email { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public string? PhoneNumber { get; set; }

    public bool IsActive { get; set; } = true;
}
