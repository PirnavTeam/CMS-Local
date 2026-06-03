import React from "react";
import { Bell, ChevronRight, Search } from "lucide-react";
import { useLocation } from "react-router-dom";
import UserProfileMenu from "../profile/UserProfileMenu";

function ReceptionTopbar({ title }) {
  const location = useLocation();
  const crumbs = location.pathname
    .split("/")
    .filter(Boolean)
    .slice(1)
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1));
  return (
    <header className="rc-topbar">
      <div>
        <h1>{title}</h1>
        <div className="rc-crumbs">
          <span>Home</span>
          <ChevronRight size={13} />
          <span>Reception</span>
          {crumbs.length > 1 ? (
            <>
              <ChevronRight size={13} />
              <span>{crumbs[1]}</span>
            </>
          ) : null}
        </div>
      </div>

      <div className="rc-top-actions">
        <label className="rc-search">
          <Search size={18} />
          <input placeholder="Search patients, doctors, bills..." />
        </label>
        <button className="rc-bell" type="button" aria-label="Notifications">
          <Bell size={18} />
          <span>1</span>
        </button>
        <UserProfileMenu roleType="receptionist" />
      </div>
    </header>
  );
}

export default ReceptionTopbar;
