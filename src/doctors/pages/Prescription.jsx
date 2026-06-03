import React, { useEffect, useMemo, useState } from "react";
import { Download, Printer, Search, Trash2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Prescription.css";
import { apiUrl } from "../../config/api";
import {
  filterByLoggedInDoctor,
  getAuthToken,
  getLoggedInDoctor,
} from "../utils/doctorSession";
import {
  fetchDiagnosisOptions,
  mergeDiagnosisOption,
} from "../utils/diagnosisOptions";

const STEPS = [
  "Waiting",
  "Consultation Started",
  "Prescription Added",
  "Completed",
];

const APPOINTMENTS_API = apiUrl("Appointment");
const CONSULTATION_API = apiUrl("Consultation");
const PRESCRIPTION_API = apiUrl("Prescription");

const emptyValue = "-";

const createMedicine = () => ({
  id: Date.now() + Math.random(),
  medicineName: "",
  dosage: "",
  frequency: "",
  duration: "",
  notes: "",
});

const toDateInput = (value) => {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
};

const defaultFollowUpDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().slice(0, 10);
};

const normalizeAppointment = (item, fallback = {}) => {
  if (!item) return null;

  return {
    ...item,
    appointmentId: item.appointmentId || item.id || fallback.appointmentId,
    patientId: item.patientId || fallback.patientId,
    patientName:
      item.patientName ||
      item.name ||
      fallback.patientName ||
      fallback.name ||
      emptyValue,
    patientCode: item.patientCode || fallback.patientCode || emptyValue,
    age: item.age ?? fallback.age ?? emptyValue,
    gender: item.gender || fallback.gender || emptyValue,
    date: item.date || fallback.date || "",
    doctorName:
      item.doctorName ||
      fallback.doctorName ||
      localStorage.getItem("doctorName") ||
      "Doctor",
    doctorSpecialization:
      item.doctorSpecialization ||
      fallback.doctorSpecialization ||
      "",
  };
};

const normalizeMedicines = (medicines) =>
  (Array.isArray(medicines) ? medicines : []).map((medicine) => ({
    id: medicine.id || Date.now() + Math.random(),
    medicineName: medicine.medicineName || medicine.medicine || "",
    dosage: medicine.dosage || "",
    frequency: medicine.frequency || "",
    duration: medicine.duration || "",
    notes: medicine.notes || "",
  }));

const getValidationMessages = (data) => {
  if (!data?.errors || typeof data.errors !== "object") return [];

  return Object.entries(data.errors)
    .flatMap(([key, messages]) => {
      const list = Array.isArray(messages) ? messages : [messages];
      return list.filter(Boolean).map((message) => `${key}: ${message}`);
    })
    .filter(Boolean);
};

const parseJsonText = (text) => {
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
};

const getResponseMessage = (data, text, fallback) =>
  data?.message ||
  getValidationMessages(data).join(" ") ||
  data?.title ||
  text ||
  fallback;

const toPositiveId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

