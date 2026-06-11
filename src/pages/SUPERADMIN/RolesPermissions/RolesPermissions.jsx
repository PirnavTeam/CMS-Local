import React, { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Header from "../../../components/superadmin/Header";
import DataTable from "../../../components/superadmin/DataTable";
import PermissionMatrix from "../../../components/superadmin/PermissionMatrix";
import {
  deleteRole,
  fetchRole,
  fetchRoles,
  saveRole,
  updateRolePermissions,
} from "../superAdminApi";

const permissionOptions = ["View", "Create", "Edit", "Delete"];

const emptyRole = {
  name: "",
  roleName: "",
  module: "General",
  status: "Active",
  permissions: ["View"],
};

const getRoleKey = (role = {}) => role.id || role.key || role.roleName || role.name;

function RolesPermissions() {
  const [showForm, setShowForm] = useState(false);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState(emptyRole);
  const [editingRoleId, setEditingRoleId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingPermission, setUpdatingPermission] = useState("");
  const [error, setError] = useState("");

  const loadRoles = async () => {
    setLoading(true);
    setError("");

    try {
      setRoles(await fetchRoles());
    } catch (requestError) {
      setError(requestError.message || "Unable to load roles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const openCreateForm = () => {
    setEditingRoleId("");
    setForm(emptyRole);
    setShowForm(true);
    setError("");
  };

  const openEditForm = async (role) => {
    setEditingRoleId(role.id);
    setForm({
      ...emptyRole,
      ...role,
      name: role.name || role.roleName || "",
      roleName: role.roleName || role.name || "",
      module: role.module || "General",
      permissions: Array.isArray(role.permissions) ? role.permissions : [],
    });
    setShowForm(true);
    setError("");

    try {
      const remoteRole = await fetchRole(role.id);
      setForm({
        ...emptyRole,
        ...remoteRole,
        name: remoteRole.name || remoteRole.roleName || "",
        roleName: remoteRole.roleName || remoteRole.name || "",
        module: remoteRole.module || "General",
        permissions: Array.isArray(remoteRole.permissions)
          ? remoteRole.permissions
          : [],
      });
    } catch {
      setForm({
        ...emptyRole,
        ...role,
        name: role.name || role.roleName || "",
        roleName: role.roleName || role.name || "",
        module: role.module || "General",
        permissions: Array.isArray(role.permissions) ? role.permissions : [],
      });
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingRoleId("");
    setForm(emptyRole);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handlePermissionChange = (permission) => {
    setForm((current) => {
      const permissions = current.permissions.includes(permission)
        ? current.permissions.filter((item) => item !== permission)
        : [...current.permissions, permission];

      return { ...current, permissions };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim() && !form.roleName.trim()) {
      setError("Role name is required.");
      return;
    }

    if (!form.module.trim()) {
      setError("Module is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await saveRole(
        {
          ...form,
          roleName: form.roleName || form.name,
          name: form.name || form.roleName,
        },
        editingRoleId || undefined
      );
      closeForm();
      await loadRoles();
    } catch (requestError) {
      setError(requestError.message || "Unable to save role.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (role) => {
    const confirmed = window.confirm(`Delete ${role.name || "this role"}?`);
    if (!confirmed) return;

    setError("");

    try {
      await deleteRole(role.id);
      if (editingRoleId === role.id) closeForm();
      await loadRoles();
    } catch (requestError) {
      setError(requestError.message || "Unable to delete role.");
    }
  };

  const handleMatrixPermissionToggle = async (role, permission) => {
    const roleKey = getRoleKey(role);
    if (!roleKey) return;

    const currentPermissions = Array.isArray(role.permissions)
      ? role.permissions
      : [];
    const nextPermissions = currentPermissions.includes(permission)
      ? currentPermissions.filter((item) => item !== permission)
      : [...currentPermissions, permission];
    const updateKey = `${roleKey}:${permission}`;

    setUpdatingPermission(updateKey);
    setError("");
    setRoles((currentRoles) =>
      currentRoles.map((item) =>
        getRoleKey(item) === roleKey ? { ...item, permissions: nextPermissions } : item
      )
    );

    if (role.canPersistPermissions === false || !role.id) {
      setUpdatingPermission("");
      return;
    }

    try {
      await updateRolePermissions(role.id, {
        ...role,
        permissions: nextPermissions,
      });
      await loadRoles();
    } catch (requestError) {
      setError(requestError.message || "Unable to update permissions.");
      setRoles((currentRoles) =>
        currentRoles.map((item) =>
          getRoleKey(item) === roleKey ? { ...item, permissions: currentPermissions } : item
        )
      );
    } finally {
      setUpdatingPermission("");
    }
  };

  const columns = [
    { key: "name", label: "Role" },
    { key: "module", label: "Module" },
    { key: "users", label: "Assigned Users", width: "minmax(110px, 0.7fr)" },
    {
      key: "permissions",
      label: "Permissions",
      width: "minmax(220px, 1.3fr)",
      render: (role) => role.permissions?.length ? role.permissions.join(", ") : "-",
    },
    {
      key: "actions",
      label: "Actions",
      width: "minmax(112px, 0.7fr)",
      render: (role) => {
        const canUseRemoteActions = role.canPersistPermissions !== false && role.id;

        return (
          <div className="sa-actions">
            <button
              className="sa-icon-btn"
              disabled={!canUseRemoteActions}
              onClick={() => openEditForm(role)}
              title={canUseRemoteActions ? "Edit role" : "Backend id unavailable"}
            >
              <Pencil size={15} />
            </button>
            <button
              className="sa-icon-btn"
              disabled={!canUseRemoteActions}
              onClick={() => handleDelete(role)}
              title={canUseRemoteActions ? "Delete role" : "Backend id unavailable"}
            >
              <Trash2 size={15} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Header
        title="Roles & Permissions"
        subtitle="Create roles and assign View, Create, Edit, and Delete permissions."
        action={
          <button className="sa-btn sa-btn-primary" onClick={openCreateForm}>
            <Plus size={16} />
            Create Role
          </button>
        }
      />

      {showForm ? (
        <form className="sa-form-card" style={{ marginBottom: 16 }} onSubmit={handleSubmit} noValidate>
          <h3>{editingRoleId ? "Edit Role" : "Create Role"}</h3>
          {error ? <div className="sa-state sa-state--error">{error}</div> : null}
          <div className="sa-form-grid">
            <div className="sa-form-field">
              <label>Role Name</label>
              <input
                name="name"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                    roleName: event.target.value,
                  }))
                }
                placeholder="Enter role name"
                required
              />
            </div>
            <div className="sa-form-field">
              <label>Module</label>
              <input
                name="module"
                value={form.module}
                onChange={handleChange}
                placeholder="Enter module name"
                required
              />
            </div>
            <div className="sa-form-field">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
            <div className="sa-form-field sa-form-field-full">
              <label>Permissions</label>
              <div className="sa-page-actions">
                {permissionOptions.map((permission) => (
                  <label className="sa-checkbox" key={permission}>
                    <input
                      type="checkbox"
                      checked={form.permissions.includes(permission)}
                      onChange={() => handlePermissionChange(permission)}
                    />
                    <span>{permission}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="sa-page-actions" style={{ marginTop: 14 }}>
            <button type="button" className="sa-btn" onClick={closeForm}>Close</button>
            <button className="sa-btn sa-btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Role"}
            </button>
          </div>
        </form>
      ) : null}

      <DataTable
        columns={columns}
        rows={roles}
        loading={loading}
        error={!showForm ? error : ""}
        emptyMessage="No roles found."
      />

      <div className="sa-panel" style={{ marginTop: 16 }}>
        <h3>Assign Permissions</h3>
        <p>Permission matrix for the current role list.</p>
        <PermissionMatrix
          roles={roles}
          onToggle={handleMatrixPermissionToggle}
          updatingKey={updatingPermission}
        />
      </div>
    </>
  );
}

export default RolesPermissions;
