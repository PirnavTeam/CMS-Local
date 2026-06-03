

import React, {
  useEffect,
  useState,
} from "react";

import "./AddStaffModal.css";
import { apiUrl } from "../../config/api";

const API_URL =
  apiUrl("Staff");

const cleanFormValue = (value) => {
  const text = String(value ?? "").trim();
  return text.toLowerCase() === "string" ? "" : text;
};

function AddStaffModal({
  onClose,
  fetchStaff,
  editData,
}) {
  const [loading, setLoading] =
    useState(false);

  const [image, setImage] =
    useState(null);

  const [formData, setFormData] =
    useState({
      name: "",
      email: "",
      phone: "",
      role: "",
      password: "",
      isActive: true,
    });

  // ================= EDIT DATA =================
  useEffect(() => {
    if (editData) {
      setFormData({
        name: cleanFormValue(editData.name),
        email: cleanFormValue(editData.email),
        phone: cleanFormValue(editData.phone),
        role: cleanFormValue(editData.role),
        password: "",
        isActive:
          editData.isActive ?? true,
      });
    }
  }, [editData]);

  // ================= CHANGE =================
  const handleChange = (e) => {
    const { name, value } =
      e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "isActive"
          ? value === "true"
          : value,
    }));
  };

  // ================= IMAGE =================
  const handleImageChange = (e) => {
    const file =
      e.target.files?.[0];

    if (file) {
      setImage(file);
    }
  };

  // ================= SUBMIT =================
  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      const body =
        new FormData();

      body.append(
        "Name",
        formData.name.trim()
      );

      body.append(
        "Email",
        formData.email.trim()
      );

      body.append(
        "Phone",
        formData.phone.trim()
      );

      body.append(
        "Role",
        formData.role.trim()
      );

      body.append(
        "Password",
        formData.password
      );

      body.append(
        "IsActive",
        String(Boolean(formData.isActive))
      );

      if (image) {
        body.append(
          "Image",
          image
        );
      }

      let response;

      // ================= EDIT =================
      if (editData?.id) {
        response = await fetch(
          `${API_URL}/${editData.id}`,
          {
            method: "PUT",
            headers: {
              "ngrok-skip-browser-warning":
                "true",
            },
            body,
          }
        );
      }

      // ================= ADD =================
      else {
        response = await fetch(
          API_URL,
          {
            method: "POST",
            headers: {
              "ngrok-skip-browser-warning":
                "true",
            },
            body,
          }
        );
      }

      console.log(
        "STATUS:",
        response.status
      );

      if (!response.ok) {
        const errorText =
          await response.text();

        console.log(
          "API ERROR:",
          errorText
        );

        alert(errorText);

        return;
      }

      alert(
        editData
          ? "Staff updated successfully"
          : "Staff added successfully"
      );

      await fetchStaff();

      onClose();
    } catch (error) {
      console.error(
        "SUBMIT ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="add-staff-overlay"
      onClick={(e) => {
        if (
          e.target ===
          e.currentTarget
        ) {
          onClose();
        }
      }}
    >

      <div
        className="add-staff-modal"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        <h2 className="add-staff-title">
          {editData
            ? "Edit Staff"
            : "Add Staff"}
        </h2>

        <form
          onSubmit={handleSubmit}
        >

          <div className="add-staff-grid">

            {/* NAME */}
            <div className="add-staff-field">

              <label className="add-staff-label">
                Name
              </label>

              <input
                type="text"
                name="name"
                className="add-staff-input"
                value={formData.name}
                onChange={
                  handleChange
                }
                required
              />

            </div>

            {/* EMAIL */}
            <div className="add-staff-field">

              <label className="add-staff-label">
                Email
              </label>

              <input
                type="email"
                name="email"
                className="add-staff-input"
                value={formData.email}
                onChange={
                  handleChange
                }
                required
              />

            </div>

            {/* PHONE */}
            <div className="add-staff-field">

              <label className="add-staff-label">
                Phone
              </label>

              <input
                type="text"
                name="phone"
                className="add-staff-input"
                value={formData.phone}
                onChange={
                  handleChange
                }
                required
              />

            </div>

            {/* PASSWORD */}
            <div className="add-staff-field">

              <label className="add-staff-label">
                Password
              </label>

              <input
                type="password"
                name="password"
                className="add-staff-input"
                value={
                  formData.password
                }
                onChange={
                  handleChange
                }
                required
              />

            </div>

            {/* ROLE */}
            <div className="add-staff-field add-staff-field-full">

              <label className="add-staff-label">
                Role
              </label>

              <input
                type="text"
                name="role"
                className="add-staff-input"
                value={formData.role}
                onChange={
                  handleChange
                }
                required
              />

            </div>

            {/* STATUS */}
            <div className="add-staff-field add-staff-field-full">

              <label className="add-staff-label">
                Status
              </label>

              <select
                name="isActive"
                className="add-staff-input"
                value={String(
                  formData.isActive
                )}
                onChange={
                  handleChange
                }
              >
                <option value="true">
                  Active
                </option>

                <option value="false">
                  Disabled
                </option>
              </select>

            </div>

            {/* IMAGE */}
            <div className="add-staff-field add-staff-field-full">

              <label className="add-staff-label">
                Upload Image
              </label>

              <input
                type="file"
                accept="image/*"
                className="add-staff-input"
                onChange={
                  handleImageChange
                }
              />

            </div>

          </div>

          {/* BUTTONS */}
          <div className="add-staff-actions">

            <button
              type="button"
              className="add-staff-cancel"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="add-staff-submit"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : editData
                  ? "Update Staff"
                  : "Add Staff"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default AddStaffModal;
