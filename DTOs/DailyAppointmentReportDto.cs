namespace AuthDemo.DTOs;

public class DailyAppointmentReportDto
{
    public string Day { get; set; }          // Mon, Tue
    public int Appointments { get; set; }    // Total
    public int Completed { get; set; }       // Completed
}