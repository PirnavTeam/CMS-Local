namespace AuthDemo.DTOs;

public class CreateScheduleSettingDto
{
    public int SlotDuration { get; set; }

    public TimeSpan ClinicOpen { get; set; }

    public TimeSpan ClinicClose { get; set; }
}