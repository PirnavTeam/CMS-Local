namespace AuthDemo.Models;

public class DoctorDiagnosis
{
    public int Id
    { get; set; }

    // =====================================================
    // DOCTOR
    // =====================================================

    public int DoctorId
    { get; set; }

    public Doctor Doctor
    { get; set; }

    // =====================================================
    // DIAGNOSIS NAME
    // =====================================================

    public string Name
    { get; set; }

    // =====================================================
    // HOSPITAL
    // =====================================================

    public int HospitalId
    { get; set; }

    public Hospital Hospital
    { get; set; }

    // =====================================================
    // CREATED DATE
    // =====================================================

    public DateTime CreatedAt
    { get; set; }
        = DateTime.UtcNow;
}