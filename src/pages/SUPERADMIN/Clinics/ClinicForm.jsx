import React, { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../../components/superadmin/Header";
import { fetchClinic, saveClinic } from "../superAdminApi";
import { useToast } from "../../../components/ToastProvider";
import {
  onlyAlpha,
  onlyDigits,
  validateAlpha,
  validateGmail,
  validateMobile,
  validateRequired,
  validateSelected,
} from "../../../utils/validation";

const emptyClinic = {
  name: "",
  address: "",
  contactNumber: "",
  email: "",
  status: "Active",
};

const parseAddressParts = (address = "") => {
  const parts = String(address)
    .split(",")
    .map((part) => part.trim().replace(/\b\d{5,6}\b/g, "").trim())
    .filter(Boolean);
  const postalMatch = String(address).match(/\b\d{5,6}\b/);
  const countryIndex = parts.findIndex((part) =>
    /^(india|bharat|usa|united states|uk|united kingdom)$/i.test(part)
  );
  const country = countryIndex >= 0 ? parts[countryIndex] : parts[parts.length - 1] || "India";
  const state = countryIndex > 0 ? parts[countryIndex - 1] : parts[parts.length - 2] || "";

  return {
    city: parts[1] || parts[0] || "",
    state,
    country,
    postalCode: postalMatch?.[0] || "",
  };
};

const buildClinicPayload = (form) => {
  const clinicName = form.name.trim();
  const phoneNumber = form.contactNumber.trim();
  const email = form.email.trim();
  const address = form.address.trim();
  const { city, country, postalCode, state } = parseAddressParts(address);
  const isActive = form.status === "Active";

  return {
    ClinicName: clinicName,
    Name: clinicName,
    name: clinicName,
    PhoneNumber: phoneNumber,
    ContactNumber: phoneNumber,
    contactNumber: phoneNumber,
    phoneNumber,
    Email: email,
    ClinicEmail: email,
    email,
    Address: address,
    ClinicAddress: address,
    address,
    City: city,
    city,
    State: state,
    state,
    Country: country,
    country,
    PostalCode: postalCode,
    postalCode,
    Status: form.status,
    status: form.status,
    IsActive: isActive,
    isActive,
  };
};

function ClinicForm({ mode }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { id } = useParams();
  const [form, setForm] = useState(emptyClinic);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    let active = true;

    const loadClinic = async () => {
      if (mode !== "edit" || !id) return;

      setLoading(true);
      setError("");

      try {
        const clinic = await fetchClinic(id);
        if (active) setForm({ ...emptyClinic, ...clinic });
      } catch (requestError) {
        if (active) setError(requestError.message || "Unable to load clinic.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadClinic();

    return () => {
      active = false;
    };
  }, [id, mode]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    let nextValue = value;

    if (name === "name") {
      nextValue = onlyAlpha(value);
    }

    if (name === "contactNumber") {
      nextValue = onlyDigits(value).slice(0, 10);
    }

    setForm((current) => ({ ...current, [name]: nextValue }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
    setError("");
  };

  const validateForm = () => {
    const nextErrors = {
      name: validateAlpha(form.name, "Clinic name"),
      contactNumber: validateMobile(form.contactNumber, "Contact number"),
      email: validateGmail(form.email),
      status: validateSelected(form.status, "a status"),
      address: validateRequired(form.address, "Address"),
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

    try {
      await saveClinic(buildClinicPayload(form), mode === "edit" ? id : undefined);
      toast.success(mode === "edit" ? "Clinic updated successfully" : "Clinic created successfully");
      navigate("/superadmin/clinics");
    } catch (requestError) {
      const message = requestError.message || "Unable to save clinic.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="sa-state">Loading clinic...</div>;
  }

  return (
    <>
      <Header
        title={mode === "edit" ? "Edit Clinic" : "Add Clinic"}
        subtitle="Manage clinic profile and availability status."
      />

      <form className="sa-form-card" onSubmit={handleSubmit}>
        {error ? <div className="sa-state sa-state--error">{error}</div> : null}

        <div className="sa-form-grid">
          <div className="sa-form-field">
            <label>Clinic Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className={fieldErrors.name ? "is-invalid" : ""}
              required
            />
            {fieldErrors.name ? <span className="sa-field-error">{fieldErrors.name}</span> : null}
          </div>
          <div className="sa-form-field">
            <label>Contact Number</label>
            <input
              name="contactNumber"
              value={form.contactNumber}
              onChange={handleChange}
              inputMode="numeric"
              maxLength={10}
              className={fieldErrors.contactNumber ? "is-invalid" : ""}
              required
            />
            {fieldErrors.contactNumber ? <span className="sa-field-error">{fieldErrors.contactNumber}</span> : null}
          </div>
          <div className="sa-form-field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={fieldErrors.email ? "is-invalid" : ""}
              required
            />
            {fieldErrors.email ? <span className="sa-field-error">{fieldErrors.email}</span> : null}
          </div>
          <div className="sa-form-field">
            <label>Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className={fieldErrors.status ? "is-invalid" : ""}
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>
            {fieldErrors.status ? <span className="sa-field-error">{fieldErrors.status}</span> : null}
          </div>
          <div className="sa-form-field sa-form-field-full">
            <label>Address</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              className={fieldErrors.address ? "is-invalid" : ""}
              required
            />
            {fieldErrors.address ? <span className="sa-field-error">{fieldErrors.address}</span> : null}
          </div>
        </div>

        <div className="sa-page-actions" style={{ marginTop: 16 }}>
          <button type="button" className="sa-btn" onClick={() => navigate("/superadmin/clinics")}>
            Cancel
          </button>
          <button type="submit" className="sa-btn sa-btn-primary" disabled={saving}>
            <Save size={16} />
            {saving ? "Saving..." : "Save Clinic"}
          </button>
        </div>
      </form>
    </>
  );
}

export default ClinicForm;
