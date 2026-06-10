import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import DoctorApp from "./doctors/DoctorApp";
import ReceptionistApp from "./Recepitionist/ReceptionistApp";
import UserProfilePage from "./profile/UserProfilePage";
import SuperAdminDashboard from "./pages/SUPERADMIN/Dashboard/Dashboard";
import SuperAdminClinics from "./pages/SUPERADMIN/Clinics/Clinics";
import SuperAdminClinicForm from "./pages/SUPERADMIN/Clinics/ClinicForm";
import SuperAdminAdmins from "./pages/SUPERADMIN/Admins/Admins";
import SuperAdminUsers from "./pages/SUPERADMIN/Users/Users";
import SuperAdminRolesPermissions from "./pages/SUPERADMIN/RolesPermissions/RolesPermissions";
import SuperAdminSettings from "./pages/SUPERADMIN/Settings/Settings";
import SuperAdminReports from "./pages/SUPERADMIN/Reports/Reports";
import SuperAdminAuditLogs from "./pages/SUPERADMIN/AuditLogs/AuditLogs";
import SuperAdminNotifications from "./pages/SUPERADMIN/Notifications/Notifications";

// Pages
import AdminLogin from "./Login/Adminlogin";
import ForgotPassword from "./Login/Forgotpassword";
import VerifyOTP from "./Login/Verifyopt";
import ResetPassword from "./Login/Resertpassword";
import Dashboard from "./Dashboard/Dashboard";
import Staff from "./pages/Staff/Staff";
import Receptionists from "./pages/RECEPTIONISTS/Receptionists";
import Doctors from "./pages/DOCTORS/Doctors";
import AddDoctor from "./pages/DOCTORS/AddDoctor";
import RegisterDoctor from "./pages/DOCTORS/RegisterDoctor";
import DoctorSchedule from "./pages/DOCTORS/DoctorSchedule";
import Patients from "./pages/PATIENTS/Patients";
import PatientDetails from "./pages/PATIENTS/PatientDetails";

// Optional
import Appointments from "./pages/APPOINTMENTS/Appointments";
import NewAppointment from "./pages/APPOINTMENTS/NewAppointment";
import Doctorschedulepage from "./pages/Schedule/docschedule";
import Reports from "./pages/REPORTS/Reports";
import DailyReport from "./pages/REPORTS/DailyReport";
import RevenueReport from "./pages/REPORTS/RevenueReport";
import DoctorWiseReport from "./pages/REPORTS/DoctorWiseReport";
import "./pages/SUPERADMIN/SuperAdmin.css";
import { ToastProvider } from "./components/ToastProvider";


function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>

        {/* DEFAULT */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* LOGIN */}
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/VerifyOTP" element={<VerifyOTP />} />
        <Route path="/ResetPassword" element={<ResetPassword />} />




        {/* MAIN LAYOUT */}
        <Route element={<AppLayout />}>

          {/* Dashboard */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<UserProfilePage roleType="admin" />} />

          {/* MODULES */}
          <Route path="doctors" element={<Doctors />} />
          <Route path="doctors/add" element={<AddDoctor />} />
          <Route path="doctors/register" element={<RegisterDoctor />} />
          <Route path="doctors/schedule" element={<DoctorSchedule />} />
          <Route path="DoctorSchedule/schedule" element={<Doctorschedulepage />} />
          <Route path="staff" element={<Staff />} />
          <Route path="receptionists" element={<Receptionists />} />

          {/* ✅ PATIENTS */}
          <Route path="patients" element={<Patients />} />
          <Route path="patients/:id" element={<PatientDetails />} /> {/* ✅ IMPORTANT */}

          <Route path="appointments" element={<Appointments />} />
          <Route path="appointments/new" element={<NewAppointment />} />

          <Route path="reports" element={<Reports />} />
          <Route path="reports/daily" element={<DailyReport />} />
          <Route path="RevenueReport/daily" element={<RevenueReport />} />
          <Route path="DoctorWiseReport/daily" element={<DoctorWiseReport />} />

          <Route path="superadmin" element={<Navigate to="/superadmin/dashboard" replace />} />
          <Route path="superadmin/dashboard" element={<SuperAdminDashboard />} />
          <Route path="superadmin/clinics" element={<SuperAdminClinics />} />
          <Route path="superadmin/clinics/add" element={<SuperAdminClinicForm mode="add" />} />
          <Route path="superadmin/clinics/edit/:id" element={<SuperAdminClinicForm mode="edit" />} />
          <Route path="superadmin/admins" element={<SuperAdminAdmins />} />
          <Route path="superadmin/users" element={<SuperAdminUsers />} />
          <Route path="superadmin/roles" element={<SuperAdminRolesPermissions />} />
          <Route path="superadmin/settings" element={<SuperAdminSettings />} />
          <Route path="superadmin/reports" element={<SuperAdminReports />} />
          <Route path="superadmin/audit-logs" element={<SuperAdminAuditLogs />} />
          <Route path="superadmin/notifications" element={<SuperAdminNotifications />} />







        </Route>

        {/* ── SEPARATE DOCTOR DASHBOARD ── */}
        <Route path="/doctor/*" element={<DoctorApp />} />
        <Route path="/reception/*" element={<ReceptionistApp />} />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
