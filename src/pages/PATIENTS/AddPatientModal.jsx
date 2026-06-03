import React, { useState } from "react";
import "./AddPatientModal.css";

function AddPatientModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "Male",
    address: "",
  });
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.age ||
      !form.address.trim()
    ) {
      setError("Please fill all fields.");
      return;
    }

    setError("");
    onAdd({
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      age: Number(form.age),
    });
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

        <form onSubmit={handleSubmit}>
          <div className="add-patient-grid">
            <div className="add-patient-field">
              <label>Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Patient full name"
              />
            </div>

            <div className="add-patient-field">
              <label>Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="patient@mail.com"
              />
            </div>

            <div className="add-patient-field">
              <label>Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+1 415 555 0000"
              />
            </div>

            <div className="add-patient-field">
              <label>Age</label>
              <input
                name="age"
                type="number"
                min="0"
                value={form.age}
                onChange={handleChange}
                placeholder="30"
              />
            </div>

            <div className="add-patient-field">
              <label>Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>

            <div className="add-patient-field">
              <label>Address</label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Street, City"
              />
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
