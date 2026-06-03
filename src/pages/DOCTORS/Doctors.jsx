import React, { useEffect, useMemo, useRef, useState } from "react";
import "./Doctors.css";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  X,
  Camera,
  UserPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AuthImage, {
  resolveApiImageUrl,
} from "../../utils/AuthImage";
import { apiUrl } from "../../config/api";

const DOCTORS_API_URL =
  apiUrl("Doctor");

const parseDoctorsResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const getDoctorIsActive = (doctor) => {
  if (typeof doctor?.isActive === "boolean") return doctor.isActive;
  return String(doctor?.status || "").toLowerCase() === "active";
};

const cleanFormValue = (value) => {
  const text = String(value ?? "").trim();
  return text.toLowerCase() === "string" ? "" : text;
};

const cleanDisplayText = (value) => {
  const text = String(value ?? "").trim();
  return text && text.toLowerCase() !== "string" ? text : "-";
};

const getImageUrl = (entity = {}) => String(entity.imageUrl || "").trim();

const getInitialEditForm = (doctor = {}) => ({
  name: cleanFormValue(doctor.name),
  specialization: cleanFormValue(doctor.specialization),
  experience:
    doctor.experience !== undefined && doctor.experience !== null
      ? String(doctor.experience)
      : "",
  fees:
    doctor.fees !== undefined && doctor.fees !== null
      ? String(doctor.fees)
      : "",
  email: cleanFormValue(doctor.email),
  phone: cleanFormValue(doctor.phone),
  password: "",
  isActive: getDoctorIsActive(doctor),
});

const getEmptyEditErrors = () => ({});

const formatValidationMessage = (message) => {
  return String(message || "")
    .replace(/^The\s+/i, "")
    .replace(/\s+field\s+is\s+required\.?$/i, " is required.")
    .trim();
};

const getErrorKey = (key) => {
  const normalized = String(key || "")
    .split(".")
    .pop()
    .toLowerCase();

  const map = {
    name: "name",
    specialization: "specialization",
    experience: "experience",
    fees: "fees",
    email: "email",
    phone: "phone",
    password: "password",
    isactive: "isActive",
    image: "image",
  };

  return map[normalized] || "form";
};

const getValidationMessages = (data) => {
  if (!data?.errors || typeof data.errors !== "object") {
    return [];
  }

  return Object.entries(data.errors)
    .flatMap(([key, messages]) => {
      const values = Array.isArray(messages) ? messages : [messages];
      return values
        .filter(Boolean)
        .map((message) => `${key}: ${formatValidationMessage(message)}`);
    })
    .filter(Boolean);
};

