import React, { useEffect, useState } from "react";
import { Send } from "lucide-react";
import Header from "../../../components/superadmin/Header";
import NotificationPanel from "../../../components/superadmin/NotificationPanel";
import {
  createNotification,
  fetchNotificationTargetOptions,
  fetchNotifications,
} from "../superAdminApi";

const defaultTargetOptions = [
  { value: "All Active Users", label: "All Active Users" },
  { value: "Active Admins", label: "Active Admins" },
];

const emptyNotification = {
  title: "",
  targetUsers: "All Active Users",
  message: "",
};

function Notifications() {
  const [showForm, setShowForm] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [form, setForm] = useState(emptyNotification);
  const [loading, setLoading] = useState(true);
  const [targetOptions, setTargetOptions] = useState(defaultTargetOptions);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadNotifications = async () => {
    setLoading(true);
    setError("");

    try {
      setNotifications(await fetchNotifications());
    } catch (requestError) {
      setError(requestError.message || "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();

    const loadTargetOptions = async () => {
      try {
        const options = await fetchNotificationTargetOptions();
        setTargetOptions(options.length ? options : defaultTargetOptions);
      } catch {
        setTargetOptions(defaultTargetOptions);
      }
    };

    loadTargetOptions();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      setError("Title and message are required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await createNotification({ ...form, status: "Sent" });
      setForm(emptyNotification);
      setShowForm(false);
      await loadNotifications();
    } catch (requestError) {
      setError(requestError.message || "Unable to save notification.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header
        title="Notifications"
        subtitle="Create and send platform notifications."
        action={
          <button className="sa-btn sa-btn-primary" onClick={() => setShowForm((value) => !value)}>
            <Send size={16} />
            Send Notification
          </button>
        }
      />

      {showForm ? (
        <div className="sa-form-card" style={{ marginBottom: 16 }}>
          {error ? <div className="sa-state sa-state--error">{error}</div> : null}
          <div className="sa-form-grid">
            <div className="sa-form-field">
              <label>Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Notification title"
                required
              />
            </div>
            <div className="sa-form-field">
              <label>Target Users</label>
              <select name="targetUsers" value={form.targetUsers} onChange={handleChange}>
                {targetOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.count !== undefined
                      ? `${option.label} (${option.count})`
                      : option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sa-form-field sa-form-field-full">
              <label>Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Write the notification message"
                required
              />
            </div>
          </div>
          <div className="sa-page-actions" style={{ marginTop: 14 }}>
            <button className="sa-btn sa-btn-primary" type="button" disabled={saving} onClick={handleSubmit}>
              {saving ? "Sending..." : "Send Now"}
            </button>
          </div>
        </div>
      ) : null}

      <div className="sa-panel">
        <h3>Notification List</h3>
        <p>Recent messages and delivery status.</p>
        {loading ? <div className="sa-state">Loading notifications...</div> : null}
        {!loading && error && !showForm ? <div className="sa-state sa-state--error">{error}</div> : null}
        {!loading && !error ? <NotificationPanel items={notifications} /> : null}
      </div>
    </>
  );
}

export default Notifications;
