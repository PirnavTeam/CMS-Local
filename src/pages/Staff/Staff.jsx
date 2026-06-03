// import React, { useState } from "react";
// import "./Staff.css";
// import { Plus, Pencil, Ban, CheckCircle } from "lucide-react";
// import AddStaffModal from "./AddStaffModal";

// function Staff() {
//   const [open, setOpen] = useState(false);

//   const staff = [
//     {
//       name: "Olivia Brown",
//       role: "Receptionist",
//       phone: "+1 415 555 0211",
//       email: "olivia@medicore.io",
//       status: "Active",
//       initials: "OB",
//     },
//     {
//       name: "Liam Garcia",
//       role: "Nurse",
//       phone: "+1 415 555 0234",
//       email: "liam@medicore.io",
//       status: "Active",
//       initials: "LG",
//     },
//     {
//       name: "Sophie Müller",
//       role: "Pharmacist",
//       phone: "+1 415 555 0277",
//       email: "sophie@medicore.io",
//       status: "Active",
//       initials: "SM",
//     },
//     {
//       name: "Daniel Lee",
//       role: "Lab Technician",
//       phone: "+1 415 555 0299",
//       email: "daniel@medicore.io",
//       status: "Disabled",
//       initials: "DL",
//     },
//   ];

//   return (
//     <div className="staff-page">

//       {/* HEADER */}
//       <div className="staff-page-header">
//         <div>
//           <h2 className="staff-title">Staff</h2>
//           <p className="staff-subtitle">{staff.length} team members</p>
//         </div>

//         <button className="staff-add-btn" onClick={() => setOpen(true)}>
//           <Plus size={16} /> Add Staff
//         </button>
//       </div>

//       {/* TABLE */}
//       <div className="staff-table">

//         <div className="staff-thead">
//           <span>Name</span>
//           <span>Role</span>
//           <span>Phone</span>
//           <span>Email</span>
//           <span>Status</span>
//           <span>Actions</span>
//         </div>

//         {staff.map((s, i) => {
//           const isActive = s.status === "Active";

//           return (
//           <div className="staff-row" key={i}>

//             <div className="staff-info">
//               <div className="staff-avatar">{s.initials}</div>
//               <p className="staff-name">{s.name}</p>
//             </div>

//             <p className="staff-role">{s.role}</p>
//             <p className="staff-phone">{s.phone}</p>
//             <p className="staff-email">{s.email}</p>

//             <span className="staff-status-cell">
//               <span
//                 className={`staff-status-badge ${
//                   isActive ? "is-active" : "is-disabled"
//                 }`}
//               >
//                 <span className="staff-status-dot"></span>
//                 {s.status}
//               </span>
//             </span>

//             <div className="staff-actions">
//               <Pencil size={16} className="staff-action-edit" />

//               {isActive ? (
//                 <Ban size={16} className="staff-action-toggle is-disable" />
//               ) : (
//                 <CheckCircle
//                   size={16}
//                   className="staff-action-toggle is-enable"
//                 />
//               )}
//             </div>

//           </div>
//           );
//         })}
//       </div>

//       {open && <AddStaffModal onClose={() => setOpen(false)} />}
//     </div>
//   );
// }

// export default Staff;




import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import "./Staff.css";

import {
  Plus,
  Pencil,
  Ban,
  CheckCircle,
} from "lucide-react";

import AddStaffModal from "./AddStaffModal";
import AuthImage from "../../utils/AuthImage";
import { apiUrl } from "../../config/api";

const STAFF_API_URL =
  apiUrl("Staff");

const cleanDisplayText = (value) => {
  const text = String(value ?? "").trim();
  return text && text.toLowerCase() !== "string" ? text : "-";
};

const getImageUrl = (entity = {}) => String(entity.imageUrl || "").trim();

const isStaffActive = (item = {}) => {
  if (typeof item.isActive === "boolean")
    return item.isActive;

  const status =
    String(item.status || "").toLowerCase();

  return status === "active";
};

const parseErrorMessage = async (
  response,
  fallback
) => {
  const text =
    await response.text().catch(() => "");

  if (!text)
    return fallback;

  try {
    const data = JSON.parse(text);
    return data.message || text || fallback;
  } catch {
    return text || fallback;
  }
};

// ================= PARSE RESPONSE =================
const parseStaffResponse = (data) => {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.data))
    return data.data;

  return [];
};

