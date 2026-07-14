using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace AuthDemo.DTOs;

public class CreateStaffDto
{
    // =====================================================
    // BASIC DETAILS
    // =====================================================

    public string? Name
    { get; set; }

   
    public string Email { get; set; }
    
    public string Phone { get; set; }

    // =====================================================
    // STAFF ROLE
    // Receptionist
    // Nurse
    // LabTech
    // Accountant
    // =====================================================

    public string? Role
    { get; set; }

    // =====================================================
    // LOGIN PASSWORD
    // =====================================================

    public string? Password
    { get; set; }

    // =====================================================
    // ACTIVE STATUS
    // =====================================================

    public bool IsActive
    { get; set; }
        = true;

    // =====================================================
    // OPTIONAL IMAGE
    // =====================================================

    public IFormFile? Image
    { get; set; }
}