import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Eye, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { parseList, requestJson } from "../receptionApi";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  age: "",
  dateOfBirth: "",
  bloodGroup: "",
  emergencyContactName: "",
  gender: "Female",
  address: "",
};

function ReceptionPatients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");

  const fetchPatients = () =>
    requestJson("Patient")
      .then((data) => {
        setPatients(parseList(data));
        setMessage("");
      })
      .catch((error) => setMessage(error.message));

  useEffect(() => {
    fetchPatients();
  }, []);

  const rows = useMemo(() => [...patients].reverse(), [patients]);

  const openAdd = () => {
    setForm(emptyForm);
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
      gender: patient.gender || "Female",
      address: patient.address || "",
    });
    setModal("edit");
    setMessage("");
  };

  const savePatient = async (event) => {
    event.preventDefault();
    const body = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      age: Number(form.age) || 0,
      dateOfBirth: form.dateOfBirth || "",
      bloodGroup: form.bloodGroup.trim(),
      emergencyContactName: form.emergencyContactName.trim(),
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
    } catch (error) {
      setMessage(error.message);
    }
  };

  const deletePatient = async (id) => {
    if (!window.confirm("Delete this patient?")) return;
    try {
      await requestJson(`Patient/${id}`, { method: "DELETE" });
      await fetchPatients();
    } catch (error) {
      setMessage(error.message);
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
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, [field]: event.target.value }))
                    }
                  />
                </label>
              ))}
              <label>
                <span>Gender</span>
                <select
                  value={form.gender || "Female"}
                  disabled={modal === "view"}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, gender: event.target.value }))
                  }
                >
                  <option>Female</option>
                  <option>Male</option>
                  <option>Other</option>
                </select>
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
