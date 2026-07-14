namespace AuthDemo.Models;

public class AppointmentDocument
{
    public int Id { get; set; }

    public int AppointmentId { get; set; }

    public Appointment? Appointment { get; set; }

    public string FileName { get; set; } = string.Empty;

    public string FilePath { get; set; } = string.Empty;

    public DateTime UploadedAt { get; set; }
        = DateTime.UtcNow;

    public int HospitalId { get; set; }
}