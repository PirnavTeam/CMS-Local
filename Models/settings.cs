namespace AuthDemo.Models;

public class Setting
{
    public int Id { get; set; }

    public string ApplicationName { get; set; }

    public string SupportEmail { get; set; }

    public string SupportPhone { get; set; }

    public string Address { get; set; }

    public bool EmailNotificationsEnabled { get; set; }

    public bool SmsNotificationsEnabled { get; set; }

    public DateTime UpdatedAt { get; set; }
        = DateTime.UtcNow;
}