
namespace AuthDemo.Models;

public class Billing
{
    public int Id
    { get; set; }

    // =====================================
    // APPOINTMENT
    // =====================================

    public int AppointmentId
    { get; set; }

    public Appointment? Appointment
    { get; set; }

    // =====================================
    // PATIENT
    // =====================================

    public int PatientId
    { get; set; }

    public Patient? Patient
    { get; set; }

    // =====================================
    // DOCTOR
    // =====================================

    public int DoctorId
    { get; set; }

    public Doctor? Doctor
    { get; set; }

    // =====================================
    // BILL AMOUNTS
    // =====================================

    public decimal ConsultationCharge
    { get; set; }

    public decimal MedicineCharge
    { get; set; }

    public decimal LabCharge
    { get; set; }

    public decimal TotalAmount
    { get; set; }

    // =====================================
    // PAYMENT
    // =====================================

    public string PaymentMode
    { get; set; }
        = string.Empty;

    // Paid / Pending
    public string Status
    { get; set; }
        = "Paid";

    // =====================================
    // MULTI HOSPITAL
    // =====================================

    public int HospitalId
    { get; set; }

    public Hospital? Hospital
    { get; set; }

    // =====================================
    // CREATED DATE
    // =====================================

    public DateTime CreatedAt
    { get; set; }
        = DateTime.UtcNow;
}

