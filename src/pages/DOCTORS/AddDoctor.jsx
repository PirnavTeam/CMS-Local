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

const DOCTORS_API_URL =
  apiUrl("Doctor");

function AddDoctor() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    specialization: "",
    experience: "0",
    fees: "0",
    email: "",
    phone: "",
    password: "", // added
  });

  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    setImage(event.target.files?.[0] || null);
  };

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");

    const body = new FormData();

    body.append("Name", form.name.trim());
    body.append("Specialization", form.specialization.trim());
    body.append("Experience", String(Number(form.experience) || 0));
    body.append("Fees", String(Number(form.fees) || 0));
    body.append("Email", form.email.trim());
    body.append("Phone", form.phone.trim());
    body.append("Password", form.password); // added
    body.append("IsActive", "true");

    if (image) {
      body.append("Image", image);
    }

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

      alert("Doctor added successfully");

      navigate("/doctors");
    } catch (submitError) {
      setError(submitError.message || "Unable to add doctor right now.");
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
          onClick={() => navigate(-1)}
          disabled={saving}
        >
          <X size={22} strokeWidth={2} />
        </button>

        <div className="add-doctor-header">
          <h2>Add Doctor</h2>
          <p>Enter doctor details below.</p>
        </div>

        <form className="add-doctor-form" onSubmit={handleSubmit}>
          <div className="add-doctor-grid">

            <div className="add-doctor-input-group">
              <label>Doctor Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="add-doctor-input-group">
              <label>Specialization</label>
              <input
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
                required
              />
            </div>

            <div className="add-doctor-input-group">
              <label>Experience</label>
              <input
                name="experience"
                type="number"
                min="0"
                value={form.experience}
                onChange={handleChange}
                required
              />
            </div>

            <div className="add-doctor-input-group">
              <label>Fees</label>
              <input
                name="fees"
                type="number"
                min="0"
                step="0.01"
                value={form.fees}
                onChange={handleChange}
                required
              />
            </div>

            <div className="add-doctor-input-group">
              <label>Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="add-doctor-input-group">
              <label>Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>

            {/* Added Password Field */}
            <div className="add-doctor-input-group">
              <label>Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="add-doctor-input-group add-doctor-input-group-half">
              <label>Image</label>
              <input
                type="file"
                name="Image"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>

          </div>

          {error ? (
            <p className="add-doctor-form-error">{error}</p>
          ) : null}

          <div className="add-doctor-actions">
            <button
              className="add-doctor-cancel"
              type="button"
              onClick={() => navigate(-1)}
              disabled={saving}
            >
              Cancel
            </button>

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
