using System.ComponentModel.DataAnnotations;

namespace AuthDemo.Models;

public class ScheduleSetting
{
    public int Id { get; set; }

    // =========================================
    // GENERAL SETTINGS
    // =========================================

    [Required]
    public int SlotDuration { get; set; }
        = 30;

    [Required]
    public TimeSpan ClinicOpen { get; set; }

    [Required]
    public TimeSpan ClinicClose { get; set; }

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