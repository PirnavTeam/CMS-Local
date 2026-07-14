public class Notification
{
    public int Id { get; set; }

    public string Title { get; set; }

    public string Message { get; set; }

    public string Recipient { get; set; }

    public string Type { get; set; } // Email or SMS

    public bool IsSent { get; set; }

    public DateTime CreatedAt { get; set; }
        = DateTime.UtcNow;
}