function Prescription() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state || {};

  const [appointment, setAppointment] = useState(null);
  const [consultation, setConsultation] = useState(routeState.consultation || null);
  const [diagnosis, setDiagnosis] = useState(routeState.consultation?.diagnosis || "");
  const [instructions, setInstructions] = useState(
    "Take medicines after food and complete the full course."
  );
  const [followUp, setFollowUp] = useState(defaultFollowUpDate());
  const [medicines, setMedicines] = useState([createMedicine()]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [diagnosisOptions, setDiagnosisOptions] = useState([]);

  useEffect(() => {
    let isActive = true;

    fetchDiagnosisOptions()
      .then((options) => {
        if (isActive) setDiagnosisOptions(options);
      })
      .catch((err) => {
        console.warn("Unable to load diagnosis suggestions.", err);
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const loadPrescription = async () => {
      try {
        setLoading(true);
        setError("");

        const routeAppointment = normalizeAppointment(
          routeState.appointment || routeState.patient,
          {
            appointmentId: routeState.appointmentId,
            patientId: routeState.patientId,
            patientName: routeState.patient?.name,
            patientCode: routeState.patient?.pid || routeState.patient?.patientCode,
            age: routeState.patient?.age,
            gender: routeState.patient?.gender,
          }
        );

        let selectedAppointment = routeAppointment;
        const token = getAuthToken();
        const headers = {
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json",
        };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const appointmentsResponse = await fetch(APPOINTMENTS_API, {
          headers,
        });

        if (appointmentsResponse.ok) {
          const appointmentsData = await appointmentsResponse.json();
          let rawAppointments = Array.isArray(appointmentsData) ? appointmentsData : [];
          rawAppointments = filterByLoggedInDoctor(
            rawAppointments,
            getLoggedInDoctor()
          );
          
          const appointments = rawAppointments.map((item) =>
            normalizeAppointment(item, {
              patientId: routeState.patientId || routeAppointment?.patientId,
            })
          );

          selectedAppointment =
            appointments.find(
              (item) =>
                String(item.appointmentId) ===
                String(routeState.appointmentId || routeAppointment?.appointmentId)
            ) ||
            appointments.find(
              (item) =>
                routeAppointment?.patientCode &&
                String(item.patientCode) === String(routeAppointment.patientCode)
            ) ||
            selectedAppointment ||
            appointments.find((item) =>
              ["inprogress", "in progress", "waiting"].includes(
                String(item.status || "").trim().toLowerCase()
              )
            ) ||
            appointments[0];
        }

        if (!selectedAppointment?.appointmentId) {
          throw new Error("No appointment found for prescription.");
        }

        const normalizedAppointment = normalizeAppointment(selectedAppointment, {
          patientId: routeState.patientId || routeAppointment?.patientId,
        });

        let savedConsultation = routeState.consultation || null;
        const consultationResponse = await fetch(
          `${CONSULTATION_API}/appointment/${normalizedAppointment.appointmentId}`,
          {
            headers,
          }
        );

        if (consultationResponse.ok) {
          savedConsultation = await consultationResponse.json();
        }

        let savedPrescription = null;
        const prescriptionResponse = await fetch(
          `${PRESCRIPTION_API}/appointment/${normalizedAppointment.appointmentId}`,
          {
            headers,
          }
        );

        if (prescriptionResponse.ok) {
          savedPrescription = await prescriptionResponse.json();
        }

        setAppointment(
          normalizeAppointment(normalizedAppointment, {
            patientId: savedConsultation?.patientId || routeState.patientId,
          })
        );
        setConsultation(savedConsultation);
        const resolvedDiagnosis =
          savedPrescription?.diagnosis ||
            savedConsultation?.diagnosis ||
            routeState.consultation?.diagnosis ||
            "";

        setDiagnosis(resolvedDiagnosis);
        setDiagnosisOptions((prev) =>
          mergeDiagnosisOption(prev, resolvedDiagnosis)
        );
        setInstructions(
          savedPrescription?.instructions ||
            "Take medicines after food and complete the full course."
        );
        setFollowUp(toDateInput(savedPrescription?.followUpDate) || defaultFollowUpDate());

        const existingMedicines = normalizeMedicines(savedPrescription?.medicines);
        setMedicines(existingMedicines.length ? existingMedicines : [createMedicine()]);
      } catch (err) {
        console.error(err);
        setError(err.message || "Unable to load prescription.");
      } finally {
        setLoading(false);
      }
    };

    loadPrescription();
  }, [routeState.appointmentId, routeState.patientId]);

  const hospitalName = localStorage.getItem("hospitalName") || "MediCare";
  const doctorName = localStorage.getItem("doctorName") || appointment?.doctorName || "Doctor";

  const validMedicines = useMemo(
    () =>
      medicines
        .map((medicine) => ({
          medicineName: medicine.medicineName.trim(),
          dosage: medicine.dosage.trim(),
          frequency: medicine.frequency.trim(),
          duration: medicine.duration.trim(),
          notes: medicine.notes.trim(),
        }))
        .filter((medicine) => medicine.medicineName),
    [medicines]
  );

  const updateMedicine = (id, field, value) =>
    setMedicines((prev) =>
      prev.map((medicine) =>
        medicine.id === id ? { ...medicine, [field]: value } : medicine
      )
    );

  const removeMedicine = (id) =>
    setMedicines((prev) =>
      prev.length === 1 ? [createMedicine()] : prev.filter((medicine) => medicine.id !== id)
    );

  const addMedicine = () =>
    setMedicines((prev) => [...prev, createMedicine()]);

  const submitPrescription = async () => {
    const appointmentId = toPositiveId(appointment?.appointmentId);
    const patientId = toPositiveId(appointment?.patientId);

    if (!appointmentId || !patientId) {
      setError("Appointment id or patient id is missing.");
      return;
    }

    if (!diagnosis.trim()) {
      setError("Diagnosis is required.");
      return;
    }

    if (validMedicines.length === 0) {
      setError("Add at least one medicine.");
      return;
    }

    if (!followUp) {
      setError("Follow up date is required.");
      return;
    }

    const incompleteMedicine = validMedicines.find(
      (medicine) =>
        !medicine.dosage ||
        !medicine.frequency ||
        !medicine.duration
    );

    if (incompleteMedicine) {
      setError("Dosage, frequency, and duration are required for each medicine.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setMessage("");

      const token = getAuthToken();
      const headers = {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(PRESCRIPTION_API, {
        method: "POST",
        headers,
        body: JSON.stringify({
          appointmentId,
          patientId,
          doctorId: appointment?.doctorId || routeState.doctorId || undefined,
          patientCode: appointment?.patientCode || routeState.patient?.patientCode || undefined,
          patientName: appointment?.patientName || routeState.patient?.name || undefined,
          appointmentDate: appointment?.date || undefined,
          diagnosis: diagnosis.trim(),
          instructions: instructions.trim(),
          followUpDate: new Date(`${followUp}T10:00:00`).toISOString(),
          status: "Completed",
          medicines: validMedicines,
        }),
      });

      const responseText = await response.text().catch(() => "");
      const data = parseJsonText(responseText);

      if (!response.ok) {
        throw new Error(
          getResponseMessage(
            data,
            responseText,
            "Unable to submit prescription."
          )
        );
      }

      setMessage(data.message || "Prescription submitted.");
      navigate("/doctor/completion", {
        state: {
          message: data.message,
          appointmentStatus: data.appointmentStatus,
          appointmentId: appointment.appointmentId,
          patientName: appointment.patientName,
        },
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to submit prescription.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="rx-state-card">Loading prescription...</div>;
  }

  if (error && !appointment) {
    return (
      <div className="rx-state-card rx-state-card--error">
        <span>{error}</span>
        <button type="button" onClick={() => navigate("/doctor/dashboard")}>
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="rx-page">
      <div className="rx-stepper">
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            <div className="rx-step">
              <div
                className={`rx-step-circle ${
                  i < 2 ? "done" : i === 2 ? "active" : ""
                }`}
              >
                {i < 2 ? "✓" : i + 1}
              </div>
              <span className={`rx-step-label ${i === 2 ? "active" : ""}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`rx-step-line ${i < 2 ? "done" : ""}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {error ? <div className="rx-inline-error">{error}</div> : null}
      {message ? <div className="rx-inline-success">{message}</div> : null}

      <div className="rx-body">
        <div className="rx-form-panel">
          <div className="rx-field">
            <label className="rx-label">Diagnosis *</label>
            <input
              className="rx-input"
              list="prescription-diagnosis-options"
              value={diagnosis}
              onChange={(event) => setDiagnosis(event.target.value)}
              placeholder="Diagnosis from consultation"
              autoComplete="off"
            />
            <datalist id="prescription-diagnosis-options">
              {diagnosisOptions.map((item) => (
                <option value={item} key={item} />
              ))}
            </datalist>
          </div>

          <div className="rx-field">
            <label className="rx-label">Medicine</label>
            <div className="rx-search-bar">
              <Search size={15} className="rx-search-icon" />
              <input className="rx-search-input" placeholder="Search medicine..." />
            </div>
          </div>

          <div className="rx-table-wrap">
            <div className="rx-thead">
              <span>Medicine</span>
              <span>Dosage</span>
              <span>Frequency</span>
              <span>Duration</span>
              <span>Notes</span>
              <span>Actions</span>
            </div>
            {medicines.map((medicine) => (
              <div className="rx-row" key={medicine.id}>
                <input
                  className="rx-cell-input rx-med-name"
                  value={medicine.medicineName}
                  onChange={(event) =>
                    updateMedicine(medicine.id, "medicineName", event.target.value)
                  }
                  placeholder="Medicine name"
                />
                <input
                  className="rx-cell-input"
                  value={medicine.dosage}
                  onChange={(event) =>
                    updateMedicine(medicine.id, "dosage", event.target.value)
                  }
                  placeholder="1 Tablet"
                />
                <input
                  className="rx-cell-input rx-freq"
                  value={medicine.frequency}
                  onChange={(event) =>
                    updateMedicine(medicine.id, "frequency", event.target.value)
                  }
                  placeholder="Twice Daily"
                />
                <input
                  className="rx-cell-input"
                  value={medicine.duration}
                  onChange={(event) =>
                    updateMedicine(medicine.id, "duration", event.target.value)
                  }
                  placeholder="5 Days"
                />
                <input
                  className="rx-cell-input"
                  value={medicine.notes}
                  onChange={(event) =>
                    updateMedicine(medicine.id, "notes", event.target.value)
                  }
                  placeholder="After food"
                />
                <span>
                  <button
                    className="rx-del-btn"
                    type="button"
                    onClick={() => removeMedicine(medicine.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </span>
              </div>
            ))}
          </div>

          <button className="rx-add-med-btn" type="button" onClick={addMedicine}>
            + Add Medicine
          </button>

          <div className="rx-field">
            <label className="rx-label">Instructions</label>
            <textarea
              className="rx-textarea"
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
              rows={3}
            />
          </div>

          <div className="rx-field rx-field--half">
            <label className="rx-label">Follow Up Date</label>
            <input
              className="rx-input"
              type="date"
              value={followUp}
              onChange={(event) => setFollowUp(event.target.value)}
            />
          </div>

          <div className="rx-actions">
            <button
              className="rx-btn-draft"
              type="button"
              onClick={() => setMessage("Draft kept on this screen.")}
            >
              Save Draft
            </button>
            <div className="rx-actions-right">
              <button
                className="rx-btn-submit"
                type="button"
                onClick={submitPrescription}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Prescription"}
              </button>
              <button className="rx-btn-icon" type="button" onClick={() => window.print()}>
                <Printer size={16} /> Print
              </button>
              <button className="rx-btn-icon" type="button" onClick={() => window.print()}>
                <Download size={16} /> Download PDF
              </button>
            </div>
          </div>
        </div>

        <div className="rx-preview-panel">
          <h4 className="rx-preview-heading">Prescription Preview</h4>
          <div className="rx-preview-slip">
            <div className="rx-slip-header">
              <p className="rx-slip-clinic">{hospitalName}</p>
              <p className="rx-slip-sub">Super Speciality Hospital</p>
              <p className="rx-slip-addr">
                Patient prescription
                <br />
                Token: {appointment?.tokenNumber || emptyValue}
              </p>
            </div>
            <div className="rx-slip-rx">Rx</div>
            <div className="rx-slip-patient">
              <p>
                <b>Patient Name:</b> {appointment?.patientName || emptyValue}
              </p>
              <p>
                <b>PID:</b> {appointment?.patientCode || emptyValue}
              </p>
              <p>
                <b>Age / Gender:</b> {appointment?.age || emptyValue} Y /{" "}
                {appointment?.gender || emptyValue}
              </p>
              <p>
                <b>Date:</b> {toDateInput(appointment?.date) || new Date().toISOString().slice(0, 10)}
              </p>
            </div>
            <table className="rx-slip-table">
              <thead>
                <tr>
                  <th>Medicines</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {(validMedicines.length ? validMedicines : medicines).map((medicine, index) => (
                  <tr key={`${medicine.medicineName}-${index}`}>
                    <td>{medicine.medicineName || emptyValue}</td>
                    <td>{medicine.dosage || emptyValue}</td>
                    <td>{medicine.frequency || emptyValue}</td>
                    <td>{medicine.duration || emptyValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="rx-slip-instruction">
              <i>{instructions || "No instructions added."}</i>
            </p>
            <p className="rx-slip-followup">
              Follow-Up Date: {followUp || emptyValue}
            </p>
            <div className="rx-slip-signature">
              <p>
                <b>Dr. {doctorName}</b>
              </p>
              <p>{appointment?.doctorSpecialization || "Consultant"}</p>
              <p>
                Diagnosis: {diagnosis || consultation?.diagnosis || emptyValue}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Prescription;
