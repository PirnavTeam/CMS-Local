import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Eye, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { parseList, requestJson } from "../receptionApi";
import { useToast } from "../../components/ToastProvider";
import {
  onlyAlpha,
  onlyIndianMobileValue,
  onlyNumberValue,
  validateAlpha,
  validateDate,
  validateGmail,
  validateMobile,
  validateNumeric,
  validateRequired,
  validateSelected,
} from "../../utils/validation";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  age: "",
  dateOfBirth: "",
  bloodGroup: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  gender: "Female",
  address: "",
};

function ReceptionPatients() {
  const navigate = useNavigate();
  const toast = useToast();
  const [patients, setPatients] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const fetchPatients = () =>
    requestJson("Patient")
      .then((data) => {
        setPatients(parseList(data));
        setMessage("");
      })
      .catch((error) => {
        setMessage(error.message);
        toast.error(error.message || "Unable to load patients.");
      });

  useEffect(() => {
    fetchPatients();
  }, []);

  const rows = useMemo(() => [...patients].reverse(), [patients]);

  const openAdd = () => {
    setForm(emptyForm);
    setFieldErrors({});
    setModal("add");
    setMessage("");
  };

  const openEdit = (patient) => {
    setForm({
      id: patient.id,
      name: patient.name || "",
      email: patient.email || "",
      phone: patient.phone || "",
      age: patient.age || "",
      dateOfBirth: patient.dateOfBirth || "",
      bloodGroup: patient.bloodGroup || "",
      emergencyContactName: patient.emergencyContactName || "",
      emergencyContactPhone: patient.emergencyContactPhone || "",
      gender: patient.gender || "Female",
      address: patient.address || "",
    });
    setFieldErrors({});
    setModal("edit");
    setMessage("");
  };

  const updateField = (name, value) => {
    let nextValue = value;

    if (["name", "emergencyContactName"].includes(name)) {
      nextValue = onlyAlpha(value);
    }

    if (["phone", "emergencyContactPhone"].includes(name)) {
      nextValue = onlyIndianMobileValue(value);
    }

    if (name === "age") {
      nextValue = onlyNumberValue(value);
    }

    setForm((prev) => ({ ...prev, [name]: nextValue }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setMessage("");
  };

  const validateForm = () => {
    const nextErrors = {
      name: validateAlpha(form.name, "Name"),
      email: validateGmail(form.email),
      phone: validateMobile(form.phone, "Phone"),
      age: validateNumeric(form.age, "Age", { integer: true }),
      dateOfBirth: validateDate(form.dateOfBirth, "Date of birth"),
      bloodGroup: validateRequired(form.bloodGroup, "Blood group"),
      emergencyContactName: validateAlpha(
        form.emergencyContactName,
        "Emergency contact name"
      ),
      emergencyContactPhone: validateMobile(
        form.emergencyContactPhone,
        "Emergency contact phone"
      ),
      gender: validateSelected(form.gender, "gender"),
      address: validateRequired(form.address, "Address"),
    };

    Object.keys(nextErrors).forEach((key) => {
      if (!nextErrors[key]) delete nextErrors[key];
    });

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const savePatient = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      const text = "Please fix the highlighted fields.";
      setMessage(text);
      toast.error(text);
      return;
    }

    const body = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      age: Number(form.age) || 0,
      dateOfBirth: form.dateOfBirth || "",
      bloodGroup: form.bloodGroup.trim(),
      emergencyContactName: form.emergencyContactName.trim(),
      emergencyContactPhone: form.emergencyContactPhone.trim(),
      gender: form.gender,
      address: form.address.trim(),
    };

    try {
      if (modal === "edit" && form.id) {
        await requestJson(`Patient/${form.id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
      } else {
        await requestJson("Patient", { method: "POST", body: JSON.stringify(body) });
      }
      setModal(null);
      await fetchPatients();
      toast.success(modal === "edit" ? "Patient updated successfully" : "Patient added successfully");
    } catch (error) {
      setMessage(error.message);
      toast.error(error.message || "Unable to save patient.");
    }
  };

  const deletePatient = async (id) => {
    if (!window.confirm("Delete this patient?")) return;
    try {
      await requestJson(`Patient/${id}`, { method: "DELETE" });
      await fetchPatients();
      toast.success("Patient deleted successfully");
    } catch (error) {
      setMessage(error.message);
      toast.error(error.message || "Unable to delete patient.");
    }
  };

  return (
    <section className="rc-page">
      <div className="rc-page-head">
        <div>
          <h2>Patients</h2>
          <p>
            Manage patients: add new patients, view existing details, update records,
            or remove outdated entries.
          </p>
        </div>
        <div className="rc-head-actions">
          <button className="rc-btn" onClick={openAdd}>
            <Plus size={16} /> Add Patient
          </button>
          <button className="rc-btn ghost" onClick={fetchPatients}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="rc-btn" onClick={() => navigate("/reception/dashboard")}>
            <ArrowLeft size={16} /> Dashboard
          </button>
        </div>
      </div>

      {message ? <div className="rc-alert">{message}</div> : null}

      <div className="rc-card">
        <div className="rc-card-head">
          <div>
            <h3>Patient List</h3>
            <p>View, edit, or delete registered patients.</p>
          </div>
        </div>
        <div className="rc-table">
          <div className="rc-table-head five">
            <span>PID</span>
            <span>Name</span>
            <span>Phone</span>
            <span>Age</span>
            <span>Actions</span>
          </div>
          {rows.map((patient) => (
            <div className="rc-table-row five" key={patient.id}>
              <span>{patient.id}</span>
              <span>{patient.name || "-"}</span>
              <span>{patient.phone || "-"}</span>
              <span>{patient.age ? `${patient.age} yrs` : "-"}</span>
              <span className="rc-row-actions">
                <button
                  onClick={() => {
                    setForm(patient);
                    setModal("view");
                  }}
                >
                  <Eye size={15} /> View
                </button>
                <button onClick={() => openEdit(patient)}>
                  <Pencil size={15} /> Edit
                </button>
                <button className="danger" onClick={() => deletePatient(patient.id)}>
                  <Trash2 size={15} /> Delete
                </button>
              </span>
            </div>
          ))}
          {!rows.length ? <div className="rc-empty">No patients found.</div> : null}
        </div>
      </div>

      {modal ? (
        <div className="rc-modal-backdrop" onClick={() => setModal(null)}>
          <form
            noValidate
            className="rc-modal"
            onSubmit={savePatient}
            onClick={(event) => event.stopPropagation()}
          >
            <h3>
              {modal === "view"
                ? "Patient Details"
                : modal === "edit"
                  ? "Edit Patient"
                  : "Add Patient"}
            </h3>
            <div className="rc-form-grid">
              {[
                "name",
                "email",
                "phone",
                "age",
                "dateOfBirth",
                "bloodGroup",
                "emergencyContactName",
                "emergencyContactPhone",
                "address",
              ].map((field) => (
                <label key={field}>
                  <span>
                    {field
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (s) => s.toUpperCase())}
                  </span>
                  <input
                    name={field}
                    type={
                      field === "age"
                        ? "number"
                        : field === "dateOfBirth"
                        ? "date"
                        : "text"
                    }
                    value={form[field] || ""}
                    disabled={modal === "view"}
                    className={fieldErrors[field] ? "is-invalid" : ""}
                    onChange={(event) => updateField(field, event.target.value)}
                  />
                  {fieldErrors[field] ? (
                    <small className="rc-field-error">{fieldErrors[field]}</small>
                  ) : null}
                </label>
              ))}
              <label>
                <span>Gender</span>
                <select
                  value={form.gender || "Female"}
                  disabled={modal === "view"}
                  className={fieldErrors.gender ? "is-invalid" : ""}
                  onChange={(event) => updateField("gender", event.target.value)}
                >
                  <option>Female</option>
                  <option>Male</option>
                  <option>Other</option>
                </select>
                {fieldErrors.gender ? (
                  <small className="rc-field-error">{fieldErrors.gender}</small>
                ) : null}
              </label>
            </div>
            <div className="rc-modal-actions">
              <button type="button" className="rc-btn ghost" onClick={() => setModal(null)}>
                Close
              </button>
              {modal !== "view" ? (
                <button type="submit" className="rc-btn primary">
                  Save
                </button>
              ) : null}
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}

export default ReceptionPatients;
