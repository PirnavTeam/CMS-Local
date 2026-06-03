import React, { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import Topbar from "../Topbar/Topbar";
import "./AppLayout.css";

const useAuth = () => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("doctorToken") ||
    localStorage.getItem("receptionistToken");

  const role =
    localStorage.getItem("adminRole") ||
    localStorage.getItem("receptionistRole") ||
    localStorage.getItem("userRole") ||
    "";

  const isDoctor =
    String(role).toLowerCase() === "doctor" ||
    Boolean(localStorage.getItem("doctorToken"));

  const isReceptionist =
    String(role).toLowerCase() === "receptionist" ||
    Boolean(localStorage.getItem("receptionistToken"));

  return {
    user: token
      ? { name: "Admin", isDoctor, isReceptionist }
      : null,
  };
};

function AppLayout() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (user.isDoctor) return <Navigate to="/doctor/dashboard" replace />;
  if (user.isReceptionist) return <Navigate to="/reception/dashboard" replace />;

  return (
    <div className="layout">
      <Sidebar open={open} onClose={() => setOpen(false)} />

      <div className="main">
        <Topbar onMenu={() => setOpen(true)} />

        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AppLayout;