const validateEditForm = (form) => {
  const errors = getEmptyEditErrors();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^[0-9+\-\s()]{7,15}$/;
  const experienceValue = Number(form.experience);
  const feesValue = Number(form.fees);

  if (!form.name.trim()) {
    errors.name = "Name is required.";
  }

  if (!form.specialization.trim()) {
    errors.specialization = "Specialization is required.";
  }

  if (form.experience === "" || Number.isNaN(experienceValue) || experienceValue < 0) {
    errors.experience = "Experience must be 0 or more.";
  }

  if (!Number.isInteger(experienceValue)) {
    errors.experience = "Experience must be a whole number.";
  }

  if (form.fees === "" || Number.isNaN(feesValue) || feesValue < 0) {
    errors.fees = "Fees must be 0 or more.";
  }

  if (!form.email.trim()) {
    errors.email = "Email is required.";
  } else if (!emailPattern.test(form.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!form.phone.trim()) {
    errors.phone = "Phone is required.";
  } else if (!phonePattern.test(form.phone.trim())) {
    errors.phone = "Enter a valid phone number.";
  }

  return errors;
};

const buildDoctorUpdateBody = ({
  doctor = {},
  form = {},
  imageFile = null,
  isActive,
}) => {
  const body = new FormData();
  const nextIsActive =
    typeof isActive === "boolean"
      ? isActive
      : typeof form.isActive === "boolean"
        ? form.isActive
        : getDoctorIsActive(doctor);

  body.append("Name", cleanFormValue(form.name ?? doctor.name));
  body.append(
    "Specialization",
    cleanFormValue(form.specialization ?? doctor.specialization)
  );
  body.append(
    "Experience",
    String(Number(form.experience ?? doctor.experience ?? 0) || 0)
  );
  body.append("Fees", String(Number(form.fees ?? doctor.fees ?? 0) || 0));
  body.append("Email", cleanFormValue(form.email ?? doctor.email));
  body.append("Phone", cleanFormValue(form.phone ?? doctor.phone));
  body.append("Password", String(form.password ?? "").trim());
  body.append("IsActive", String(nextIsActive));

  if (imageFile) {
    body.append("Image", imageFile);
  }

  return body;
};

function Doctors() {
  const navigate = useNavigate();
  const editImageInputRef = useRef(null);

  const [searchText, setSearchText] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  const [editingDoctor, setEditingDoctor] = useState(null);
  const [editForm, setEditForm] = useState(getInitialEditForm());
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");
  const [editFieldErrors, setEditFieldErrors] =
    useState(getEmptyEditErrors());

  const [toggleLoadingId, setToggleLoadingId] = useState(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  const fetchDoctors = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(DOCTORS_API_URL, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!response.ok) {
        throw new Error("Unable to load doctors right now.");
      }

      const data = await response.json();
      setDoctors(parseDoctorsResponse(data));

    } catch (fetchError) {
      setError(fetchError.message || "Unable to load doctors right now.");
    } finally {
      setLoading(false);
    }
  };

  const parseErrorMessage = async (response, fallbackMessage) => {
    try {
      const text = await response.text();
      if (!text) return fallbackMessage;

      try {
        const errorBody = JSON.parse(text);
        const validationMessages = getValidationMessages(errorBody);
        return (
          errorBody?.message ||
          validationMessages.join(" ") ||
          errorBody?.title ||
          text
        );
      } catch {
        return text;
      }
    } catch {
      return fallbackMessage;
    }
  };

  const parseEditError = async (response) => {
    const fallbackMessage = "Unable to update doctor right now.";

    try {
      const text = await response.text();
      if (!text) {
        return {
          message: fallbackMessage,
          fieldErrors: getEmptyEditErrors(),
        };
      }

      let data = null;
      try {
        data = JSON.parse(text);
      } catch {
        return {
          message: text,
          fieldErrors: getEmptyEditErrors(),
        };
      }

      const fieldErrors = getEmptyEditErrors();

      if (data?.errors && typeof data.errors === "object") {
        Object.entries(data.errors).forEach(([key, messages]) => {
          const errorKey = getErrorKey(key);
          const value = Array.isArray(messages)
            ? messages[0]
            : messages;

          fieldErrors[errorKey] = formatValidationMessage(value);
        });
      }

      return {
        message:
          data?.message ||
          getValidationMessages(data).join(" ") ||
          data?.title ||
          fallbackMessage,
        fieldErrors,
      };
    } catch {
      return {
        message: fallbackMessage,
        fieldErrors: getEmptyEditErrors(),
      };
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    return () => {
      if (editImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(editImagePreview);
      }
    };
  }, [editImagePreview]);

  const filteredDoctors = useMemo(() => {
    const value = searchText.trim().toLowerCase();
    if (!value) return doctors;

    return doctors.filter((doctor) =>
      [doctor.name, doctor.specialization, doctor.email]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(value))
    );
  }, [doctors, searchText]);

  const editInitial = useMemo(() => {
    return (editForm.name.trim()[0] || "D").toUpperCase();
  }, [editForm.name]);

  // const handleDoctorImageError = (doctorId) => {
  //   if (doctorId === undefined || doctorId === null) return;
  //   setBrokenImageIds((previous) => ({
  //     ...previous,
  //     [String(doctorId)]: true,
  //   }));
  // };

  const openEditDoctor = (doctor) => {
    if (!doctor?.id) return;

    if (editImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(editImagePreview);
    }

    setEditingDoctor(doctor);
    setEditForm(getInitialEditForm(doctor));
    setEditImageFile(null);
    setEditImagePreview(
  resolveApiImageUrl(
    getImageUrl(doctor)
  )
);
    setEditError("");
    setEditFieldErrors(getEmptyEditErrors());
  };

  const closeEditDoctor = () => {
    if (editImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(editImagePreview);
    }

    setEditingDoctor(null);
    setEditForm(getInitialEditForm());
    setEditImageFile(null);
    setEditImagePreview("");
    setEditError("");
    setEditFieldErrors(getEmptyEditErrors());
    setSavingEdit(false);
  };

  const handleEditFieldChange = (event) => {
    const { name, value } = event.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: name === "isActive" ? value === "true" : value,
    }));

    setEditFieldErrors((previous) => ({
      ...previous,
      [name]: "",
      form: "",
    }));
    setEditError("");
  };

  const handleEditImageChange = (event) => {
    const nextFile = event.target.files?.[0];
    if (!nextFile) return;

    if (editImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(editImagePreview);
    }

    setEditImageFile(nextFile);
    setEditImagePreview(URL.createObjectURL(nextFile));
    setEditFieldErrors((previous) => ({
      ...previous,
      image: "",
      form: "",
    }));
  };

  const handleSaveEditDoctor = async (event) => {
    event.preventDefault();

    if (!editingDoctor?.id) return;

    const validationErrors = validateEditForm(editForm);
    if (Object.keys(validationErrors).length > 0) {
      setEditFieldErrors(validationErrors);
      setEditError("Please fix the highlighted fields.");
      return;
    }

    setSavingEdit(true);
    setEditError("");
    setEditFieldErrors(getEmptyEditErrors());

    const requestBody = buildDoctorUpdateBody({
      doctor: editingDoctor,
      form: editForm,
      imageFile: editImageFile,
    });

    try {
      const response = await fetch(`${DOCTORS_API_URL}/${editingDoctor.id}`, {
        method: "PUT",
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
        body: requestBody,
      });

      if (!response.ok) {
        const apiError =
          await parseEditError(response);

        setEditFieldErrors(apiError.fieldErrors);
        throw new Error(apiError.message);
      }

      await fetchDoctors();
      closeEditDoctor();
    } catch (updateError) {
      setEditError(updateError.message || "Unable to update doctor right now.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleToggleDoctorStatus = async (doctor) => {
    if (!doctor?.id) return;

    const nextIsActive = !getDoctorIsActive(doctor);

    setToggleLoadingId(doctor.id);
    setError("");

    try {
      const response = await fetch(`${DOCTORS_API_URL}/${doctor.id}/toggle-status`, {
        method: "PATCH",
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!response.ok) {
        const message = await parseErrorMessage(
          response,
          "Unable to toggle doctor status right now."
        );
        throw new Error(message);
      }

      setDoctors((previousDoctors) =>
        previousDoctors.map((item) =>
          item.id === doctor.id
            ? {
                ...item,
                isActive: nextIsActive,
                status: nextIsActive ? "Active" : "Inactive",
              }
            : item
        )
      );
    } catch (toggleError) {
      setError(
        toggleError.message || "Unable to toggle doctor status right now."
      );
    } finally {
      setToggleLoadingId(null);
    }
  };

  const handleDeleteDoctor = async (doctorId) => {
    if (!doctorId) return;

    const shouldDelete = window.confirm("Delete this doctor?");
    if (!shouldDelete) return;

    setDeleteLoadingId(doctorId);
    setError("");

    try {
      const response = await fetch(`${DOCTORS_API_URL}/${doctorId}`, {
        method: "DELETE",
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!response.ok) {
        const message = await parseErrorMessage(
          response,
          "Unable to delete doctor right now."
        );
        throw new Error(message);
      }

      setDoctors((previousDoctors) =>
        previousDoctors.filter((doctor) => doctor.id !== doctorId)
      );
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete doctor right now.");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  return (
    <div className="doctors-page">
      <div className="doctors-page-header">
        <div>
          <h2>Doctors</h2>
          <p>
            {loading
              ? "Loading doctors..."
              : `${filteredDoctors.length} clinicians registered`}
          </p>
        </div>

        <div className="doctors-header-actions">
          <button
            className="doctors-btn doctors-btn-light"
            onClick={() => navigate("/doctors/schedule")}
          >
            <Calendar size={16} /> Manage Schedule
          </button>

          <button
            className="doctors-btn doctors-btn-light"
            onClick={() => navigate("/doctors/register")}
          >
            <UserPlus size={16} /> Doctor Register
          </button>

          <button
            className="doctors-btn doctors-btn-primary"
            onClick={() => navigate("/doctors/add")}
          >
            <Plus size={16} /> Add Doctor
          </button>
        </div>
      </div>

      <div className="doctors-search-bar">
        <Search size={16} />
        <input
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Search by name, specialty, email..."
        />
      </div>

      {error ? <div className="doctors-error">{error}</div> : null}

      <div className="doctors-table">
        <div className="doctors-thead">
          <span>Profile</span>
          <span>Name</span>
          <span>Specialization</span>
          <span>Experience</span>
          <span>Fees</span>
          <span>Contact</span>
          <span>Status</span>
          <span>Available Time</span>
          <span>Actions</span>
        </div>

        {!loading && filteredDoctors.length === 0 ? (
          <div className="doctors-empty">No doctors found.</div>
        ) : null}

        {filteredDoctors.map((doc) => {
          const doctorImageUrl = getImageUrl(doc);


          const initials =
            (doc.name || "D")
              .split(" ")
              .filter(Boolean)
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase() || "D";
          const isActive = getDoctorIsActive(doc);
          const isStatusUpdating = toggleLoadingId === doc.id;
          const isDeleting = deleteLoadingId === doc.id;

          return (
            <div className="doctors-row" key={doc.id ?? `${doc.name}-${doc.email}`}>
              <div className="doctors-profile-cell">
                {doctorImageUrl ? (
                  <AuthImage
                    src={doctorImageUrl}
                    alt={doc.name || "Doctor"}
                    className="doctors-profile-image"
                    fallback={
                      <div className="doctors-avatar doctors-avatar-large">
                        {initials}
                      </div>
                    }
                  />
                ) : (
                  <div className="doctors-avatar doctors-avatar-large">
                    {initials}
                  </div>
                )}
              </div>

              <div className="doctors-cell doctors-name-cell">
                <b>{doc.name || "-"}</b>
              </div>

              <div className="doctors-cell">{doc.specialization || "-"}</div>

              <div className="doctors-cell">
                {doc.experience !== undefined && doc.experience !== null
                  ? `${doc.experience} yrs`
                  : "-"}
              </div>

              <div className="doctors-cell doctors-fee">
                {doc.fees !== undefined && doc.fees !== null ? `$${doc.fees}` : "-"}
              </div>

              <div className="doctors-contact-cell">
                <span>{cleanDisplayText(doc.phone)}</span>
                <span>{cleanDisplayText(doc.email)}</span>
              </div>

              <div className="doctors-cell doctors-status-cell">
                <button
                  type="button"
                  className="doctors-status-button"
                  onClick={() => handleToggleDoctorStatus(doc)}
                  disabled={!doc.id || isStatusUpdating || isDeleting}
                  title="Toggle status"
                >
                  <span
                    className={`doctors-status ${isActive ? "doctors-status-active" : "doctors-status-inactive"
                      } ${isStatusUpdating ? "doctors-status-updating" : ""}`}
                  >
                    {isStatusUpdating
                      ? "Updating..."
                      : isActive
                        ? "Active"
                        : "Inactive"}
                  </span>
                </button>
              </div>

              <div className="doctors-cell doctors-time-cell">
                {doc.availableTime || "9:00 AM - 5:00 PM"}
              </div>

              <div className="doctors-action-cell">
                <button
                  type="button"
                  className="doctors-action-icon"
                  onClick={() => openEditDoctor(doc)}
                  disabled={!doc.id || isDeleting}
                  title="Edit doctor"
                >
                  <Pencil size={14} />
                </button>

                <button
                  type="button"
                  className="doctors-action-icon doctors-action-icon-delete"
                  onClick={() => handleDeleteDoctor(doc.id)}
                  disabled={!doc.id || isDeleting || isStatusUpdating}
                  title="Delete doctor"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {editingDoctor ? (
        <div className="doctor-edit-overlay" onClick={closeEditDoctor}>
          <div
            className="doctor-edit-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="doctor-edit-header">
              <h3>Edit Doctor</h3>
              <button
                type="button"
                className="doctor-edit-close"
                onClick={closeEditDoctor}
                aria-label="Close edit doctor form"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSaveEditDoctor} noValidate>
              <div className="doctor-edit-image-wrap">
                <div className="doctor-edit-image-circle">
                  <AuthImage
                    src={editImagePreview}
                    alt="Doctor preview"
                    className="doctor-edit-image-preview"
                    fallback={<span>{editInitial}</span>}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      objectFit: "cover",
                      display: "flex",
                    }}
                  />
                  <button
                    type="button"
                    className="doctor-edit-image-btn"
                    onClick={() => editImageInputRef.current?.click()}
                    aria-label="Upload doctor image"
                  >
                    <Camera size={14} />
                  </button>
                </div>
                <input
                  ref={editImageInputRef}
                  type="file"
                  name="Image"
                  accept="image/*"
                  className="doctor-edit-image-input"
                  onChange={handleEditImageChange}
                />
              </div>

              <div className="doctor-edit-grid">
                <div className="doctor-edit-field">
                  <label htmlFor="edit-name">Name</label>
                  <input
                    id="edit-name"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditFieldChange}
                    className={editFieldErrors.name ? "is-invalid" : ""}
                    aria-invalid={Boolean(editFieldErrors.name)}
                  />
                  {editFieldErrors.name ? (
                    <span className="doctor-edit-field-error">
                      {editFieldErrors.name}
                    </span>
                  ) : null}
                </div>

                <div className="doctor-edit-field">
                  <label htmlFor="edit-specialization">Specialization</label>
                  <input
                    id="edit-specialization"
                    name="specialization"
                    value={editForm.specialization}
                    onChange={handleEditFieldChange}
                    className={editFieldErrors.specialization ? "is-invalid" : ""}
                    aria-invalid={Boolean(editFieldErrors.specialization)}
                  />
                  {editFieldErrors.specialization ? (
                    <span className="doctor-edit-field-error">
                      {editFieldErrors.specialization}
                    </span>
                  ) : null}
                </div>

                <div className="doctor-edit-field">
                  <label htmlFor="edit-experience">Experience</label>
                  <input
                    id="edit-experience"
                    name="experience"
                    type="number"
                    min="0"
                    value={editForm.experience}
                    onChange={handleEditFieldChange}
                    className={editFieldErrors.experience ? "is-invalid" : ""}
                    aria-invalid={Boolean(editFieldErrors.experience)}
                  />
                  {editFieldErrors.experience ? (
                    <span className="doctor-edit-field-error">
                      {editFieldErrors.experience}
                    </span>
                  ) : null}
                </div>

                <div className="doctor-edit-field">
                  <label htmlFor="edit-fees">Fees</label>
                  <input
                    id="edit-fees"
                    name="fees"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.fees}
                    onChange={handleEditFieldChange}
                    className={editFieldErrors.fees ? "is-invalid" : ""}
                    aria-invalid={Boolean(editFieldErrors.fees)}
                  />
                  {editFieldErrors.fees ? (
                    <span className="doctor-edit-field-error">
                      {editFieldErrors.fees}
                    </span>
                  ) : null}
                </div>

                <div className="doctor-edit-field">
                  <label htmlFor="edit-phone">Phone</label>
                  <input
                    id="edit-phone"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditFieldChange}
                    className={editFieldErrors.phone ? "is-invalid" : ""}
                    aria-invalid={Boolean(editFieldErrors.phone)}
                  />
                  {editFieldErrors.phone ? (
                    <span className="doctor-edit-field-error">
                      {editFieldErrors.phone}
                    </span>
                  ) : null}
                </div>

                <div className="doctor-edit-field">
                  <label htmlFor="edit-email">Email</label>
                  <input
                    id="edit-email"
                    name="email"
                    type="email"
                    value={editForm.email}
                    onChange={handleEditFieldChange}
                    className={editFieldErrors.email ? "is-invalid" : ""}
                    aria-invalid={Boolean(editFieldErrors.email)}
                  />
                  {editFieldErrors.email ? (
                    <span className="doctor-edit-field-error">
                      {editFieldErrors.email}
                    </span>
                  ) : null}
                </div>

                <div className="doctor-edit-field">
                  <label htmlFor="edit-password">Password</label>
                  <input
                    id="edit-password"
                    name="password"
                    type="password"
                    value={editForm.password}
                    onChange={handleEditFieldChange}
                    placeholder="Leave blank if unchanged"
                    className={editFieldErrors.password ? "is-invalid" : ""}
                    aria-invalid={Boolean(editFieldErrors.password)}
                  />
                  {editFieldErrors.password ? (
                    <span className="doctor-edit-field-error">
                      {editFieldErrors.password}
                    </span>
                  ) : null}
                </div>

                <div className="doctor-edit-field">
                  <label htmlFor="edit-status">Status</label>
                  <select
                    id="edit-status"
                    name="isActive"
                    value={String(editForm.isActive)}
                    onChange={handleEditFieldChange}
                    className={editFieldErrors.isActive ? "is-invalid" : ""}
                    aria-invalid={Boolean(editFieldErrors.isActive)}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                  {editFieldErrors.isActive ? (
                    <span className="doctor-edit-field-error">
                      {editFieldErrors.isActive}
                    </span>
                  ) : null}
                </div>
              </div>

              {editFieldErrors.image ? (
                <p className="doctor-edit-error">{editFieldErrors.image}</p>
              ) : null}

              {editError ? <p className="doctor-edit-error">{editError}</p> : null}

              <div className="doctor-edit-actions">
                <button
                  type="button"
                  className="doctor-edit-cancel"
                  onClick={closeEditDoctor}
                  disabled={savingEdit}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="doctor-edit-save"
                  disabled={savingEdit}
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Doctors;