function Staff() {
  const [open, setOpen] =
    useState(false);

  const [staff, setStaff] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [editData, setEditData] =
    useState(null);

  const [toggleLoadingId, setToggleLoadingId] =
    useState(null);

  // ================= FETCH STAFF =================
  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        STAFF_API_URL,
        {
          headers: {
            "ngrok-skip-browser-warning":
              "true",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load staff."
        );
      }

      const data =
        await response.json();

      console.log(
        "STAFF API:",
        data
      );

      setStaff(
        parseStaffResponse(data)
      );
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
        "Unable to load staff."
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= PAGE LOAD =================
  useEffect(() => {
    fetchStaff();
  }, []);

  // ================= TOGGLE STATUS =================
  const handleToggleStatus =
    async (id) => {
      if (!id || toggleLoadingId)
        return;

      const selectedStaff =
        staff.find(
          (item) =>
            item.id === id
        );

      const nextIsActive =
        !isStaffActive(selectedStaff);

      try {
        setToggleLoadingId(id);
        setError("");

        const response = await fetch(
          `${STAFF_API_URL}/${id}/toggle-status`,
          {
            method: "PATCH",
            headers: {
              "ngrok-skip-browser-warning":
                "true",
            },
          }
        );

        if (!response.ok) {
          const message =
            await parseErrorMessage(
              response,
              "Unable to update status."
            );

          throw new Error(
            message
          );
        }

        setStaff((previousStaff) =>
          previousStaff.map((item) =>
            item.id === id
              ? {
                ...item,
                isActive: nextIsActive,
                status: nextIsActive
                  ? "Active"
                  : "Disabled",
              }
              : item
          )
        );

        await fetchStaff();
      } catch (error) {
        console.error(error);
        setError(
          error.message ||
          "Unable to update status."
        );
      } finally {
        setToggleLoadingId(null);
      }
    };

  // ================= EDIT =================
  const handleEdit = (item) => {
    setEditData(item);
    setOpen(true);
  };

  // ================= FILTERED =================
  const filteredStaff = useMemo(() => {
    return staff || [];
  }, [staff]);

  return (
    <div className="staff-page">

      {/* HEADER */}
      <div className="staff-page-header">

        <div>
          <h2 className="staff-title">
            Staff
          </h2>

          <p className="staff-subtitle">
            {loading
              ? "Loading..."
              : `${filteredStaff.length} team members`}
          </p>
        </div>

        <button
          className="staff-add-btn"
          onClick={() => {
            setEditData(null);
            setOpen(true);
          }}
        >
          <Plus size={16} />
          Add Staff
        </button>

      </div>

      {/* ERROR */}
      {error ? (
        <div className="staff-loading">
          {error}
        </div>
      ) : null}

      {/* TABLE */}
      <div className="staff-table">

        <div className="staff-thead">
          <span>Name</span>
          <span>Role</span>
          <span>Phone</span>
          <span>Email</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {!loading &&
          filteredStaff.length === 0 ? (
          <div className="staff-loading">
            No Staff Found
          </div>
        ) : null}

        {filteredStaff.map((s) => {
          const initials =
            (s.name || "S")
              .split(" ")
              .filter(Boolean)
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase() || "S";

          const isActive =
            isStaffActive(s);

          const isStatusUpdating =
            toggleLoadingId === s.id;

          const imageUrl =
            getImageUrl(s);

          return (
            <div
              className="staff-row"
              key={s.id}
            >

              {/* NAME */}
              <div className="staff-info">

                {imageUrl ? (
                  <AuthImage
                    src={imageUrl}
                    alt={s.name}
                    className="staff-avatar-image"
                    fallback={
                      <div className="staff-avatar">
                        {initials}
                      </div>
                    }
                  />
                ) : (
                  <div className="staff-avatar">
                    {initials}
                  </div>
                )}

                <p className="staff-name">
                  {s.name || "-"}
                </p>

              </div>

              {/* ROLE */}
              <p className="staff-role">
                {s.role || "-"}
              </p>

              {/* PHONE */}
              <p className="staff-phone">
                {cleanDisplayText(s.phone)}
              </p>

              {/* EMAIL */}
              <p className="staff-email">
                {cleanDisplayText(s.email)}
              </p>

              {/* STATUS */}
              <span className="staff-status-cell">

                <span
                  className={`staff-status-badge ${isActive
                      ? "is-active"
                      : "is-disabled"
                    }`}
                >
                  <span className="staff-status-dot"></span>

                  {isActive
                    ? "Active"
                    : "Disabled"}
                </span>

              </span>

              {/* ACTIONS */}
              <div className="staff-actions">

                <Pencil
                  size={16}
                  className="staff-action-edit"
                  onClick={() =>
                    handleEdit(s)
                  }
                />

                <button
                  type="button"
                  className={`staff-action-toggle ${isActive
                      ? "is-disable"
                      : "is-enable"
                    }`}
                  onClick={() =>
                    handleToggleStatus(
                      s.id
                    )
                  }
                  disabled={isStatusUpdating}
                  title={isActive
                    ? "Disable staff"
                    : "Activate staff"}
                >
                  {isActive ? (
                    <Ban size={16} />
                  ) : (
                    <CheckCircle size={16} />
                  )}
                </button>

              </div>

            </div>
          );
        })}

      </div>

      {/* MODAL */}
      {open && (
        <AddStaffModal
          onClose={() =>
            setOpen(false)
          }
          fetchStaff={fetchStaff}
          editData={editData}
        />
      )}

    </div>
  );
}

export default Staff;
