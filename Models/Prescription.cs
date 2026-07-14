namespace AuthDemo.Models;

public class Prescription
{
    public int Id
    { get; set; }

    public int AppointmentId
    { get; set; }

    public Appointment Appointment
    { get; set; }

    public int PatientId
    { get; set; }

    public Patient Patient
    { get; set; }

    public string Diagnosis
    { get; set; }

    public string Instructions
    { get; set; }

    public DateTime FollowUpDate
    { get; set; }

    public string Status
    { get; set; }
        = "Draft";

    public int HospitalId
    { get; set; }

    public Hospital Hospital
    { get; set; }

    public ICollection<PrescriptionItem>
        Medicines
    { get; set; }
        = new List<PrescriptionItem>();

    public DateTime CreatedAt
    { get; set; }
        = DateTime.UtcNow;
}