// import React, { useState } from "react";
// import "./Modal.css";
// import { useNavigate } from "react-router-dom";
// import { X } from "lucide-react";

// const DOCTORS_API_URL =
//   "/api/Doctor";

// function AddDoctor() {
//   const navigate = useNavigate();
//   const [form, setForm] = useState({
//     name: "",
//     specialization: "",
//     experience: "0",
//     fees: "0",
//     email: "",
//     phone: "",
//   });
//   const [image, setImage] = useState(null);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");

//   const handleChange = (event) => {
//     const { name, value } = event.target;
//     setForm((previous) => ({
//       ...previous,
//       [name]: value,
//     }));
//   };

//   const handleImageChange = (event) => {
//     setImage(event.target.files?.[0] || null);
//   };

//   const parseErrorMessage = async (response) => {
//     const fallback = "Unable to add doctor right now.";

//     try {
//       const text = await response.text();
//       if (!text) return fallback;

//       try {
//         const data = JSON.parse(text);
//         return data?.message || data?.title || text;
//       } catch {
//         return text;
//       }
//     } catch {
//       return fallback;
//     }
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     setSaving(true);
//     setError("");

//     const body = new FormData();
//     body.append("Name", form.name.trim());
//     body.append("Specialization", form.specialization.trim());
//     body.append("Experience", String(Number(form.experience) || 0));
//     body.append("Fees", String(Number(form.fees) || 0));
//     body.append("Email", form.email.trim());
//     body.append("Phone", form.phone.trim());
//     body.append("IsActive", "true");

//     if (image) {
//       body.append("Image", image);
//     }

//     try {
//       const response = await fetch(DOCTORS_API_URL, {
//         method: "POST",
//         headers: {
//           "ngrok-skip-browser-warning": "true",
//         },
//         body,
//       });

//       if (!response.ok) {
//         throw new Error(await parseErrorMessage(response));
//       }

//       navigate("/doctors");
//     } catch (submitError) {
//       setError(submitError.message || "Unable to add doctor right now.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="add-doctor-page">
//       <div className="add-doctor-card">
//         <button
//           className="add-doctor-close-button"
//           type="button"
//           aria-label="Close add doctor form"
//           onClick={() => navigate(-1)}
//           disabled={saving}
//         >
//           <X size={22} strokeWidth={2} />
//         </button>

//         <div className="add-doctor-header">
//           <h2>Add Doctor</h2>
//           <p>Enter doctor details below. All fields marked are required.</p>
//         </div>

//         <form className="add-doctor-form" onSubmit={handleSubmit}>
//           <div className="add-doctor-grid">
//             <div className="add-doctor-input-group">
//               <label>Doctor Name</label>
//               <input
//                 name="name"
//                 value={form.name}
//                 onChange={handleChange}
//                 required
//                 autoFocus
//               />
//             </div>

//             <div className="add-doctor-input-group">
//               <label>Specialization</label>
//               <input
//                 name="specialization"
//                 value={form.specialization}
//                 onChange={handleChange}
//                 required
//               />
//             </div>

//             <div className="add-doctor-input-group">
//               <label>Experience (years)</label>
//               <input
//                 name="experience"
//                 type="number"
//                 min="0"
//                 value={form.experience}
//                 onChange={handleChange}
//                 required
//               />
//             </div>

//             <div className="add-doctor-input-group">
//               <label>Consultation Fee ($)</label>
//               <input
//                 name="fees"
//                 type="number"
//                 min="0"
//                 step="0.01"
//                 value={form.fees}
//                 onChange={handleChange}
//                 required
//               />
//             </div>

//             <div className="add-doctor-input-group">
//               <label>Email</label>
//               <input
//                 name="email"
//                 type="email"
//                 value={form.email}
//                 onChange={handleChange}
//                 required
//               />
//             </div>

//             <div className="add-doctor-input-group">
//               <label>Phone</label>
//               <input
//                 name="phone"
//                 value={form.phone}
//                 onChange={handleChange}
//                 required
//               />
//             </div>

//             <div className="add-doctor-input-group add-doctor-input-group-half">
//               <label>Image</label>
//               <input
//                 type="file"
//                 name="Image"
//                 accept="image/*"
//                 onChange={handleImageChange}
//               />
//             </div>
//           </div>

