//using Microsoft.EntityFrameworkCore;

//using BCrypt.Net;

//using AuthDemo.Data;
//using AuthDemo.DTOs;
//using AuthDemo.Helpers;
//using AuthDemo.Models;
//using AuthDemo.Services.Interfaces;

//namespace AuthDemo.Services;

//public class AuthService
//    : IAuthService
//{
//    private readonly AppDbContext
//        _context;

//    private readonly JwtHelper
//        _jwtHelper;

//    public AuthService(
//        AppDbContext context,
//        JwtHelper jwtHelper)
//    {
//        _context =
//            context;

//        _jwtHelper =
//            jwtHelper;
//    }

//    // =====================================================
//    // REGISTER ADMIN + HOSPITAL
//    // =====================================================

//    public async Task<string>
//        RegisterAsync(
//            RegisterDto dto)
//    {
//        var exists =
//            await _context.Users

//                .AnyAsync(x =>
//                    x.Email ==
//                    dto.Email
//                );

//        if (exists)
//        {
//            return
//                "Email already exists";
//        }

//        // =================================================
//        // CREATE HOSPITAL
//        // =================================================

//        var hospital =
//            new Hospital
//            {
//                Name =
//                    dto.HospitalName,

//                Address =
//                    dto.HospitalAddress,

//                Phone =
//                    dto.HospitalPhone,

//                Email =
//                    dto.HospitalEmail
//            };

//        _context.Hospitals
//            .Add(hospital);

//        await _context
//            .SaveChangesAsync();

//        // =================================================
//        // CREATE ADMIN USER
//        // =================================================

//        var user =
//            new User
//            {
//                Name =
//                    dto.Name,

//                MobileNumber =
//                    dto.MobileNumber,

//                Email =
//                    dto.Email,

//                PasswordHash =
//                    BCrypt.Net.BCrypt
//                        .HashPassword(
//                            dto.Password
//                        ),

//                Role =
//                    "Admin",

//                HospitalId =
//                    hospital.Id
//            };

//        _context.Users
//            .Add(user);

//        await _context
//            .SaveChangesAsync();

//        return
//            "Admin registered successfully";
//    }

//    // =====================================================
//    // REGISTER DOCTOR
//    // =====================================================

//    public async Task<string>
//        RegisterDoctorAsync(
//            RegisterDoctorDto dto)
//    {
//        var exists =
//            await _context.Users

//                .AnyAsync(x =>
//                    x.Email ==
//                    dto.Email
//                );

//        if (exists)
//        {
//            return
//                "Email already exists";
//        }

//        // =================================================
//        // GET DOCTOR
//        // =================================================

//        var doctor =
//            await _context.Doctors

//                .FirstOrDefaultAsync(x =>
//                    x.Id ==
//                    dto.DoctorId
//                );

//        if (doctor == null)
//        {
//            return
//                "Doctor not found";
//        }

//        // =================================================
//        // CREATE LOGIN USER
//        // =================================================

//        var user =
//            new User
//            {
//                Name =
//                    dto.Name,

//                MobileNumber =
//                    dto.MobileNumber,

//                Email =
//                    dto.Email,

//                PasswordHash =
//                    BCrypt.Net.BCrypt
//                        .HashPassword(
//                            dto.Password
//                        ),

//                Role =
//                    "Doctor",

//                DoctorId =
//                    doctor.Id,

//                HospitalId =
//                    doctor.HospitalId
//            };

//        _context.Users
//            .Add(user);

//        await _context
//            .SaveChangesAsync();

//        return
//            "Doctor registered successfully";
//    }

//    // =====================================================
//    // REGISTER RECEPTIONIST
//    // =====================================================

//    public async Task<string>
//        RegisterReceptionistAsync(
//            RegisterReceptionistDto dto)
//    {
//        var exists =
//            await _context.Users

//                .AnyAsync(x =>
//                    x.Email ==
//                    dto.Email
//                );

//        if (exists)
//        {
//            return
//                "Email already exists";
//        }

//        // =================================================
//        // CHECK HOSPITAL
//        // =================================================

//        var hospital =
//            await _context.Hospitals

//                .FirstOrDefaultAsync(x =>
//                    x.Id ==
//                    dto.HospitalId
//                );

//        if (hospital == null)
//        {
//            return
//                "Hospital not found";
//        }

//        // =================================================
//        // CREATE RECEPTIONIST
//        // =================================================

//        var receptionist =
//            new Receptionist
//            {
//                Name =
//                    dto.Name,

//                Email =
//                    dto.Email,

//                Phone =
//                    dto.Phone,

//                PasswordHash =
//                    BCrypt.Net.BCrypt
//                        .HashPassword(
//                            dto.Password
//                        ),

//                HospitalId =
//                    dto.HospitalId
//            };

