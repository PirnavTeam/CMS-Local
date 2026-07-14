

//using System.Text;

//using Microsoft.AspNetCore.Authentication.JwtBearer;

//using Microsoft.EntityFrameworkCore;

//using Microsoft.IdentityModel.Tokens;

//using AuthDemo.Data;
//using AuthDemo.Helpers;
//using AuthDemo.Services;
//using AuthDemo.Services.Interfaces;

//var builder = WebApplication.CreateBuilder(args);

//// =====================================================
//// DATABASE
//// =====================================================

//builder.Services.AddDbContext<AppDbContext>(options =>
//    options.UseSqlServer(
//        builder.Configuration
//            .GetConnectionString(
//                "DefaultConnection"
//            )
//    )
//);

//// =====================================================
//// SERVICES
//// =====================================================

//builder.Services.AddScoped<EmailHelper>();

//builder.Services.AddScoped<JwtHelper>();

//builder.Services.AddScoped<IAuthService,
//    AuthService>();

//builder.Services.AddScoped<IStaffService,
//    StaffService>();

//builder.Services.AddScoped<IAppointmentService,
//    AppointmentService>();

//// =====================================================
//// CORS
//// =====================================================

//builder.Services.AddCors(options =>
//{
//    options.AddPolicy(
//        "AllowLocalhost",
//        policy =>
//        {
//            policy

//                .AllowAnyOrigin()

//                .AllowAnyHeader()

//                .AllowAnyMethod();
//        });
//});

//// =====================================================
//// CONTROLLERS
//// =====================================================

//builder.Services.AddControllers();

//builder.Services.AddEndpointsApiExplorer();

//// =====================================================
//// SWAGGER + JWT
//// =====================================================

//builder.Services.AddSwaggerGen(options =>
//{
//    options.SwaggerDoc(
//        "v1",
//        new()
//        {
//            Title = "Clinic API",
//            Version = "v1"
//        });

//    options.AddSecurityDefinition(
//        "Bearer",
//        new Microsoft.OpenApi.Models
//            .OpenApiSecurityScheme
//        {
//            Name = "Authorization",

//            Type =
//                Microsoft.OpenApi.Models
//                    .SecuritySchemeType.Http,

//            Scheme = "bearer",

//            BearerFormat = "JWT",

//            In = Microsoft.OpenApi.Models
//                .ParameterLocation.Header,

//            Description =
//                "Enter JWT Token"
//        });

//    options.AddSecurityRequirement(
//        new Microsoft.OpenApi.Models
//            .OpenApiSecurityRequirement
//        {
//            {
//                new Microsoft.OpenApi.Models
//                    .OpenApiSecurityScheme
//                {
//                    Reference =
//                        new Microsoft.OpenApi.Models
//                            .OpenApiReference
//                        {
//                            Type =
//                                Microsoft.OpenApi.Models
//                                    .ReferenceType
//                                        .SecurityScheme,

//                            Id = "Bearer"
//                        }
//                },

//                Array.Empty<string>()
//            }
//        });
//});

//// =====================================================
//// JWT AUTH
//// =====================================================

//var jwtKey =
//    builder.Configuration["Jwt:Key"];

//var key =
//    Encoding.UTF8.GetBytes(jwtKey);

//builder.Services

//    .AddAuthentication(
//        JwtBearerDefaults
//            .AuthenticationScheme)

//    .AddJwtBearer(options =>
//    {
//        options.TokenValidationParameters =
//            new TokenValidationParameters
//            {
//                ValidateIssuer = false,

//                ValidateAudience = false,

//                ValidateIssuerSigningKey = true,

//                IssuerSigningKey =
//                    new SymmetricSecurityKey(
//                        key
//                    ),

//                ValidateLifetime = true,

//                ClockSkew =
//                    TimeSpan.Zero
//            };
//    });

//// =====================================================
//// BUILD APP
//// =====================================================

//var app = builder.Build();

//// =====================================================
//// SWAGGER
//// =====================================================

//app.UseSwagger();

//app.UseSwaggerUI();

//// =====================================================
//// HTTPS
//// =====================================================

//app.UseHttpsRedirection();

//// =====================================================
//// STATIC FILES
//// =====================================================

//app.UseStaticFiles();

//// =====================================================
//// CORS
//// =====================================================

//app.UseCors("AllowLocalhost");

//// =====================================================
//// AUTH
//// =====================================================

//app.UseAuthentication();

//app.UseAuthorization();

//// =====================================================
//// MAP CONTROLLERS
//// =====================================================

//app.MapControllers();

//// =====================================================
//// RUN
//// =====================================================

//app.Run();





using AuthDemo.Data;
using AuthDemo.Helpers;
using AuthDemo.Models;
using AuthDemo.Services;
using AuthDemo.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// =====================================================
// DATABASE
// =====================================================

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration
            .GetConnectionString(
                "DefaultConnection"
            )
    )
);

// =====================================================
// SERVICES
// =====================================================

builder.Services.AddScoped<EmailHelper>();

