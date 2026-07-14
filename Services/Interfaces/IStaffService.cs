using AuthDemo.DTOs;

namespace AuthDemo.Services.Interfaces;

public interface IStaffService
{
    // =====================================================
    // GET ALL STAFF
    // =====================================================

    Task<List<StaffResponseDto>>
        GetAllAsync(
            int hospitalId
        );

    // =====================================================
    // CREATE STAFF
    // =====================================================

    Task<StaffResponseDto>
        CreateAsync(
            CreateStaffDto dto,
            string rootPath,
            int hospitalId
        );

    // =====================================================
    // UPDATE STAFF
    // =====================================================

    Task<bool>
        UpdateAsync(
            int id,
            CreateStaffDto dto,
            string rootPath,
            int hospitalId
        );

    // =====================================================
    // TOGGLE STAFF STATUS
    // =====================================================

    Task<bool>
        ToggleStatusAsync(
            int id,
            int hospitalId
        );

    // =====================================================
    // DELETE STAFF
    // =====================================================

    Task<bool>
        DeleteAsync(
            int id,
            int hospitalId
        );
}