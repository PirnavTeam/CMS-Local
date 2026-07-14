public class Notification
{
    public int Id { get; set; }

    public string Title { get; set; }

    public string Message { get; set; }


    public bool IsRead { get; set; }
    = false;


    public bool IsSent { get; set; }

    public DateTime CreatedAt { get; set; }
        = DateTime.UtcNow;
}