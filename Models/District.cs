public class District
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public int StateId { get; set; }

    // Navigation Property
    public State State { get; set; }
}