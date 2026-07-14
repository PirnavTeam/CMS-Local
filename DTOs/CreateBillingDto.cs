namespace AuthDemo.DTOs;

public class CreateBillingDto
{
    public int AppointmentId
    { get; set; }

    public decimal MedicineCharge
    { get; set; }

    public decimal LabCharge
    { get; set; }

    public string PaymentMode
    { get; set; }
}