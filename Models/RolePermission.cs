public class RolePermission
{
    public int Id { get; set; }

    public string RoleName { get; set; }

    public string Module { get; set; }

    public bool CanView { get; set; }

    public bool CanCreate { get; set; }

    public bool CanEdit { get; set; }

    public bool CanDelete { get; set; }
}