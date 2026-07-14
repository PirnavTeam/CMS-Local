namespace AuthDemo.Models;

public class PatientVitals
{
    public int Id { get; set; }

    public int AppointmentId { get; set; }

    public Appointment Appointment { get; set; }

    public int PatientId { get; set; }

    public Patient Patient { get; set; }

    public string Symptoms { get; set; }

    public string BloodPressure { get; set; }

    public string SugarLevel { get; set; }

    public string Temperature { get; set; }

    public string Weight { get; set; }

    public string PulseRate { get; set; }

    public string RespiratoryRate { get; set; }

    public int HospitalId { get; set; }

    public Hospital Hospital { get; set; }

    public DateTime CreatedAt { get; set; }
        = DateTime.UtcNow;
}