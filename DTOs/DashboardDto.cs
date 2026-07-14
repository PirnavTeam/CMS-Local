namespace AuthDemo.DTOs;

// =====================================================
// MAIN DASHBOARD DTO
// =====================================================

public class DashboardDto
{
    public int TotalDoctors { get; set; }

    public int TotalPatients { get; set; }

    public int TodayAppointments { get; set; }

    public decimal Revenue { get; set; }

    public List<ChartDto> GrowthChart { get; set; }

    public List<RevenueTrendDto> RevenueTrend { get; set; }

    public ClinicStatusDto ClinicStatus { get; set; }

    public List<ActivityDto> RecentActivities { get; set; }
}

// =====================================================
// USER GROWTH CHART
// =====================================================

public class ChartDto
{
    public string Month { get; set; }

    public int Patients { get; set; }

    public int Appointments { get; set; }
}

// =====================================================
// REVENUE TREND
// =====================================================

public class RevenueTrendDto
{
    public string Month { get; set; }

    public decimal Revenue { get; set; }
}

// =====================================================
// CLINIC STATUS
// =====================================================

public class ClinicStatusDto
{
    public int Available { get; set; }

    public int Busy { get; set; }

    public int OnLeave { get; set; }
}

// =====================================================
// RECENT ACTIVITY
// =====================================================

public class ActivityDto
{
    public string Title { get; set; }

    public string Time { get; set; }
}