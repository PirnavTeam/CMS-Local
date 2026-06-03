import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import DoctorApp from "./doctors/DoctorApp";
import ReceptionistApp from "./Recepitionist/ReceptionistApp";
import UserProfilePage from "./profile/UserProfilePage";

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


function App() {
  return (
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







        </Route>

        {/* ── SEPARATE DOCTOR DASHBOARD ── */}
        <Route path="/doctor/*" element={<DoctorApp />} />
        <Route path="/reception/*" element={<ReceptionistApp />} />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
