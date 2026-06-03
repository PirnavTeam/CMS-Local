// import React, { useState } from "react";
// import { Bell, Menu, Search, ChevronDown } from "lucide-react";
// import "./Topbar.css";

// function Topbar({ onMenu }) {
//   const [open, setOpen] = useState(false);

//   return (
//     <header className="topbar">

//       {/* LEFT */}
//       <div className="topbar-left">
//         <button className="topbar-menu-btn" onClick={onMenu}>
//           <Menu size={20} />
//         </button>

//         <div className="topbar-search-box">
//           <Search size={16} className="topbar-search-icon" />
//           <input
//             type="text"
//             placeholder="Search patients, doctors, appointments..."
//           />
//         </div>
//       </div>

//       {/* RIGHT */}
//       <div className="topbar-right">

//         {/* Notification */}
//         <div className="topbar-notification">
//           <Bell size={18} />
//           <span className="topbar-dot"></span>
//         </div>

//         {/* Profile */}
//         <div className="topbar-profile" onClick={() => setOpen(!open)}>
//           <div className="topbar-avatar">A</div>

//           <div className="topbar-user-info">
//             <p>Admin</p>
//             <span>Administrator</span>
//           </div>

//           <ChevronDown size={14} />

//           {open && (
//             <div className="topbar-dropdown">
//               <div className="topbar-dropdown-header">
//                 <p className="topbar-name">Admin</p>
//                 <span className="topbar-email">admin@medicore.io</span>
//               </div>

//               <div className="topbar-dropdown-item topbar-logout">
//                 Sign out
//               </div>
//             </div>
//           )}
//         </div>

//       </div>
//     </header>
//   );
// }

// export default Topbar;



import React from "react";

import {
  Bell,
  Menu,
  Search,
} from "lucide-react";

import "./Topbar.css";
import UserProfileMenu from "../profile/UserProfileMenu";

function Topbar({ onMenu }) {
  return (

    <header className="topbar">

      {/* LEFT */}

      <div className="topbar-left">

        <button
          className="topbar-menu-btn"
          onClick={onMenu}
        >
          <Menu size={20} />
        </button>

        <div className="topbar-search-box">

          <Search
            size={16}
            className="topbar-search-icon"
          />

          <input
            type="text"
            placeholder="Search patients, doctors, appointments..."
          />

        </div>

      </div>

      {/* RIGHT */}

      <div className="topbar-right">

        {/* NOTIFICATION */}

        <div className="topbar-notification">

          <Bell size={18} />

          <span className="topbar-dot"></span>

        </div>

        {/* PROFILE */}

        <UserProfileMenu roleType="admin" />

      </div>

    </header>
  );
}

export default Topbar;
