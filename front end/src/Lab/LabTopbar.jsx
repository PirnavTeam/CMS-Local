import React from "react";
import { ChevronRight, Menu, Search } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import NotificationPopup from "../components/NotificationPopup";
import UserProfileMenu from "../profile/UserProfileMenu";

function LabTopbar({ title, onMenu }) {
  const location = useLocation();
  const navigate = useNavigate();
  const crumbs = location.pathname.split("/").filter(Boolean).slice(1);
  const searchValue = new URLSearchParams(location.search).get("q") || "";
  const searchablePaths = ["/lab/patients", "/lab/diagnosis-tests", "/lab/sample-collection", "/lab/reports"];

  const updateSearch = (value) => {
    const targetPath = searchablePaths.some((path) => location.pathname.startsWith(path))
      ? location.pathname
      : "/lab/patients";
    const params = new URLSearchParams(targetPath === location.pathname ? location.search : "");
    if (value.trim()) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    const query = params.toString();
    navigate(`${targetPath}${query ? `?${query}` : ""}`, { replace: true });
  };

  return (
    <header className="rc-topbar lab-topbar">
      <div className="rc-topbar-left">
        <button type="button" className="rc-topbar-menu" onClick={onMenu}>
          <Menu size={20} />
        </button>
        <div>
          <h1>{title}</h1>
          <div className="rc-crumbs">
            <span>Home</span>
            <ChevronRight size={13} />
            <span>Lab</span>
            {crumbs[0] ? <><ChevronRight size={13} /><span>{crumbs[0]}</span></> : null}
          </div>
        </div>
      </div>
      <div className="rc-top-actions">
        <label className="rc-search">
          <Search size={18} />
          <input
            value={searchValue}
            onChange={(event) => updateSearch(event.target.value)}
            placeholder="Search patients, tests, samples..."
          />
        </label>
        <NotificationPopup />
        <UserProfileMenu roleType="lab" />
      </div>
    </header>
  );
}

export default LabTopbar;
