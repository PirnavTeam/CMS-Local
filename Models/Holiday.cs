using System.ComponentModel.DataAnnotations;

namespace AuthDemo.Models;

public class Holiday
{
    public int Id { get; set; }

    // =========================================
    // HOLIDAY DETAILS
    // =========================================

    [Required]
    public string Name { get; set; }

    [Required]
    public DateTime Date { get; set; }

    // =========================================
    // MULTI CLINIC SUPPORT
    // =========================================

    public int HospitalId { get; set; }

    public Hospital Hospital { get; set; }

    // =========================================
    // CREATED DATE
    // =========================================

    public DateTime CreatedAt { get; set; }
        = DateTime.UtcNow;
}