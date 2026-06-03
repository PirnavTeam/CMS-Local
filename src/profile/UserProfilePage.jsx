import React, { useEffect, useMemo, useState } from "react";
import { KeyRound, LogOut, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiUrl } from "../config/api";
import { clearAllSessions, getInitials, getRoleProfile } from "./sessionProfile";
import "./UserProfile.css";

function UserProfilePage({ roleType = "admin" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const profile = useMemo(() => getRoleProfile(roleType), [roleType]);
  const [activeTab, setActiveTab] = useState("profile");
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setActiveTab(params.get("tab") === "password" ? "password" : "profile");
  }, [location.search]);

  const logout = () => {
    clearAllSessions();
    navigate("/login", { replace: true });
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setMessage("Please fill all password fields.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setMessage("New password and confirm password must match.");
      return;
    }

    setSaving(true);
    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("adminToken") ||
        localStorage.getItem("doctorToken") ||
        localStorage.getItem("receptionistToken");
      const response = await fetch(apiUrl("Auth/change-password"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          email: profile.email,
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
          confirmPassword: form.confirmPassword,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || `Request failed with status ${response.status}`);
      setMessage(data.message || "Password changed successfully.");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setMessage(error.message || "Unable to change password right now.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="profile-page">
      <div className="profile-hero">
        <div className="profile-hero-avatar">{getInitials(profile.name)}</div>
        <div>
          <h2>{profile.name}</h2>
          <p>{profile.email}</p>
        </div>
      </div>

      <div className="profile-layout">
        <aside className="profile-tabs">
          <button
            type="button"
            className={activeTab === "profile" ? "active" : ""}
            onClick={() => setActiveTab("profile")}
          >
            <UserRound size={18} /> My Profile
          </button>
          <button
            type="button"
            className={activeTab === "password" ? "active" : ""}
            onClick={() => setActiveTab("password")}
          >
            <KeyRound size={18} /> Change Password
          </button>
          <button type="button" className="danger" onClick={logout}>
            <LogOut size={18} /> Logout
          </button>
        </aside>

        <div className="profile-panel">
          {activeTab === "profile" ? (
            <>
              <h3>My Profile</h3>
              <div className="profile-info-grid">
                <div>
                  <Mail size={19} />
                  <span>Email</span>
                  <strong>{profile.email}</strong>
                </div>
                <div>
                  <ShieldCheck size={19} />
                  <span>Role</span>
                  <strong>{profile.roleLabel}</strong>
                </div>
                <div>
                  <UserRound size={19} />
                  <span>Name</span>
                  <strong>{profile.name}</strong>
                </div>
              </div>
            </>
          ) : (
            <form onSubmit={changePassword}>
              <h3>Change Password</h3>
              <label>
                <span>Current Password</span>
                <input
                  type="password"
                  value={form.currentPassword}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, currentPassword: event.target.value }))
                  }
                />
              </label>
              <label>
                <span>New Password</span>
                <input
                  type="password"
                  value={form.newPassword}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, newPassword: event.target.value }))
                  }
                />
              </label>
              <label>
                <span>Confirm Password</span>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
                  }
                />
              </label>
              {message ? <p className="profile-message">{message}</p> : null}
              <button type="submit" className="profile-save" disabled={saving}>
                {saving ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default UserProfilePage;

