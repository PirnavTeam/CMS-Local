namespace AuthDemo.Models;

public class City
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public int DistrictId { get; set; }

    public string PostalCode { get; set; } = string.Empty;

    // Navigation Property
    public District District { get; set; }
}