//           {error ? <p className="add-doctor-form-error">{error}</p> : null}

//           <div className="add-doctor-actions">
//             <button
//               className="add-doctor-cancel"
//               type="button"
//               onClick={() => navigate(-1)}
//               disabled={saving}
//             >
//               Cancel
//             </button>
//             <button className="add-doctor-primary" type="submit" disabled={saving}>
//               {saving ? "Adding..." : "Add Doctor"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default AddDoctor;




import React, { useState } from "react";
import "./Modal.css";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { apiUrl } from "../../config/api";
import { useToast } from "../../components/ToastProvider";
import {
  onlyAlpha,
  onlyIndianMobileValue,
  onlyNumberValue,
  validateAlpha,
  validateGmail,
  validateMobile,
  validateNumeric,
  validateSelected,
} from "../../utils/validation";

const DOCTORS_API_URL =
  apiUrl("Doctor");

const SPECIALIZATION_OPTIONS = [
  "Cardiology",
  "Dermatology",
  "ENT",
  "General Medicine",
  "Gynecology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Radiology",
  "Other",
];

const QUALIFICATION_OPTIONS = [
  "Bachelor of Medicine and Bachelor of Surgery (MBBS)",
  "Bachelor of Dental Surgery (BDS)",
  "Bachelor of Ayurvedic Medicine and Surgery (BAMS)",
  "Bachelor of Homeopathic Medicine and Surgery (BHMS)",
  "Doctor of Medicine (MD)",
  "Master of Surgery (MS)",
  "Diplomate of National Board (DNB)",
  "Doctorate of Medicine (DM)",
  "Master of Chirurgiae (MCh)",
];

