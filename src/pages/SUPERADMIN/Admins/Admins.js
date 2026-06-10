import React, { useEffect, useMemo, useState } from "react";
import { Eye, Plus } from "lucide-react";
import Header from "../../../components/superadmin/Header";
import DataTable from "../../../components/superadmin/DataTable";
import SearchFilter from "../../../components/superadmin/SearchFilter";
import { createClinicAdmin, fetchAdmins, fetchClinics } from "../superAdminApi";

const emptyAdmin = {
  fullName: "",
  email: "",
  phone: "",
  temporaryPassword: "",
  role: "Clinic Admin",
  assignedClinicId: "",
  sendWelcomeEmail: true,
};




function Admins() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [form, setForm] = useState(emptyAdmin);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadAdmins = async () => {
    setLoading(true);
    setError("");

    try {
      setAdmins(await fetchAdmins());
    } catch (requestError) {
      setError(requestError.message || "Unable to load admins.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  useEffect(() => {
    const loadClinics = async () => {
      try {
        setClinics(await fetchClinics());
      } catch {
        setClinics([]);
      }
    };

    loadClinics();
  }, []);

  const handleChange = (event) => {
    const { checked, name, type, value } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const handleCreateAdmin = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const selectedClinic = clinics.find((clinic) => String(clinic.id) === String(form.assignedClinicId));
      const clinicId = Number(form.assignedClinicId) || form.assignedClinicId;
      const adminName = form.fullName.trim();
      const adminEmail = form.email.trim();
      const adminMobileNumber = form.phone.trim();
      const clinicName = selectedClinic?.name || "";
      const temporaryPassword = form.temporaryPassword;
      await createClinicAdmin({
        AdminName: adminName,
        AdminEmail: adminEmail,
        AdminMobileNumber: adminMobileNumber,
        ClinicName: clinicName,
        AdminPassword: temporaryPassword,
        TemporaryPassword: temporaryPassword,
        Password: temporaryPassword,
        AdminRole: form.role,
        Role: form.role,
        fullName: adminName,
        name: adminName,
        email: adminEmail,
        phone: adminMobileNumber,
        phoneNumber: adminMobileNumber,
        temporaryPassword,
        password: temporaryPassword,
        role: form.role,
        clinicId,
        hospitalId: clinicId,
        assignedClinicId: clinicId,
        assignedClinic: selectedClinic?.name || "",
        sendWelcomeEmail: form.sendWelcomeEmail,
      });
      setForm(emptyAdmin);
      setShowForm(false);
      await loadAdmins();
    } catch (requestError) {
      setError(requestError.message || "Unable to create admin.");
    } finally {
      setSaving(false);
    }
  };

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return admins.filter((admin) => {
      const matchesSearch = [admin.name, admin.email, admin.assignedClinic, admin.role]
        .some((value) => String(value).toLowerCase().includes(query));
      const matchesStatus = status === "All" || admin.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [admins, search, status]);

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email", width: "minmax(170px, 1.2fr)" },
    { key: "assignedClinic", label: "Assigned Clinic" },
    { key: "role", label: "Role" },
    {
      key: "status",
      label: "Status",
      width: "minmax(90px, 0.6fr)",
      render: (admin) => (
        <span className={`sa-badge ${admin.status === "Active" ? "is-active" : "is-danger"}`}>
          {admin.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      width: "minmax(112px, 0.7fr)",
      render: (admin) => (
        <div className="sa-actions">
          <button className="sa-icon-btn" onClick={() => setSelectedAdmin(admin)} title="View admin">
            <Eye size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Header
        title="Admin Management"
        subtitle={`${rows.length} admins found`}
        action={
          <button
            className="sa-btn sa-btn-primary"
            onClick={() => {
              setSelectedAdmin(null);
              setShowForm((value) => !value);
            }}
          >
            <Plus size={16} />
            Create Admin
          </button>
        }
      />

      <SearchFilter
        value={search}
        onChange={setSearch}
        placeholder="Search admins by name, email, clinic, or role..."
        filters={["All", "Active", "Inactive"]}
        selectedFilter={status}
        onFilterChange={setStatus}
      />

      {showForm ? (
        <form className="sa-form-card" style={{ marginBottom: 16 }} onSubmit={handleCreateAdmin}>
          <h3>Create new admin</h3>
          <p className="sa-form-subtitle">Invite a new administrator to a clinic.</p>
          {error ? <div className="sa-state sa-state--error">{error}</div> : null}
          <div className="sa-form-grid">
            <div className="sa-form-field">
              <label htmlFor="admin-full-name">Full name</label>
              <input
                id="admin-full-name"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Jane Smith"
                required
              />
            </div>
            <div className="sa-form-field">
              <label htmlFor="admin-email">Email</label>
              <input
                id="admin-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="superadmin@gmail.com"
                required
              />
            </div>
            <div className="sa-form-field">
              <label htmlFor="admin-phone">Phone</label>
              <input
                id="admin-phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="9876543210"
                required
              />
            </div>
            <div className="sa-form-field">
              <label htmlFor="admin-temporary-password">Temporary password</label>
              <input
                id="admin-temporary-password"
                name="temporaryPassword"
                type="password"
                value={form.temporaryPassword}
                onChange={handleChange}
                placeholder="Enter temporary password"
                autoComplete="new-password"
                required
              />
            </div>
            <div className="sa-form-field">
              <label htmlFor="admin-role">Role</label>
              <select id="admin-role" name="role" value={form.role} onChange={handleChange} required>
                <option>Clinic Admin</option>
                <option>Admin</option>
              </select>
            </div>
            <div className="sa-form-field sa-form-field-full">
              <label htmlFor="admin-assigned-clinic">Assigned clinic</label>
              <select
                id="admin-assigned-clinic"
                name="assignedClinicId"
                value={form.assignedClinicId}
                onChange={handleChange}
                required
              >
                <option value="">Select clinic</option>
                {clinics.map((clinic) => (
                  <option key={clinic.id || clinic.name} value={clinic.id || ""}>
                    {clinic.name}
                  </option>
                ))}
              </select>
            </div>
            <label className="sa-toggle-row sa-form-field-full">
              <span>
                <b>Send welcome email</b>
                <small>With login instructions</small>
              </span>
              <input
                type="checkbox"
                name="sendWelcomeEmail"
                checked={form.sendWelcomeEmail}
                onChange={handleChange}
              />
            </label>
          </div>
          <div className="sa-page-actions" style={{ marginTop: 14 }}>
            <button type="button" className="sa-btn" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button className="sa-btn sa-btn-primary" disabled={saving}>
              {saving ? "Creating..." : "Create admin"}
            </button>
          </div>
        </form>
      ) : null}

      {selectedAdmin ? (
        <div className="sa-form-card" style={{ marginBottom: 16 }}>
          <Header
            title="View Admin"
            subtitle={selectedAdmin.id}
            action={
              <button className="sa-btn" onClick={() => setSelectedAdmin(null)}>
                Close
              </button>
            }
          />
          <div className="sa-form-grid">
            {["name", "email", "assignedClinic", "role", "status"].map((key) => (
              <div className="sa-form-field" key={key}>
                <label>{key === "assignedClinic" ? "Assigned Clinic" : key.replace(/^\w/, (letter) => letter.toUpperCase())}</label>
                <input value={selectedAdmin?.[key] || ""} readOnly />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={!showForm ? error : ""}
        emptyMessage="No admins match your filters."
      />
    </>
  );
}

export default Admins;


