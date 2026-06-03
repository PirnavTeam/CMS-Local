export const clearAllSessions = () => {
  [
    "token",
    "adminToken",
    "doctorToken",
    "receptionistToken",
    "adminEmail",
    "doctorEmail",
    "receptionistEmail",
    "adminRole",
    "doctorRole",
    "receptionistRole",
    "userRole",
    "doctorId",
    "doctorName",
    "receptionistName",
    "hospitalId",
    "hospitalName",
  ].forEach((key) => localStorage.removeItem(key));
};

export const getRoleProfile = (roleType = "admin") => {
  if (roleType === "doctor") {
    const name = localStorage.getItem("doctorName") || "Doctor";
    return {
      roleType,
      roleLabel: "Doctor",
      name: `Dr. ${name}`.replace(/^Dr\. Dr\./, "Dr."),
      email: localStorage.getItem("doctorEmail") || "doctor account",
      profilePath: "/doctor/profile",
      passwordPath: "/doctor/profile?tab=password",
    };
  }

  if (roleType === "receptionist") {
    const email = localStorage.getItem("receptionistEmail") || "";
    return {
      roleType,
      roleLabel: "Receptionist",
      name: localStorage.getItem("receptionistName") || email || "Receptionist",
      email: email || "receptionist account",
      profilePath: "/reception/profile",
      passwordPath: "/reception/profile?tab=password",
    };
  }

  const email = localStorage.getItem("adminEmail") || "";
  const role = localStorage.getItem("adminRole") || "Admin";
  return {
    roleType: "admin",
    roleLabel: "Administrator",
    name: role || "Admin",
    email: email || "admin account",
    profilePath: "/profile",
    passwordPath: "/profile?tab=password",
  };
};

export const getInitials = (value) =>
  String(value || "U")
    .replace(/^Dr\.\s*/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

