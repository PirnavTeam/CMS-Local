import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import ReceptionSidebar from "./ReceptionSidebar";
import ReceptionTopbar from "./ReceptionTopbar";
import { isReceptionistSession } from "./receptionSession";
import "./Receptionist.css";

const TITLES = {
  "/reception/dashboard": "Reception Dashboard",
  "/reception/patients": "Patients",
  "/reception/appointments": "Appointment Booking",
  "/reception/billing": "Billing",
};

function ReceptionistLayout() {
  const location = useLocation();

  if (!isReceptionistSession()) {
    return <Navigate to="/login" replace />;
  }

  const title =
    Object.entries(TITLES).find(([path]) => location.pathname.startsWith(path))?.[1] ||
    "Reception Dashboard";

  return (
    <div className="rc-shell">
      <ReceptionSidebar />
      <div className="rc-main">
        <ReceptionTopbar title={title} />
        <main className="rc-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default ReceptionistLayout;

