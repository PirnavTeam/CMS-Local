

import React, {
  useEffect,
  useState,
} from "react";

import "./AddStaffModal.css";
import { apiUrl } from "../../config/api";
import PasswordField from "../../components/PasswordField";
import { useToast } from "../../components/ToastProvider";
import {
  onlyAlpha,
  onlyDigits,
  validateAlpha,
  validateGmail,
  validateImageFile,
  validateMobile,
  validateStrongPassword,
} from "../../utils/validation";

const API_URL =
  apiUrl("Staff");

const cleanFormValue = (value) => {
  const text = String(value ?? "").trim();
  return text.toLowerCase() === "string" ? "" : text;
};

const parseApiError = async (response) => {
  const text = await response.text().catch(() => "");
  if (!text) return "Unable to save staff.";

  try {
    const data = JSON.parse(text);
    const validationMessage =
      data?.errors && typeof data.errors === "object"
        ? Object.entries(data.errors)
            .flatMap(([key, messages]) => {
              const list = Array.isArray(messages) ? messages : [messages];
              return list.filter(Boolean).map((message) => `${key}: ${message}`);
            })
            .join(" ")
        : "";

    return data?.message || validationMessage || data?.title || text;
  } catch {
    return text;
  }
};

function AddStaffModal({
  onClose,
  fetchStaff,
  editData,
}) {
  const toast = useToast();
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
  const [fieldErrors, setFieldErrors] =
    useState({});

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
    const { name } =
      e.target;
    let { value } = e.target;

    if (["name", "role"].includes(name)) {
      value = onlyAlpha(value);
    }

    if (name === "phone") {
      value = onlyDigits(value).slice(0, 10);
    }

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "isActive"
          ? value === "true"
          : value,
    }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ================= IMAGE =================
  const handleImageChange = (e) => {
    const file =
      e.target.files?.[0];

    if (file) {
      setImage(file);
      setFieldErrors((prev) => ({
        ...prev,
        image: validateImageFile(file),
      }));
    }
  };

  const validateForm = () => {
    const nextErrors = {
      name: validateAlpha(formData.name, "Name"),
      email: validateGmail(formData.email),
      phone: validateMobile(formData.phone, "Phone"),
      role: validateAlpha(formData.role, "Role"),
      password: validateStrongPassword(formData.password, "Password", {
        required: !editData,
      }),
      image: validateImageFile(image),
    };

    Object.keys(nextErrors).forEach((key) => {
      if (!nextErrors[key]) delete nextErrors[key];
    });

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  // ================= SUBMIT =================
  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

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
          await parseApiError(response);

        console.log(
          "API ERROR:",
          errorText
        );

        toast.error(errorText || "Unable to save staff.");

        return;
      }

      toast.success(
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
      toast.error(error.message || "Unable to save staff.");
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
                value={formData.name}
                onChange={
                  handleChange
                }
                className={`add-staff-input ${fieldErrors.name ? "is-invalid" : ""}`}
                required
              />
              {fieldErrors.name ? (
                <span className="add-staff-field-error">{fieldErrors.name}</span>
              ) : null}

            </div>

            {/* EMAIL */}
            <div className="add-staff-field">

              <label className="add-staff-label">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={
                  handleChange
                }
                className={`add-staff-input ${fieldErrors.email ? "is-invalid" : ""}`}
                required
              />
              {fieldErrors.email ? (
                <span className="add-staff-field-error">{fieldErrors.email}</span>
              ) : null}

            </div>

            {/* PHONE */}
            <div className="add-staff-field">

              <label className="add-staff-label">
                Phone
              </label>

              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={
                  handleChange
                }
                inputMode="numeric"
                maxLength={10}
                className={`add-staff-input ${fieldErrors.phone ? "is-invalid" : ""}`}
                required
              />
              {fieldErrors.phone ? (
                <span className="add-staff-field-error">{fieldErrors.phone}</span>
              ) : null}

            </div>

            {/* PASSWORD */}
            <div className="add-staff-field">

              <label className="add-staff-label">
                Password
              </label>

              <PasswordField
                name="password"
                value={
                  formData.password
                }
                onChange={
                  handleChange
                }
                className={`add-staff-input ${fieldErrors.password ? "is-invalid" : ""}`}
                required={!editData}
              />
              {fieldErrors.password ? (
                <span className="add-staff-field-error">
                  {fieldErrors.password}
                </span>
              ) : null}

            </div>

            {/* ROLE */}
            <div className="add-staff-field add-staff-field-full">

              <label className="add-staff-label">
                Role
              </label>

              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={
                  handleChange
                }
                className={`add-staff-input ${fieldErrors.role ? "is-invalid" : ""}`}
                required
              />
              {fieldErrors.role ? (
                <span className="add-staff-field-error">{fieldErrors.role}</span>
              ) : null}

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
                className={`add-staff-input ${fieldErrors.image ? "is-invalid" : ""}`}
                onChange={
                  handleImageChange
                }
              />
              {fieldErrors.image ? (
                <span className="add-staff-field-error">{fieldErrors.image}</span>
              ) : null}

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
