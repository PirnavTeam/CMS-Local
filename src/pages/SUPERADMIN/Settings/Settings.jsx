import React, { useEffect, useState } from "react";
import Header from "../../../components/superadmin/Header";
import {
  fetchSettings,
  updateEmailSettings,
  updateGeneralSettings,
  updatePaymentSettings,
  updateSmsSettings,
} from "../superAdminApi";

const tabs = ["General Settings", "Email Settings", "SMS Settings", "Payment Settings"];

const sectionByTab = {
  "General Settings": "general",
  "Email Settings": "email",
  "SMS Settings": "sms",
  "Payment Settings": "payment",
};

const updateBySection = {
  general: updateGeneralSettings,
  email: updateEmailSettings,
  sms: updateSmsSettings,
  payment: updatePaymentSettings,
};

const defaultSettings = {
  general: {
    name: "MediCore Platform",
    status: "Enabled",
    notes: "Update general settings used across all clinics.",
  },
  email: {
    name: "",
    status: "Enabled",
    notes: "Update email settings used across all clinics.",
  },
  sms: {
    name: "",
    status: "Enabled",
    notes: "Update sms settings used across all clinics.",
  },
  payment: {
    name: "",
    status: "Enabled",
    notes: "Update payment settings used across all clinics.",
  },
};

function Settings() {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const activeSection = sectionByTab[activeTab];
  const activeSettings = settings[activeSection] || defaultSettings[activeSection];

  useEffect(() => {
    let active = true;

    const loadSettings = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await fetchSettings();
        if (active) {
          setSettings({
            general: { ...defaultSettings.general, ...data.general },
            email: { ...defaultSettings.email, ...data.email },
            sms: { ...defaultSettings.sms, ...data.sms },
            payment: { ...defaultSettings.payment, ...data.payment },
          });
        }
      } catch (requestError) {
        if (active) setError(requestError.message || "Unable to load settings.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadSettings();

    return () => {
      active = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSuccess("");
    setSettings((current) => ({
      ...current,
      [activeSection]: {
        ...current[activeSection],
        [name]: value,
      },
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await updateBySection[activeSection](activeSettings);
      setSuccess(`${activeTab} saved.`);
    } catch (requestError) {
      setError(requestError.message || "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="sa-state">Loading settings...</div>;
  }

  return (
    <>
      <Header title="System Settings" subtitle="Configure global platform preferences." />

      <form className="sa-panel" onSubmit={handleSave}>
        <div className="sa-tabs">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab}
              className={`sa-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab);
                setError("");
                setSuccess("");
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {error ? <div className="sa-state sa-state--error">{error}</div> : null}
        {success ? <div className="sa-state">{success}</div> : null}

        <div className="sa-form-grid">
          <div className="sa-form-field">
            <label>{activeTab.replace(" Settings", "")} Name</label>
            <input name="name" value={activeSettings.name || ""} onChange={handleChange} />
          </div>
          <div className="sa-form-field">
            <label>Status</label>
            <select name="status" value={activeSettings.status || "Enabled"} onChange={handleChange}>
              <option>Enabled</option>
              <option>Disabled</option>
            </select>
          </div>
          <div className="sa-form-field sa-form-field-full">
            <label>Configuration Notes</label>
            <textarea name="notes" value={activeSettings.notes || ""} onChange={handleChange} />
          </div>
        </div>

        <div className="sa-page-actions" style={{ marginTop: 14 }}>
          <button className="sa-btn sa-btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </>
  );
}

export default Settings;
