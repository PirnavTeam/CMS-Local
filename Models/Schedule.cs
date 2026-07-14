namespace AuthDemo.Models;

public class Schedule
{
    public int Id { get; set; }

    // =========================================
    // DOCTOR
    // =========================================

    public int DoctorId { get; set; }

    public Doctor Doctor { get; set; }

    // =========================================
    // DATE RANGE
    // =========================================

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    // =========================================
    // WORKING DAYS
    // Example:
    // Mon,Tue,Wed
    // =========================================

    public string Days { get; set; }

    // =========================================
    // WORKING HOURS
    // =========================================

    public TimeSpan WorkStart { get; set; }

    public TimeSpan WorkEnd { get; set; }

    // =========================================
    // BREAK TIME
    // =========================================

    public TimeSpan BreakStart { get; set; }

    public TimeSpan BreakEnd { get; set; }

    // =========================================
    // SLOT DURATION
    // =========================================

    public int SlotDuration { get; set; }

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