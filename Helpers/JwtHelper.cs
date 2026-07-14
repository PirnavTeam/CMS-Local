using AuthDemo.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace AuthDemo.Helpers;

public class JwtHelper
{
    private readonly IConfiguration _config;

    public JwtHelper(IConfiguration config)
    {
        _config = config;
    }

    // =====================================================
    // USER TOKEN
    // =====================================================

    public string GenerateToken(User user)
    {
        var key =
            new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    _config["Jwt:Key"]!
                ));

        var creds =
            new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256);

        var claims =
            new List<Claim>
            {
                new Claim(
                    ClaimTypes.NameIdentifier,
                    user.Id.ToString()),

                new Claim(
                    ClaimTypes.Name,
                    user.Name),

                new Claim(
                    "email",
                    user.Email),

                new Claim(
                    "userId",
                    user.Id.ToString()),

                new Claim(
                    ClaimTypes.Role,
                    user.Role),

                new Claim(
                    "role",
                    user.Role),

                new Claim(
                    "HospitalId",
                    user.HospitalId.ToString())
            };

        if (user.DoctorId != null)
        {
            claims.Add(
                new Claim(
                    "DoctorId",
                    user.DoctorId.ToString()!));
        }

        var token =
            new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddHours(12),
                signingCredentials: creds);

        return new JwtSecurityTokenHandler()
            .WriteToken(token);
    }

    // =====================================================
    // SUPER ADMIN TOKEN
    // =====================================================

    public string GenerateSuperAdminToken(
        SuperAdmin superAdmin)
    {
        var key =
            new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    _config["Jwt:Key"]!
                ));

        var creds =
            new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256);

        var claims =
            new List<Claim>
            {
                new Claim(
                    ClaimTypes.NameIdentifier,
                    superAdmin.Id.ToString()),

                new Claim(
                    ClaimTypes.Name,
                    superAdmin.Name),

                new Claim(
                    ClaimTypes.Email,
                    superAdmin.Email),

                new Claim(
                    ClaimTypes.Role,
                    "SuperAdmin")
            };

        var token =
            new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddHours(12),
                signingCredentials: creds);

        return new JwtSecurityTokenHandler()
            .WriteToken(token);
    }
}