//        _context.Receptionists
//            .Add(receptionist);

//        // =================================================
//        // CREATE LOGIN USER
//        // =================================================

//        var user =
//            new User
//            {
//                Name =
//                    dto.Name,

//                MobileNumber =
//                    dto.Phone,

//                Email =
//                    dto.Email,

//                PasswordHash =
//                    receptionist.PasswordHash,

//                Role =
//                    "Receptionist",

//                HospitalId =
//                    dto.HospitalId
//            };

//        _context.Users
//            .Add(user);

//        await _context
//            .SaveChangesAsync();

//        return
//            "Receptionist registered successfully";
//    }

//    // =====================================================
//    // LOGIN
//    // =====================================================

//    public async Task<LoginResponseDto?>
//        LoginAsync(
//            LoginDto dto)
//    {
//        var user =
//            await _context.Users

//                .Include(x =>
//                    x.Hospital)

//                .FirstOrDefaultAsync(x =>
//                    x.Email ==
//                    dto.Email
//                );

//        if (user == null)
//        {
//            return null;
//        }

//        // =================================================
//        // PASSWORD CHECK
//        // =================================================

//        var valid =
//            BCrypt.Net.BCrypt
//                .Verify(
//                    dto.Password,
//                    user.PasswordHash
//                );

//        if (!valid)
//        {
//            return null;
//        }

//        // =================================================
//        // GENERATE JWT TOKEN
//        // =================================================

//        var token =
//            _jwtHelper
//                .GenerateToken(user);

//        return new LoginResponseDto
//        {
//            Token =
//                token,

//            Role =
//                user.Role,

//            Email =
//                user.Email,

//            DoctorId =
//                user.DoctorId,

//            HospitalId =
//                user.HospitalId,

//            HospitalName =
//                user.Hospital == null
//                    ? ""
//                    : user.Hospital.Name
//        };
//    }

//    // =====================================================
//    // FORGOT PASSWORD
//    // =====================================================

//    public async Task<string>
//        ForgotPasswordAsync(
//            string email)
//    {
//        var user =
//            await _context.Users

//                .FirstOrDefaultAsync(x =>
//                    x.Email ==
//                    email
//                );

//        if (user == null)
//        {
//            return
//                "User not found";
//        }

//        // =================================================
//        // GENERATE OTP
//        // =================================================

//        var otp =
//            new Random()

//                .Next(
//                    100000,
//                    999999
//                )

//                .ToString();

//        var otpData =
//            new OtpVerification
//            {
//                Email =
//                    email,

//                Otp =
//                    otp,

//                ExpiryTime =
//                    DateTime.UtcNow
//                        .AddMinutes(10),

//                IsUsed =
//                    false
//            };

//        _context.OtpVerifications
//            .Add(otpData);

//        await _context
//            .SaveChangesAsync();

//        return
//            $"OTP sent successfully : {otp}";
//    }

//    // =====================================================
//    // VERIFY OTP
//    // =====================================================

//    public async Task<string>
//        VerifyOtpAsync(
//            string otp)
//    {
//        var otpData =
//            await _context
//                .OtpVerifications

//                .FirstOrDefaultAsync(x =>

//                    x.Otp ==
//                    otp &&

//                    x.IsUsed ==
//                    false &&

//                    x.ExpiryTime >
//                    DateTime.UtcNow
//                );

//        if (otpData == null)
//        {
//            return null;
//        }

//        // =================================================
//        // CREATE RESET TOKEN
//        // =================================================

//        var resetToken =
//            Guid.NewGuid()
//                .ToString();

//        otpData.IsUsed =
//            true;

//        otpData.ResetToken =
//            resetToken;

//        otpData.ResetTokenExpiry =
//            DateTime.UtcNow
//                .AddMinutes(15);

//        await _context
//            .SaveChangesAsync();

//        return resetToken;
//    }

//    // =====================================================
//    // RESET PASSWORD
//    // =====================================================

//    public async Task<string>
//        ResetPasswordAsync(
//            string token,
//            string newPassword)
//    {
//        var otpData =
//            await _context
//                .OtpVerifications

//                .FirstOrDefaultAsync(x =>

//                    x.ResetToken ==
//                    token &&

//                    x.ResetTokenExpiry >
//                    DateTime.UtcNow
//                );

//        if (otpData == null)
//        {
//            return
//                "Invalid or expired token";
//        }

//        var user =
//            await _context.Users

//                .FirstOrDefaultAsync(x =>
//                    x.Email ==
//                    otpData.Email
//                );

//        if (user == null)
//        {
//            return
//                "User not found";
//        }

//        // =================================================
//        // UPDATE PASSWORD
//        // =================================================

//        user.PasswordHash =
//            BCrypt.Net.BCrypt
//                .HashPassword(
//                    newPassword
//                );

