public class CreateScheduleDto
{
    public int DoctorId { get; set; }

    public List<string> Days { get; set; } // Monday, Tuesday

    public DateTime StartDate { get; set; } // 🔥 from date
    public DateTime EndDate { get; set; }   // 🔥 to date

    public TimeSpan WorkStart { get; set; }
    public TimeSpan WorkEnd { get; set; }

    public TimeSpan BreakStart { get; set; }
    public TimeSpan BreakEnd { get; set; }

    public int SlotDuration { get; set; } // 30 / 45 mins
}