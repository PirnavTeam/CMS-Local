import React, { useMemo, useState } from "react";
import "./NewAppointment.css";
import { ArrowLeft, CalendarPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  createAppointmentId,
  DOCTOR_OPTIONS,
  loadAppointments,
  saveAppointments,
} from "./appointmentsData";
import { loadPatients } from "../PATIENTS/patientsData";

function NewAppointment() {
  const navigate = useNavigate();
  const patientOptions = useMemo(
    () => loadPatients().map((patient) => patient.name),
    []
  );

  const [form, setForm] = useState({
    patient: "",
    doctor: "",
    date: "",
    time: "",
    status: "Scheduled",
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

    if (!form.patient || !form.doctor || !form.date || !form.time) {
      setError("Please complete all fields.");
      return;
    }

    setError("");
    const existingAppointments = loadAppointments();
    const newAppointment = {
      id: createAppointmentId(existingAppointments),
      patient: form.patient,
      doctor: form.doctor,
      date: form.date,
      time: form.time,
      status: form.status,
    };

    saveAppointments([newAppointment, ...existingAppointments]);
    navigate("/appointments");
  };

  return (
    <div className="new-appointment-page">
      <button
        type="button"
        className="new-appointment-back-btn"
        onClick={() => navigate("/appointments")}
      >
        <ArrowLeft size={16} /> Back to Appointments
      </button>

      <h2 className="new-appointment-title">New Appointment</h2>
      <p className="new-appointment-subtitle">Create a new appointment</p>

      <form className="new-appointment-form-card" onSubmit={handleSubmit}>
        <div className="new-appointment-grid">
          <div className="new-appointment-field">
            <label>Patient</label>
            <select
              name="patient"
              value={form.patient}
              onChange={handleChange}
            >
              <option value="">Select patient</option>
              {patientOptions.map((patient) => (
                <option value={patient} key={patient}>
                  {patient}
                </option>
              ))}
            </select>
          </div>

          <div className="new-appointment-field">
            <label>Doctor</label>
            <select name="doctor" value={form.doctor} onChange={handleChange}>
              <option value="">Select doctor</option>
              {DOCTOR_OPTIONS.map((doctor) => (
                <option value={doctor} key={doctor}>
                  {doctor}
                </option>
              ))}
            </select>
          </div>

          <div className="new-appointment-field">
            <label>Date</label>
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
            />
          </div>

          <div className="new-appointment-field">
            <label>Time</label>
            <input
              name="time"
              type="time"
              value={form.time}
              onChange={handleChange}
            />
          </div>

          <div className="new-appointment-field">
            <label>Status</label>
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {error && <p className="new-appointment-error">{error}</p>}

        <div className="new-appointment-actions">
          <button
            type="button"
            className="new-appointment-cancel-btn"
            onClick={() => navigate("/appointments")}
          >
            Cancel
          </button>
          <button type="submit" className="new-appointment-save-btn">
            <CalendarPlus size={16} /> Save Appointment
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewAppointment;
