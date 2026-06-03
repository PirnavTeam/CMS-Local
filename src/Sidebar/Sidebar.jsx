// import React from "react";
// import { NavLink } from "react-router-dom";
// import {
//   LayoutDashboard,
//   Stethoscope,
//   Users,
//   UserRound,
//   CalendarDays,
//   Settings2,
//   FileBarChart2,
//   HeartPulse,
// } from "lucide-react";

// import "./Sidebar.css";

// const items = [
//   { to: "/", label: "Dashboard", icon: LayoutDashboard },
//   { to: "/doctors", label: "Doctors", icon: Stethoscope },
//   { to: "/staff", label: "Staff", icon: Users },
//   { to: "/patients", label: "Patients", icon: UserRound },
//   { to: "/appointments", label: "Appointments", icon: CalendarDays },
//   { to: "/doctors/schedule", label: "Schedule Settings", icon: Settings2 },
//   { to: "/reports", label: "Reports", icon: FileBarChart2 },
// ];

// function Sidebar({ open, onClose }) {
//   return (
//     <>
//       <div className={`overlay ${open ? "show" : ""}`} onClick={onClose} />

//       <aside className={`sidebar ${open ? "open" : ""}`}>

//         {/* HEADER */}
//         <div className="sidebar-header">
//           <div className="logo-icon">
//             <HeartPulse size={18} />
//           </div>
//           <div>
//             <h3>MediCore</h3>
//             <span>Admin Console</span>
//           </div>
//         </div>

//         {/* NAV */}
//         <nav className="nav">
//           <p className="menu-title">MAIN MENU</p>

//           {items.map(({ to, label, icon: Icon }) => (
//             <NavLink
//               key={to}
//               to={to}
//               onClick={onClose}
//               className={({ isActive }) =>
//                 `nav-item ${isActive ? "active" : ""}`
//               }
//             >
//               <Icon size={18} />
//               <span>{label}</span>
//             </NavLink>
//           ))}
//         </nav>

//         {/* FOOTER */}
//         <div className="sidebar-footer">
//           <p>System Status</p>
//           <span>All services operational</span>
//         </div>

//       </aside>
//     </>
//   );
// }

// export default Sidebar;




import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  UserRound,
  UserCheck,
  CalendarDays,
  Settings2,
  FileBarChart2,
  HeartPulse,
} from "lucide-react";

import "./Sidebar.css";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/doctors", label: "Doctors", icon: Stethoscope },
  { to: "/staff", label: "Staff", icon: Users },
  { to: "/receptionists", label: "Receptionists", icon: UserCheck },
  { to: "/patients", label: "Patients", icon: UserRound },
  { to: "/appointments", label: "Appointments", icon: CalendarDays },
  { to: "/DoctorSchedule/schedule", label: "Schedule Settings", icon: Settings2 },
  { to: "/reports", label: "Reports", icon: FileBarChart2 },
];

function Sidebar() {
  return (
    <aside className="sidebar">

      {/* HEADER */}
      <div className="sidebar-header">
        <div className="logo">
          <HeartPulse size={18} />
        </div>
        <div>
          <h3>MediCore</h3>
          <span>Admin Console</span>
        </div>
      </div>

      {/* NAV */}
      <div className="nav">
        <p className="menu-title">MAIN MENU</p>

        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>

      {/* FOOTER */}
      {/* <div className="status-card">
        <div className="pulse"></div>
        <div>
          <b>System Status</b>
          <p>All services operational</p>
        </div>
      </div> */}

    </aside>
  );
}

export default Sidebar;
