

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;


using AuthDemo.DTOs;
using AuthDemo.Services.Interfaces;

namespace AuthDemo.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController
    : ControllerBase
{
    private readonly IAuthService
        _authService;

    public AuthController(
        IAuthService authService)
    {
        _authService =
            authService;
    }

    // =====================================================
    // REGISTER ADMIN + HOSPITAL
    // =====================================================

   // [HttpPost("register")]
   // public async Task<IActionResult>
      //  Register(
        //    RegisterDto dto)
    //{
        //var result =
            //await _authService
                //.RegisterAsync(dto);

        //return Ok(new
        //{
           // message =
                //result
       // });
   // }

    // =====================================================
    // REGISTER DOCTOR
    // =====================================================

    [Authorize(Roles = "Admin")]
    [HttpPost("register-doctor")]
    public async Task<IActionResult>
        RegisterDoctor(
            RegisterDoctorDto dto)
    {
        var result =
            await _authService
                .RegisterDoctorAsync(dto);

        return Ok(new
        {
            message =
                result
        });
    }

    // =====================================================
    // REGISTER RECEPTIONIST
    // =====================================================

    [Authorize(Roles = "Admin")]
    [HttpPost("register-receptionist")]
    public async Task<IActionResult>
        RegisterReceptionist(
            RegisterReceptionistDto dto)
    {
        var result =
            await _authService
                .RegisterReceptionistAsync(dto);

        return Ok(new
        {
            message =
                result
        });
    }

    // =====================================================
    // LOGIN
    // =====================================================

    [HttpPost("login")]
    public async Task<IActionResult>
        Login(
            LoginDto dto)
    {
        var result =
            await _authService
                .LoginAsync(dto);

        if (result == null)
        {
            return Unauthorized(new
            {
                message =
                    "Invalid email or password"
            });
        }

        return Ok(new
        {
            message =
                "Login successful",

            token =
                result.Token,

            name =
                   result.Name,

            role =
                result.Role,

            email =
                result.Email,

            doctorId =
                result.DoctorId,

            hospitalId =
                result.HospitalId,

            hospitalName =
                result.HospitalName,

            mustChangePassword =
                result.MustChangePassword,

            forcePasswordChange =
                result.MustChangePassword
        });
    }

    // =====================================================
    // GET CURRENT USER
    // =====================================================

    [Authorize]
    [HttpGet("me")]
    public IActionResult
        Me()
    {
        var role =
            User.Claims.FirstOrDefault(
                x => x.Type ==
                    "role"
            )?.Value;

        var email =
            User.Claims.FirstOrDefault(
                x => x.Type ==
                    "email"
            )?.Value;

        var hospitalId =
            User.Claims.FirstOrDefault(
                x => x.Type ==
                    "HospitalId"
            )?.Value;

        var doctorId =
            User.Claims.FirstOrDefault(
                x => x.Type ==
                    "DoctorId"
            )?.Value;

        return Ok(new
        {
            role,
            email,
            hospitalId,
            doctorId
        });
    }

    // =====================================================
    // FORGOT PASSWORD
    // =====================================================

    [HttpPost("forgot-password")]
    public async Task<IActionResult>
        ForgotPassword(
            ForgotPasswordDto dto)
    {
        var result =
            await _authService
                .ForgotPasswordAsync(
                    dto.Email
                );

        return Ok(new
        {
            message =
                result
        });
    }

    // =====================================================
    // VERIFY OTP
    // =====================================================

    [HttpPost("verify-otp")]
    public async Task<IActionResult>
        VerifyOtp(
            [FromBody]
            string otp)
    {
        var token =
            await _authService
                .VerifyOtpAsync(otp);

        if (token == null)
        {
            return BadRequest(new
            {
                message =
                    "Invalid or expired OTP"
            });
        }

        return Ok(new
        {
            message =
                "OTP verified",

            resetToken =
                token
        });
    }

    // =====================================================
    // RESET PASSWORD
    // =====================================================

    [HttpPost("reset-password")]
    public async Task<IActionResult>
        ResetPassword(
            ResetPasswordDto dto)
    {
        var result =
            await _authService
                .ResetPasswordAsync(
                    dto.Token,
                    dto.NewPassword
                );

        return Ok(new
        {
            message =
                result
        });
    }

    // =====================================================
    // CHANGE PASSWORD
    // =====================================================

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult>
        ChangePassword(
            ChangePasswordDto dto)
    {
        var userIdClaim =
            User.FindFirst(
                ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
        {
            return Unauthorized(new
            {
                message = "Invalid token"
            });
        }

        int userId =
            int.Parse(
                userIdClaim.Value);

        var result =
            await _authService
                .ChangePasswordAsync(
                    userId,
                    dto);

        if (result !=
            "Password changed successfully")
        {
            return BadRequest(new
            {
                message = result
            });
        }

        return Ok(new
        {
            message = result
        });
    }
}