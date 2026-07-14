//using AuthDemo.DTOs;

//namespace AuthDemo.Services.Interfaces;

//public interface IAuthService
//{
//    // =====================================================
//    // REGISTER ADMIN + HOSPITAL
//    // =====================================================

//    Task<string>
//        RegisterAsync(
//            RegisterDto dto
//        );

//    // =====================================================
//    // REGISTER DOCTOR
//    // =====================================================

//    Task<string>
//        RegisterDoctorAsync(
//            RegisterDoctorDto dto
//        );

//    // =====================================================
//    // REGISTER RECEPTIONIST
//    // =====================================================

//    Task<string>
//        RegisterReceptionistAsync(
//            RegisterReceptionistDto dto
//        );

//    // =====================================================
//    // LOGIN
//    // =====================================================

//    Task<LoginResponseDto?>
//        LoginAsync(
//            LoginDto dto
//        );

//    // =====================================================
//    // FORGOT PASSWORD
//    // =====================================================

//    Task<string>
//        ForgotPasswordAsync(
//            string email
//        );

//    // =====================================================
//    // VERIFY OTP
//    // =====================================================

//    Task<string>
//        VerifyOtpAsync(
//            string otp
//        );

//    // =====================================================
//    // RESET PASSWORD
//    // =====================================================

//    Task<string>
//        ResetPasswordAsync(
//            string token,
//            string newPassword
//        );
//}



using AuthDemo.DTOs;

namespace AuthDemo.Services.Interfaces;

public interface IAuthService
{
    // =====================================================
    // REGISTER ADMIN + HOSPITAL
    // =====================================================

    Task<string> RegisterAsync(
        RegisterDto dto
    );

    // =====================================================
    // REGISTER DOCTOR
    // =====================================================

    Task<string> RegisterDoctorAsync(
        RegisterDoctorDto dto
    );

    // =====================================================
    // REGISTER RECEPTIONIST
    // =====================================================

    Task<string> RegisterReceptionistAsync(
        RegisterReceptionistDto dto
    );

    // =====================================================
    // LOGIN
    // =====================================================

    Task<LoginResponseDto?> LoginAsync(
        LoginDto dto
    );

    // =====================================================
    // FORGOT PASSWORD
    // =====================================================

    Task<string> ForgotPasswordAsync(
        string email
    );

    // =====================================================
    // VERIFY OTP
    // =====================================================

    Task<string> VerifyOtpAsync(
        string otp
    );

    // =====================================================
    // RESET PASSWORD
    // =====================================================

    Task<string> ResetPasswordAsync(
        string token,
        string newPassword
    );

    // =====================================================
    // CHANGE PASSWORD
    // =====================================================

    Task<string> ChangePasswordAsync(
        int userId,
        ChangePasswordDto dto
    );
}