import React from "react";
import { NavLink } from "react-router-dom";
import {
  CalendarPlus,
  ClipboardList,
  FileText,
  Gauge,
  Stethoscope,
  UserPlus,
} from "lucide-react";

const items = [
  { to: "/reception/dashboard", label: "Reception Dashboard", icon: Gauge },
  { to: "/reception/patients", label: "Patients", icon: UserPlus },
  { to: "/reception/appointments", label: "Book Appointment", icon: CalendarPlus },
  { to: "/reception/billing", label: "Billing", icon: ClipboardList },
];

function ReceptionSidebar() {
  return (
    <aside className="rc-sidebar">
      <div className="rc-brand">
        <div className="rc-brand-icon">
          <Stethoscope size={22} />
        </div>
        <div>
          <strong>Medisuite</strong>
          <span>Reception Console</span>
        </div>
      </div>

      <div className="rc-section-label">Front Desk</div>

      <nav className="rc-nav">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `rc-nav-link${isActive ? " active" : ""}`}
            >
              <Icon size={17} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="rc-help">
        <strong>Need help?</strong>
        <p>Book appointments, register patients, and manage billing.</p>
        <button type="button">
          <FileText size={14} />
          View docs
        </button>
      </div>
    </aside>
  );
}

export default ReceptionSidebar;