builder.Services.AddScoped<JwtHelper>();

builder.Services.AddScoped<IAuthService,
    AuthService>();

builder.Services.AddScoped<IStaffService,
    StaffService>();

builder.Services.AddScoped<IAppointmentService,
    AppointmentService>();
builder.Services
    .AddScoped<NotificationService>();

// =====================================================
// CORS
// =====================================================

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AllowLocalhost",
        policy =>
        {
            policy

                .AllowAnyOrigin()

                .AllowAnyHeader()

                .AllowAnyMethod();
        });
});

// =====================================================
// CONTROLLERS
// =====================================================

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();

// =====================================================
// SWAGGER + JWT
// =====================================================

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc(
        "v1",
        new()
        {
            Title = "Clinic API",
            Version = "v1"
        });

    options.AddSecurityDefinition(
        "Bearer",
        new Microsoft.OpenApi.Models
            .OpenApiSecurityScheme
        {
            Name = "Authorization",

            Type =
                Microsoft.OpenApi.Models
                    .SecuritySchemeType.Http,

            Scheme = "bearer",

            BearerFormat = "JWT",

            In = Microsoft.OpenApi.Models
                .ParameterLocation.Header,

            Description =
                "Enter JWT Token"
        });

    options.AddSecurityRequirement(
        new Microsoft.OpenApi.Models
            .OpenApiSecurityRequirement
        {
            {
                new Microsoft.OpenApi.Models
                    .OpenApiSecurityScheme
                {
                    Reference =
                        new Microsoft.OpenApi.Models
                            .OpenApiReference
                        {
                            Type =
                                Microsoft.OpenApi.Models
                                    .ReferenceType
                                        .SecurityScheme,

                            Id = "Bearer"
                        }
                },

                Array.Empty<string>()
            }
        });
});

// =====================================================
// JWT AUTH
// =====================================================

var jwtKey =
    builder.Configuration["Jwt:Key"];

var key =
    Encoding.UTF8.GetBytes(jwtKey);

builder.Services

    .AddAuthentication(
        JwtBearerDefaults
            .AuthenticationScheme)

    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = false,

                ValidateAudience = false,

                ValidateIssuerSigningKey = true,

                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        key
                    ),

                ValidateLifetime = true,

                ClockSkew =
                    TimeSpan.Zero
            };
    });

    

// =====================================================
// BUILD APP
// =====================================================

var app = builder.Build();


// =====================================================
// DEFAULT SUPERADMIN SEED - USERS TABLE ONLY
// SuperAdmin uses the same /api/Auth/login as Admin.
// =====================================================
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    context.Database.Migrate();

    var platformHospital = await context.Hospitals
        .FirstOrDefaultAsync(x => x.Email == "platform@cms.local");

    if (platformHospital == null)
    {
        platformHospital = new Hospital
        {
            Name = "CMS Platform",
            Email = "platform@cms.local",
            Phone = "0000000000",
            Address = "Platform",
            IsActive = true
        };

        context.Hospitals.Add(platformHospital);
        await context.SaveChangesAsync();
    }

    var superAdmin = await context.Users
        .FirstOrDefaultAsync(x => x.Email == "superadmin@gmail.com");

    if (superAdmin == null)
    {
        context.Users.Add(new User
        {
            Name = "Super Admin",
            MobileNumber = "0000000000",
            Email = "superadmin@gmail.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Super@123"),
            Role = "SuperAdmin",
            HospitalId = platformHospital.Id,
            IsActive = true,
            MustChangePassword = false
        });

        await context.SaveChangesAsync();
    }
    else
    {
        superAdmin.Name = "Super Admin";
        superAdmin.MobileNumber = string.IsNullOrWhiteSpace(superAdmin.MobileNumber)
            ? "0000000000"
            : superAdmin.MobileNumber;
        superAdmin.Role = "SuperAdmin";
        superAdmin.HospitalId = platformHospital.Id;
        superAdmin.IsActive = true;
        superAdmin.MustChangePassword = false;

        if (string.IsNullOrWhiteSpace(superAdmin.PasswordHash) ||
            !BCrypt.Net.BCrypt.Verify("Super@123", superAdmin.PasswordHash))
        {
            superAdmin.PasswordHash = BCrypt.Net.BCrypt.HashPassword("Super@123");
        }

        await context.SaveChangesAsync();
    }
}

// =====================================================
// SWAGGER
// =====================================================

app.UseSwagger();

app.UseSwaggerUI();

// =====================================================
// HTTPS
// =====================================================

app.UseHttpsRedirection();

// =====================================================
// STATIC FILES
// =====================================================

app.UseStaticFiles();

// =====================================================
// CORS
// =====================================================

app.UseCors("AllowLocalhost");

// =====================================================
// AUTH
// =====================================================

app.UseAuthentication();

app.UseAuthorization();

// =====================================================
// MAP CONTROLLERS
// =====================================================

app.MapControllers();

// =====================================================
// RUN
// =====================================================

app.Run();