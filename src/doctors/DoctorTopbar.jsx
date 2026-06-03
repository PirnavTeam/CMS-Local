import React from "react";
import { Bell, Calendar, Menu, Search } from "lucide-react";
import UserProfileMenu from "../profile/UserProfileMenu";
import "./DoctorTopbar.css";

function DoctorTopbar({ title, onMenuToggle }) {
  return (
    <header className="dr-topbar">
      <div className="dr-topbar-left">
        <button
          className="dr-topbar-icon-btn"
          type="button"
          onClick={onMenuToggle}
          title="Toggle menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="dr-topbar-title">{title}</h1>
      </div>

      <div className="dr-topbar-search">
        <Search size={15} className="dr-search-icon" />
        <input
          className="dr-search-input"
          placeholder="Search patient by name, ID or phone..."
          readOnly
        />
        <kbd className="dr-search-kbd">Ctrl + K</kbd>
      </div>

      <div className="dr-topbar-right">
        <button className="dr-topbar-icon-btn dr-notif-btn" type="button" title="Notifications">
          <Bell size={18} />
          <span className="dr-notif-badge">1</span>
        </button>

        <button className="dr-topbar-icon-btn" type="button" title="Calendar">
          <Calendar size={18} />
        </button>

        <UserProfileMenu roleType="doctor" />
      </div>
    </header>
  );
}

export default DoctorTopbar;