function AddDoctor() {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({
    name: "",
    specialization: "",
    otherSpecialization: "",
    qualification: "",
    experience: "0",
    fees: "0",
    email: "",
    phone: "",
    isActive: "true",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (event) => {
    const { name } = event.target;
    let { value } = event.target;

    if (["name", "otherSpecialization"].includes(name)) {
      value = onlyAlpha(value);
    }

    if (name === "phone") {
      value = onlyIndianMobileValue(value);
    }

    if (["experience", "fees"].includes(name)) {
      value = onlyNumberValue(value);
    }

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
    setFieldErrors((previous) => ({ ...previous, [name]: "" }));
    setError("");
  };

  const getSpecializationValue = () =>
    form.specialization === "Other"
      ? form.otherSpecialization.trim()
      : form.specialization.trim();

  const parseErrorMessage = async (response) => {
    const fallback = "Unable to add doctor right now.";

    try {
      const text = await response.text();

      if (!text) return fallback;

      try {
        const data = JSON.parse(text);
        return data?.message || data?.title || text;
      } catch {
        return text;
      }
    } catch {
      return fallback;
    }
  };

  const validateForm = () => {
    const nextErrors = {
      name: validateAlpha(form.name, "Doctor name"),
      specialization: validateAlpha(getSpecializationValue(), "Specialization"),
      qualification: validateSelected(form.qualification, "a qualification"),
      experience: validateNumeric(form.experience, "Experience", {
        integer: true,
      }),
      fees: validateNumeric(form.fees, "Fees"),
      email: validateGmail(form.email),
      phone: validateMobile(form.phone, "Phone"),
    };

    Object.keys(nextErrors).forEach((key) => {
      if (!nextErrors[key]) delete nextErrors[key];
    });

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      setError("Please fix the highlighted fields.");
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setSaving(true);
    setError("");

    const body = new FormData();

    body.append("Name", form.name.trim());
    body.append("Specialization", getSpecializationValue());
    body.append("Qualification", form.qualification);
    body.append("Experience", String(Number(form.experience) || 0));
    body.append("Fees", String(Number(form.fees) || 0));
    body.append("Email", form.email.trim());
    body.append("Phone", form.phone.trim());
    body.append("IsActive", form.isActive);

    try {
      const response = await fetch(DOCTORS_API_URL, {
        method: "POST",
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
        body,
      });

      if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
      }

      toast.success("Doctor added successfully");

      navigate("/doctors");
    } catch (submitError) {
      const message = submitError.message || "Unable to add doctor right now.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="add-doctor-page">
      <div className="add-doctor-card">
        <button
          className="add-doctor-close-button"
          type="button"
          aria-label="Close add doctor form"
          onClick={() => navigate("/doctors")}
          disabled={saving}
        >
          <X size={22} strokeWidth={2} />
        </button>

        <div className="add-doctor-header">
          <h2>Add Doctor</h2>
          <p>Enter doctor details below.</p>
        </div>

        <form className="add-doctor-form" onSubmit={handleSubmit} noValidate>
          <div className="add-doctor-grid">

            <div className="add-doctor-input-group">
              <label>Doctor Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className={fieldErrors.name ? "is-invalid" : ""}
                required
              />
              {fieldErrors.name ? (
                <span className="add-doctor-field-error">{fieldErrors.name}</span>
              ) : null}
            </div>

            <div className="add-doctor-input-group">
              <label>Specialization</label>
              <select
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
                className={fieldErrors.specialization ? "is-invalid" : ""}
                required
              >
                <option value="">Select specialization</option>
                {SPECIALIZATION_OPTIONS.map((specialization) => (
                  <option key={specialization} value={specialization}>
                    {specialization}
                  </option>
                ))}
              </select>
              {form.specialization === "Other" ? (
                <input
                  name="otherSpecialization"
                  value={form.otherSpecialization}
                  onChange={handleChange}
                  className={fieldErrors.specialization ? "is-invalid" : ""}
                  placeholder="Enter specialization"
                  required
                />
              ) : null}
              {fieldErrors.specialization ? (
                <span className="add-doctor-field-error">
                  {fieldErrors.specialization}
                </span>
              ) : null}
            </div>

            <div className="add-doctor-input-group">
              <label>Experience</label>
              <input
                name="experience"
                type="number"
                min="0"
                value={form.experience}
                onChange={handleChange}
                className={fieldErrors.experience ? "is-invalid" : ""}
                required
              />
              {fieldErrors.experience ? (
                <span className="add-doctor-field-error">
                  {fieldErrors.experience}
                </span>
              ) : null}
            </div>

            <div className="add-doctor-input-group">
              <label>Qualification</label>
              <select
                name="qualification"
                value={form.qualification}
                onChange={handleChange}
                className={fieldErrors.qualification ? "is-invalid" : ""}
                required
              >
                <option value="">Select qualification</option>
                {QUALIFICATION_OPTIONS.map((qualification) => (
                  <option key={qualification} value={qualification}>
                    {qualification}
                  </option>
                ))}
              </select>
              {fieldErrors.qualification ? (
                <span className="add-doctor-field-error">
                  {fieldErrors.qualification}
                </span>
              ) : null}
            </div>

            <div className="add-doctor-input-group">
              <label>Fees</label>
              <input
                name="fees"
                type="text"
                inputMode="decimal"
                value={form.fees}
                onChange={handleChange}
                className={fieldErrors.fees ? "is-invalid" : ""}
                required
              />
              {fieldErrors.fees ? (
                <span className="add-doctor-field-error">{fieldErrors.fees}</span>
              ) : null}
            </div>

            <div className="add-doctor-input-group">
              <label>Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className={fieldErrors.email ? "is-invalid" : ""}
                required
              />
              {fieldErrors.email ? (
                <span className="add-doctor-field-error">{fieldErrors.email}</span>
              ) : null}
            </div>

            <div className="add-doctor-input-group">
              <label>Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                inputMode="numeric"
                maxLength={10}
                className={fieldErrors.phone ? "is-invalid" : ""}
                required
              />
              {fieldErrors.phone ? (
                <span className="add-doctor-field-error">{fieldErrors.phone}</span>
              ) : null}
            </div>

            <div className="add-doctor-input-group">
              <label htmlFor="add-doctor-is-active">Is Active</label>
              <select
                id="add-doctor-is-active"
                name="isActive"
                value={form.isActive}
                onChange={handleChange}
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>

          </div>

          {error ? (
            <p className="add-doctor-form-error">{error}</p>
          ) : null}

          <div className="add-doctor-actions">
            <button
              className="add-doctor-primary"
              type="submit"
              disabled={saving}
            >
              {saving ? "Adding..." : "Add Doctor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddDoctor;
