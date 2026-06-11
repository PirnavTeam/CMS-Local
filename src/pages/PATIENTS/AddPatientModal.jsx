import React, { useState } from "react";
import "./AddPatientModal.css";
import { useToast } from "../../components/ToastProvider";
import {
  onlyAlpha,
  onlyIndianMobileValue,
  onlyNumberValue,
  validateAlpha,
  validateGmail,
  validateMobile,
  validateNumeric,
  validateRequired,
  validateSelected,
} from "../../utils/validation";

function AddPatientModal({ onClose, onAdd }) {
  const toast = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "Male",
    emergencyContactName: "",
    emergencyContactPhone: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (event) => {
    const { name } = event.target;
    let { value } = event.target;

    if (["name", "emergencyContactName"].includes(name)) {
      value = onlyAlpha(value);
    }

    if (["phone", "emergencyContactPhone"].includes(name)) {
      value = onlyIndianMobileValue(value);
    }

    if (name === "age") {
      value = onlyNumberValue(value);
    }

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
    setFieldErrors((previous) => ({ ...previous, [name]: "" }));
    setError("");
  };

  const validateForm = () => {
    const nextErrors = {
      name: validateAlpha(form.name, "Name"),
      email: validateGmail(form.email),
      phone: validateMobile(form.phone, "Phone"),
      age: validateNumeric(form.age, "Age", { integer: true }),
      gender: validateSelected(form.gender, "gender"),
      emergencyContactName: validateAlpha(
        form.emergencyContactName,
        "Emergency contact name"
      ),
      emergencyContactPhone: validateMobile(
        form.emergencyContactPhone,
        "Emergency contact number"
      ),
      address: validateRequired(form.address, "Address"),
    };

    Object.keys(nextErrors).forEach((key) => {
      if (!nextErrors[key]) delete nextErrors[key];
    });

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      setError("Please fix the highlighted fields.");
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setError("");
    onAdd({
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      emergencyContactName: form.emergencyContactName.trim(),
      emergencyContactPhone: form.emergencyContactPhone.trim(),
      address: form.address.trim(),
      age: Number(form.age),
    });
    toast.success("Patient added successfully");
  };

  return (
    <div
      className="add-patient-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="add-patient-modal" onClick={(event) => event.stopPropagation()}>
        <h2>Add Patient</h2>
        <p>Enter patient details</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="add-patient-grid">
            <div className="add-patient-field">
              <label>Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className={fieldErrors.name ? "is-invalid" : ""}
                placeholder="Patient full name"
              />
              {fieldErrors.name ? <span className="add-patient-field-error">{fieldErrors.name}</span> : null}
            </div>

            <div className="add-patient-field">
              <label>Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className={fieldErrors.email ? "is-invalid" : ""}
                placeholder="patient@gmail.com"
              />
              {fieldErrors.email ? <span className="add-patient-field-error">{fieldErrors.email}</span> : null}
            </div>

            <div className="add-patient-field">
              <label>Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                inputMode="numeric"
                maxLength={10}
                className={fieldErrors.phone ? "is-invalid" : ""}
                placeholder="9876543210"
              />
              {fieldErrors.phone ? <span className="add-patient-field-error">{fieldErrors.phone}</span> : null}
            </div>

            <div className="add-patient-field">
              <label>Age</label>
              <input
                name="age"
                type="number"
                min="0"
                value={form.age}
                onChange={handleChange}
                className={fieldErrors.age ? "is-invalid" : ""}
                placeholder="30"
              />
              {fieldErrors.age ? <span className="add-patient-field-error">{fieldErrors.age}</span> : null}
            </div>

            <div className="add-patient-field">
              <label>Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className={fieldErrors.gender ? "is-invalid" : ""}
              >
                <option>Male</option>
                <option>Female</option>
              </select>
              {fieldErrors.gender ? <span className="add-patient-field-error">{fieldErrors.gender}</span> : null}
            </div>

            <div className="add-patient-field">
              <label>Emergency Contact Name</label>
              <input
                name="emergencyContactName"
                value={form.emergencyContactName}
                onChange={handleChange}
                className={fieldErrors.emergencyContactName ? "is-invalid" : ""}
                placeholder="Contact full name"
              />
              {fieldErrors.emergencyContactName ? <span className="add-patient-field-error">{fieldErrors.emergencyContactName}</span> : null}
            </div>

            <div className="add-patient-field">
              <label>Emergency Contact Number</label>
              <input
                name="emergencyContactPhone"
                value={form.emergencyContactPhone}
                onChange={handleChange}
                inputMode="numeric"
                maxLength={10}
                className={fieldErrors.emergencyContactPhone ? "is-invalid" : ""}
                placeholder="9876543210"
              />
              {fieldErrors.emergencyContactPhone ? <span className="add-patient-field-error">{fieldErrors.emergencyContactPhone}</span> : null}
            </div>

            <div className="add-patient-field">
              <label>Address</label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                className={fieldErrors.address ? "is-invalid" : ""}
                placeholder="Street, City"
              />
              {fieldErrors.address ? <span className="add-patient-field-error">{fieldErrors.address}</span> : null}
            </div>
          </div>

          {error && <p className="add-patient-error">{error}</p>}

          <div className="add-patient-actions">
            <button type="button" className="add-patient-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="add-patient-submit">
              Add Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddPatientModal;
