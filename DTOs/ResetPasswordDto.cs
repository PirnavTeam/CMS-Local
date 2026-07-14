namespace AuthDemo.DTOs;

public class ResetPasswordDto
{
    // =====================================================
    // RESET TOKEN
    // =====================================================

    public string Token
    { get; set; }

    // =====================================================
    // NEW PASSWORD
    // =====================================================

    public string NewPassword
    { get; set; }
}