//        await _context
//            .SaveChangesAsync();

//        return
//            "Password reset successful";
//    }
//}




using Microsoft.EntityFrameworkCore;

using BCrypt.Net;

using AuthDemo.Data;
using AuthDemo.DTOs;
using AuthDemo.Helpers;
using AuthDemo.Models;
using AuthDemo.Services.Interfaces;

namespace AuthDemo.Services;

public class AuthService
    : IAuthService
{
    private readonly AppDbContext
        _context;

    private readonly JwtHelper
        _jwtHelper;

    private readonly EmailHelper
        _emailHelper;

    public AuthService(
        AppDbContext context,
        JwtHelper jwtHelper,
        EmailHelper emailHelper)
    {
        _context =
            context;

        _jwtHelper =
            jwtHelper;

        _emailHelper =
            emailHelper;
    }

    // =====================================================
    // REGISTER ADMIN + HOSPITAL
    // =====================================================

    public async Task<string>
        RegisterAsync(
            RegisterDto dto)
    {
        var exists =
            await _context.Users

                .AnyAsync(x =>
                    x.Email ==
                    dto.Email
                );

        if (exists)
        {
            return
                "Email already exists";
        }

        // =================================================
        // CREATE HOSPITAL
        // =================================================

        var hospital =
            new Hospital
            {
                Name =
                    dto.HospitalName,

                Address =
                    dto.HospitalAddress,

                Phone =
                    dto.HospitalPhone,

                Email =
                    dto.HospitalEmail
            };

        _context.Hospitals
            .Add(hospital);

        await _context
            .SaveChangesAsync();

        // =================================================
        // CREATE ADMIN USER
        // =================================================

        var user =
            new User
            {
                Name =
                    dto.Name,

                MobileNumber =
                    dto.MobileNumber,

                Email =
                    dto.Email,

                PasswordHash =
                    BCrypt.Net.BCrypt
                        .HashPassword(
                            dto.Password
                        ),

                Role =
                    "Admin",

                HospitalId =
                    hospital.Id
            };

        _context.Users
            .Add(user);

        await _context
            .SaveChangesAsync();

        return
            "Admin registered successfully";
    }

    // =====================================================
    // REGISTER DOCTOR
    // =====================================================

    public async Task<string>
        RegisterDoctorAsync(
            RegisterDoctorDto dto)
    {
        var exists =
            await _context.Users

                .AnyAsync(x =>
                    x.Email ==
                    dto.Email
                );

        if (exists)
        {
            return
                "Email already exists";
        }

        var doctor =
            await _context.Doctors

                .FirstOrDefaultAsync(x =>
                    x.Id ==
                    dto.DoctorId
                );

        if (doctor == null)
        {
            return
                "Doctor not found";
        }

        var user =
            new User
            {
                Name =
                    dto.Name,

                MobileNumber =
                    dto.MobileNumber,

                Email =
                    dto.Email,

                PasswordHash =
                    BCrypt.Net.BCrypt
                        .HashPassword(
                            dto.Password
                        ),

                Role =
                    "Doctor",

                DoctorId =
                    doctor.Id,

                HospitalId =
                    doctor.HospitalId
            };

        _context.Users
            .Add(user);

        await _context
            .SaveChangesAsync();

        return
            "Doctor registered successfully";
    }

    // =====================================================
    // REGISTER RECEPTIONIST
    // =====================================================

    public async Task<string>
        RegisterReceptionistAsync(
            RegisterReceptionistDto dto)
    {
        var exists =
            await _context.Users

                .AnyAsync(x =>
                    x.Email ==
                    dto.Email
                );

        if (exists)
        {
            return
                "Email already exists";
        }

        var hospital =
            await _context.Hospitals

                .FirstOrDefaultAsync(x =>
                    x.Id ==
                    dto.HospitalId
                );

        if (hospital == null)
        {
            return
                "Hospital not found";
        }

        var receptionist =
            new Receptionist
            {
                Name =
                    dto.Name,

                Email =
                    dto.Email,

                Phone =
                    dto.Phone,

                PasswordHash =
                    BCrypt.Net.BCrypt
                        .HashPassword(
                            dto.Password
                        ),

                HospitalId =
                    dto.HospitalId
            };

        _context.Receptionists
            .Add(receptionist);

        var user =
            new User
            {
                Name =
                    dto.Name,

                MobileNumber =
                    dto.Phone,

                Email =
                    dto.Email,

                PasswordHash =
                    receptionist.PasswordHash,

                Role =
                    "Receptionist",

                HospitalId =
                    dto.HospitalId
            };

        _context.Users
            .Add(user);

        await _context
            .SaveChangesAsync();

        return
            "Receptionist registered successfully";
    }

    // =====================================================
    // LOGIN
    // =====================================================

    public async Task<LoginResponseDto?>
        LoginAsync(
            LoginDto dto)
    {
        var user =
            await _context.Users
                .Include(x => x.Hospital)
                .FirstOrDefaultAsync(x =>
                    x.Email == dto.Email &&
                    x.IsActive);

        if (user == null)
        {
            return null;
        }

        var valid =
            BCrypt.Net.BCrypt.Verify(
                dto.Password,
                user.PasswordHash);

        if (!valid)
        {
            return null;
        }

        var token =
            _jwtHelper.GenerateToken(user);

        return new LoginResponseDto
        {
            Token = token,
            Name = user.Name,
            Role = user.Role,
            Email = user.Email,
            DoctorId = user.DoctorId,
            HospitalId = user.HospitalId,
            HospitalName = user.Hospital == null ? "" : user.Hospital.Name,
            MustChangePassword = user.MustChangePassword
        };
    }


    // =====================================================
    // FORGOT PASSWORD
    // =====================================================

    public async Task<string>
        ForgotPasswordAsync(
            string email)
    {
        var user =
            await _context.Users

                .FirstOrDefaultAsync(x =>
                    x.Email ==
                    email
                );

        if (user == null)
        {
            return
                "User not found";
        }

        // =================================================
        // GENERATE OTP
        // =================================================

        var otp =
            new Random()

                .Next(
                    100000,
                    999999
                )

                .ToString();

        // =================================================
        // REMOVE OLD OTP
        // =================================================

        var oldOtps =
            await _context
                .OtpVerifications

                .Where(x =>
                    x.Email ==
                    email
                )

                .ToListAsync();

        if (oldOtps.Any())
        {
            _context
                .OtpVerifications
                .RemoveRange(oldOtps);
        }

        // =================================================
        // SAVE OTP
        // =================================================

        var otpData =
            new OtpVerification
            {
                Email =
                    email,

                Otp =
                    otp,

                ExpiryTime =
                    DateTime.UtcNow
                        .AddMinutes(10),

                IsUsed =
                    false
            };

        _context.OtpVerifications
            .Add(otpData);

        await _context
            .SaveChangesAsync();

        // =================================================
        // SEND REAL EMAIL
        // =================================================

        await _emailHelper
            .SendEmail(
                email,
                otp
            );

        return
            "OTP sent successfully";
    }

    // =====================================================
    // VERIFY OTP
    // =====================================================

    public async Task<string>
        VerifyOtpAsync(
            string otp)
    {
        var otpData =
            await _context
                .OtpVerifications

                .FirstOrDefaultAsync(x =>

                    x.Otp ==
                    otp &&

                    x.IsUsed ==
                    false &&

                    x.ExpiryTime >
                    DateTime.UtcNow
                );

        if (otpData == null)
        {
            return null;
        }

        var resetToken =
            Guid.NewGuid()
                .ToString();

        otpData.IsUsed =
            true;

        otpData.ResetToken =
            resetToken;

        otpData.ResetTokenExpiry =
            DateTime.UtcNow
                .AddMinutes(15);

        await _context
            .SaveChangesAsync();

        return resetToken;
    }

    // =====================================================
    // RESET PASSWORD
    // =====================================================

    public async Task<string>
        ResetPasswordAsync(
            string token,
            string newPassword)
    {
        var otpData =
            await _context
                .OtpVerifications

                .FirstOrDefaultAsync(x =>

                    x.ResetToken ==
                    token &&

                    x.ResetTokenExpiry >
                    DateTime.UtcNow
                );

        if (otpData == null)
        {
            return
                "Invalid or expired token";
        }

        var user =
            await _context.Users

                .FirstOrDefaultAsync(x =>
                    x.Email ==
                    otpData.Email
                );

        if (user == null)
        {
            return
                "User not found";
        }

        user.PasswordHash =
            BCrypt.Net.BCrypt
                .HashPassword(
                    newPassword
                );

        await _context
            .SaveChangesAsync();

        return
            "Password reset successful";
    }

    // =====================================================
    // CHANGE PASSWORD
    // =====================================================

    public async Task<string>
        ChangePasswordAsync(
            int userId,
            ChangePasswordDto dto)
    {
        var user =
            await _context.Users

                .FirstOrDefaultAsync(x =>
                    x.Id == userId);

        if (user == null)
        {
            return "User not found";
        }

        bool isValidPassword =
            BCrypt.Net.BCrypt.Verify(
                dto.OldPassword,
                user.PasswordHash);

        if (!isValidPassword)
        {
            return "Old password is incorrect";
        }

        user.PasswordHash =
            BCrypt.Net.BCrypt.HashPassword(
                dto.NewPassword);

        user.MustChangePassword = false;

        await _context.SaveChangesAsync();

        return "Password changed successfully";
    }
}

