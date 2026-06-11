import { apiUrl } from "../../config/api";

export const SUPER_ADMIN_API = {
  dashboard: "SuperAdmin/dashboard",
  dashboardCompat: "dashboard/dashboard",
  createClinicAdmin: "admins",
  superAdminClinics: "Clinics",
  admins: "admins",
  clinics: "Clinics",
  notifications: "notifications",
  auditLogs: "AuditLogs",
  loginHistory: "AuditLogs/login-history",
  dashboardSummary: "SuperAdmin/summary",
  dashboardSummaryCompat: "dashboard/summary",
  revenueOverview: "dashboard/revenue-overview",
  activities: "dashboard/activities",
  dailyAppointmentsReport: "Report/daily-appointments",
  revenueReport: "Report/revenue",
  doctorWiseReport: "Report/doctor-wise",
  reportsSummary: "SuperAdminReports/summary",
  reportsRevenueTrend: "SuperAdminReports/revenue-trend",
  reportsTopClinics: "SuperAdminReports/top-clinics",
  reportsUserActivity: "SuperAdminReports/user-activity",
  reportsRevenue: "reports/revenue",
  reportsActivity: "reports/activity",
  revenue: "revenue",
  billing: "Billing",
  roleNames: "roles/roles",
  roles: "roles",
  users: "users",
  settings: "settings",
  settingsGeneral: "settings/general",
  settingsEmail: "settings/email",
  settingsSms: "settings/sms",
  settingsPayment: "settings/payment",
};

const LOCAL_NOTIFICATIONS_KEY = "superadmin_notifications";
const LOCAL_AUDIT_LOGS_KEY = "superadmin_audit_logs";

const readLocalList = (key) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const writeLocalList = (key, items) => {
  localStorage.setItem(key, JSON.stringify(items));
};

const prependLocalItem = (key, item) => {
  const nextItems = [item, ...readLocalList(key)].slice(0, 100);
  writeLocalList(key, nextItems);
  return item;
};

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];

  const collectionKeys = [
    "data",
    "items",
    "results",
    "records",
    "clinics",
    "admins",
    "adminManagement",
    "adminManagements",
    "notifications",
    "logs",
    "auditLogs",
    "activities",
    "reports",
    "users",
    "roles",
    "topClinics",
    "revenueTrend",
    "userActivity",
    "summary",
  ];

  for (const key of collectionKeys) {
    if (Array.isArray(value[key])) return value[key];
  }

  return [];
};

const hasValue = (value) =>
  value !== undefined && value !== null && String(value).trim() !== "";

const asObject = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  for (const key of ["data", "result", "summary", "dashboard"]) {
    if (value[key] && typeof value[key] === "object" && !Array.isArray(value[key])) {
      return value[key];
    }
  }

  return value;
};

const pick = (source, keys, fallback = "") => {
  if (!source || typeof source !== "object") return fallback;

  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }

  return fallback;
};

const valuesEqual = (left, right) =>
  hasValue(left) && hasValue(right) && String(left) === String(right);

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const normalizeStatus = (value) => {
  if (typeof value === "boolean") return value ? "Active" : "Inactive";
  const status = String(value || "Active");
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const readJson = async (response) => {
  if (response.status === 204) return null;

  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const getValidationMessage = (payload) => {
  if (!payload || typeof payload !== "object") return "";

  if (payload.errors && typeof payload.errors === "object") {
    return Object.entries(payload.errors)
      .flatMap(([field, messages]) => {
        const fieldMessages = Array.isArray(messages) ? messages : [messages];
        return fieldMessages
          .filter(Boolean)
          .map((message) => `${field}: ${message}`);
      })
      .join(" ");
  }

  return "";
};

export const superAdminRequest = async (path, options = {}) => {
  const { body, headers, ...rest } = options;
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("superAdminToken");
  const response = await fetch(apiUrl(path), {
    ...rest,
    headers: {
      "ngrok-skip-browser-warning": "true",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await readJson(response);

  if (!response.ok) {
    const message =
      getValidationMessage(payload) ||
      pick(payload, ["message", "error", "title"], "") ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload;
};

const superAdminRequestFirst = async (paths, options = {}) => {
  const errors = [];

  for (const path of paths) {
    try {
      return await superAdminRequest(path, options);
    } catch (error) {
      errors.push(error);
    }
  }

  throw errors[errors.length - 1] || new Error("Request failed.");
};

export const normalizeClinic = (clinic = {}) => ({
  id: pick(clinic, ["id", "clinicId", "clinicID", "hospitalId", "hospitalID", "_id"]),
  name: pick(clinic, ["name", "clinicName", "clinic_name"]),
  address: pick(clinic, ["address", "clinicAddress", "location"]),
  contactNumber: pick(clinic, ["contactNumber", "phone", "phoneNumber", "mobile", "contact"]),
  email: pick(clinic, ["email", "clinicEmail"]),
  status: normalizeStatus(pick(clinic, ["status", "isActive", "active"], "Active")),
  revenue: toNumber(pick(clinic, ["revenue", "totalRevenue"], 0)),
  users: toNumber(pick(clinic, ["users", "userCount", "totalUsers"], 0)),
  raw: clinic,
});

export const normalizeAdmin = (admin = {}) => ({
  id: pick(admin, ["id", "adminId", "adminID", "userId", "_id"]),
  name: pick(admin, ["name", "fullName", "adminName", "AdminName", "userName"]),
  email: pick(admin, ["email", "emailAddress", "adminEmail", "AdminEmail"]),
  phone: pick(admin, ["phone", "phoneNumber", "mobile", "mobileNumber", "MobileNumber", "adminMobileNumber", "AdminMobileNumber"]),
  assignedClinic: pick(admin, ["assignedClinic", "clinicName", "ClinicName", "hospitalName", "HospitalName", "clinic"]),
  assignedClinicId: pick(admin, ["clinicId", "hospitalId", "assignedClinicId", "ClinicId", "HospitalId"]),
  role: "Admin",
  status: normalizeStatus(pick(admin, ["status", "isActive", "active"], "Active")),
  raw: admin,
});

const buildAdminPayload = (admin = {}, { includeBlankPassword = true } = {}) => {
  const fullName = String(
    pick(admin, ["fullName", "name", "AdminName", "adminName"], "")
  ).trim();
  const password = pick(
    admin,
    ["password", "temporaryPassword", "Password", "TemporaryPassword", "AdminPassword"],
    ""
  );

  const payload = {
    name: String(pick(admin, ["name", "fullName", "AdminName", "adminName"], fullName)).trim(),
    fullName,
    phone: String(
      pick(
        admin,
        ["phone", "phoneNumber", "mobile", "MobileNumber", "AdminMobileNumber", "adminMobileNumber"],
        ""
      )
    ).trim(),
    email: String(pick(admin, ["email", "AdminEmail", "adminEmail"], "")).trim(),
    password,
    temporaryPassword: pick(admin, ["temporaryPassword", "TemporaryPassword"], password),
    role: pick(admin, ["role", "Role", "AdminRole"], "Admin"),
    hospitalId: Number(pick(admin, ["hospitalId", "clinicId", "assignedClinicId", "HospitalId", "ClinicId"], 0)) || 0,
    sendWelcomeEmail: pick(admin, ["sendWelcomeEmail"], true) !== false,
  };

  if (!includeBlankPassword && !payload.password) {
    delete payload.password;
    delete payload.temporaryPassword;
  }

  return payload;
};

export const normalizeActivity = (activity = {}, index = 0) => ({
  id: pick(activity, ["id", "activityId", "_id"], index),
  title: pick(activity, ["title", "event", "action"], "Activity"),
  detail: pick(activity, ["detail", "description", "message"], ""),
  time: formatDateTime(pick(activity, ["time", "createdAt", "timestamp"], "")),
});

export const normalizeRevenuePoint = (point = {}, index = 0) => ({
  name: pick(point, ["name", "month", "date", "label"], `Item ${index + 1}`),
  revenue: toNumber(pick(point, ["revenue", "totalRevenue", "amount"], 0)),
  users: toNumber(pick(point, ["users", "userCount", "totalUsers", "activity"], 0)),
});

export const normalizeAuditLog = (log = {}) => ({
  id: pick(log, ["id", "logId", "_id"]),
  user: pick(log, ["user", "userName", "name", "email"], "System"),
  action: pick(log, ["action", "activity", "message", "description"]),
  timestamp: formatDateTime(pick(log, ["timestamp", "createdAt", "date"])),
  module: pick(log, ["module", "moduleName", "category"], "Audit"),
});

export const normalizeLoginLog = (log = {}, index = 0) => ({
  id: pick(log, ["id", "logId", "_id"], `login-${index}`),
  user: pick(log, ["user", "userName", "name", "email", "emailAddress"], "Unknown user"),
  action: pick(log, ["action", "activity", "message", "description"], "Logged in"),
  timestamp: formatDateTime(pick(log, ["timestamp", "createdAt", "date", "loginTime", "time"])),
  module: "Login",
  ipAddress: pick(log, ["ipAddress", "ip", "clientIp"], ""),
  role: pick(log, ["role", "roleName", "userRole"], ""),
});

export const normalizeNotification = (notification = {}) => ({
  id: pick(notification, ["id", "notificationId", "_id"]),
  title: pick(notification, ["title", "subject"], "Notification"),
  message: pick(notification, ["message", "body", "description"]),
  targetUsers: pick(notification, ["targetUsers", "audience", "target", "recipient"], "All Clinics"),
  status: normalizeStatus(pick(notification, ["status", "state"], "Sent")),
});

export const normalizeReportRow = (row = {}, index = 0) => ({
  id: pick(row, ["id", "clinicId", "_id"], index),
  name: pick(row, ["name", "clinic", "clinicName", "label"], `Report ${index + 1}`),
  adminName: pick(row, ["adminName", "admin", "createdBy", "userName"], ""),
  adminEmail: pick(row, ["adminEmail", "email", "createdByEmail"], ""),
  revenue: toNumber(pick(row, ["revenue", "totalRevenue", "amount"], 0)),
  users: toNumber(pick(row, ["users", "userCount", "activity", "totalUsers"], 0)),
  invoiceCount: toNumber(pick(row, ["invoiceCount", "invoices", "billingCount"], 0)),
  status: normalizeStatus(pick(row, ["status", "isActive", "active"], "Active")),
});

const getBillingAmount = (item = {}) =>
  toNumber(
    pick(
      item,
      [
        "totalAmount",
        "grandTotal",
        "total",
        "amount",
        "paidAmount",
        "paymentAmount",
        "revenue",
        "consultationCharge",
      ],
      0
    )
  );

const getBillingDate = (item = {}) =>
  pick(item, ["createdAt", "paidAt", "paymentDate", "invoiceDate", "date", "appointmentDate"], "");

const getMonthLabel = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
};

const getBillingClinicId = (item = {}) =>
  String(pick(item, ["clinicId", "hospitalId", "assignedClinicId", "clinicID", "hospitalID"], ""));

const getBillingClinicName = (item = {}) =>
  pick(item, ["clinicName", "hospitalName", "clinic", "assignedClinic"], "");

const getBillingAdminKey = (item = {}) =>
  String(
    pick(item, ["adminId", "createdById", "userId", "createdBy", "adminEmail", "createdByEmail"], "")
  );

const buildRevenueChart = (billingRows = []) => {
  const byMonth = new Map();

  billingRows.forEach((item) => {
    const month = getMonthLabel(getBillingDate(item));
    const current = byMonth.get(month) || { name: month, revenue: 0, users: 0 };
    current.revenue += getBillingAmount(item);
    current.users += 1;
    byMonth.set(month, current);
  });

  return Array.from(byMonth.values());
};

const buildAdminRevenueRows = ({ billingRows = [], clinicRows = [], adminRows = [] }) => {
  const clinics = clinicRows.map(normalizeClinic);
  const admins = adminRows.map(normalizeAdmin);
  const clinicById = new Map(clinics.map((clinic) => [String(clinic.id), clinic]));
  const clinicByName = new Map(clinics.map((clinic) => [String(clinic.name).toLowerCase(), clinic]));
  const adminByClinicId = new Map();
  const adminByClinicName = new Map();

  admins.forEach((admin) => {
    const clinicId = pick(admin.raw, ["clinicId", "hospitalId", "assignedClinicId"], "");
    if (clinicId) adminByClinicId.set(String(clinicId), admin);
    if (admin.assignedClinic) {
      adminByClinicName.set(String(admin.assignedClinic).toLowerCase(), admin);
    }
  });

  const rows = new Map();

  billingRows.forEach((item, index) => {
    const clinicId = getBillingClinicId(item);
    const rawClinicName = getBillingClinicName(item);
    const clinic =
      (clinicId && clinicById.get(String(clinicId))) ||
      (rawClinicName && clinicByName.get(String(rawClinicName).toLowerCase())) ||
      {};
    const clinicName = clinic.name || rawClinicName || "Unassigned Clinic";
    const admin =
      (clinicId && adminByClinicId.get(String(clinicId))) ||
      adminByClinicName.get(String(clinicName).toLowerCase()) ||
      {};
    const directAdminName = pick(item, ["adminName", "createdBy", "userName"], "");
    const directAdminEmail = pick(item, ["adminEmail", "createdByEmail", "email"], "");
    const key = getBillingAdminKey(item) || admin.id || `${clinicName}-${directAdminName || index}`;
    const current =
      rows.get(key) || {
        id: key,
        name: clinicName,
        adminName: admin.name || directAdminName || "Admin",
        adminEmail: admin.email || directAdminEmail || "",
        revenue: 0,
        users: 0,
        invoiceCount: 0,
        status: clinic.status || "Active",
      };

    current.revenue += getBillingAmount(item);
    current.invoiceCount += 1;
    current.users = Math.max(current.users, toNumber(pick(clinic, ["users"], 0)));
    rows.set(key, current);
  });

  if (!rows.size) {
    admins.forEach((admin) => {
      rows.set(admin.id || admin.email, {
        id: admin.id || admin.email,
        name: admin.assignedClinic || "Unassigned Clinic",
        adminName: admin.name || "Admin",
        adminEmail: admin.email || "",
        revenue: 0,
        users: 0,
        invoiceCount: 0,
        status: admin.status || "Active",
      });
    });
  }

  return Array.from(rows.values());
};

export const normalizeRole = (role = {}, index = 0) => {
  if (typeof role === "string") {
    return {
      id: "",
      key: `role-${index}-${role || "role"}`,
      canPersistPermissions: false,
      name: role || "Role",
      roleName: role || "Role",
      module: "General",
      users: 0,
      status: "Active",
      permissions: ["View"],
      raw: role,
    };
  }

  const permissions = pick(role, ["permissions", "permissionNames", "claims"], []);
  const normalizedPermissions = Array.isArray(permissions)
    ? permissions.map((permission) =>
        typeof permission === "string"
          ? permission
          : pick(permission, ["name", "permission", "claimValue", "value"])
      )
    : [];
  const booleanPermissions = [
    pick(role, ["canView"], false) ? "View" : "",
    pick(role, ["canCreate"], false) ? "Create" : "",
    pick(role, ["canEdit"], false) ? "Edit" : "",
    pick(role, ["canDelete"], false) ? "Delete" : "",
  ].filter(Boolean);

  const id = pick(role, ["id", "roleId", "_id"], "");
  const name = pick(role, ["name", "roleName", "title"], "Role");
  const roleName = pick(role, ["roleName", "name", "title"], "Role");

  return {
    id,
    key: id || `role-${index}-${roleName || name}`,
    canPersistPermissions: hasValue(id) && ![name, roleName].includes(String(id)),
    name,
    roleName,
    module: pick(role, ["module", "moduleName"], ""),
    users: toNumber(pick(role, ["users", "userCount", "assignedUsers", "totalUsers"], 0)),
    status: normalizeStatus(pick(role, ["status", "isActive", "active"], "Active")),
    permissions: normalizedPermissions.filter(Boolean).length
      ? normalizedPermissions.filter(Boolean)
      : booleanPermissions,
    raw: role,
  };
};

const buildRolePayload = (role = {}) => {
  const permissions = Array.isArray(role.permissions) ? role.permissions : [];
  const roleName = String(pick(role, ["roleName", "name"], "")).trim();
  const module = String(pick(role, ["module"], "")).trim();

  return {
    roleName: roleName || "Role",
    module: module || "General",
    status: String(pick(role, ["status"], "Active") || "Active"),
    canView: permissions.includes("View") || pick(role, ["canView"], false) === true,
    canCreate: permissions.includes("Create") || pick(role, ["canCreate"], false) === true,
    canEdit: permissions.includes("Edit") || pick(role, ["canEdit"], false) === true,
    canDelete: permissions.includes("Delete") || pick(role, ["canDelete"], false) === true,
  };
};

const isDeletedRecord = (record = {}) => {
  const deletedValue = pick(
    record,
    ["isDeleted", "deleted", "isRemoved", "removed", "IsDeleted", "Deleted"],
    false
  );
  const status = String(pick(record, ["status", "Status"], "")).trim().toLowerCase();

  return (
    deletedValue === true ||
    deletedValue === 1 ||
    String(deletedValue).toLowerCase() === "true" ||
    status === "deleted" ||
    hasValue(pick(record, ["deletedAt", "DeletedAt", "removedAt"], ""))
  );
};

export const normalizeUser = (user = {}, index = 0) => ({
  id: pick(user, ["id", "userId", "_id"], index),
  name: pick(user, ["name", "fullName", "userName", "displayName"], "User"),
  email: pick(user, ["email", "emailAddress"]),
  clinic: pick(user, ["clinic", "clinicName", "assignedClinic", "clinicId"]),
  hospitalId: pick(user, ["hospitalId", "HospitalId"], 0),
  clinicId: pick(user, ["clinicId", "ClinicId"], 0),
  type: pick(user, ["type", "userType", "role", "roleName"], "User"),
  role: pick(user, ["role", "roleName", "type", "userType"], "User"),
  status: normalizeStatus(pick(user, ["status", "isActive", "active"], "Active")),
  lastActive: formatDateTime(pick(user, ["lastActive", "lastLogin", "lastSeen", "updatedAt"], "")),
  phone: pick(user, ["phone", "phoneNumber", "mobile", "contactNumber"]),
  mobileNumber: pick(user, ["mobileNumber", "mobile", "phoneNumber", "phone"]),
  isDeleted: isDeletedRecord(user),
  raw: user,
});

const buildUserPayload = (user = {}, { includeBlankPassword = true } = {}) => {
  const phone = String(pick(user, ["phone", "phoneNumber", "mobile", "contactNumber"], "")).trim();
  const mobileNumber = String(pick(user, ["mobileNumber", "mobile", "phoneNumber", "phone"], phone)).trim();
  const type = pick(user, ["type", "userType"], pick(user, ["role", "roleName"], "User"));
  const role = pick(user, ["role", "roleName"], type);

  const payload = {
    name: String(pick(user, ["name", "fullName", "userName", "displayName"], "")).trim(),
    email: String(pick(user, ["email", "emailAddress"], "")).trim(),
    clinic: String(pick(user, ["clinic", "clinicName", "assignedClinic"], "")).trim(),
    hospitalId: Number(pick(user, ["hospitalId", "HospitalId"], 0)) || 0,
    clinicId: Number(pick(user, ["clinicId", "ClinicId", "hospitalId", "HospitalId"], 0)) || 0,
    type,
    role,
    status: pick(user, ["status"], "Active"),
    phone,
    mobileNumber,
    password: pick(user, ["password", "Password"], ""),
  };

  if (!includeBlankPassword && !payload.password) {
    delete payload.password;
  }

  return payload;
};

const normalizeSettingsSection = (section = {}, defaults = {}) => ({
  ...defaults,
  ...section,
  name: pick(section, ["name", "platformName", "senderName", "providerName", "gatewayName"], defaults.name || ""),
  status: pick(section, ["status", "enabled", "isEnabled"], defaults.status || "Enabled"),
  notes: pick(section, ["notes", "configurationNotes", "description"], defaults.notes || ""),
});

export const normalizeSettings = (settings = {}) => {
  const payload = asObject(settings);

  return {
    general: normalizeSettingsSection(payload.general || payload.generalSettings || payload, {
      name: "CMS Platform",
      status: "Enabled",
      notes: "Update general settings used across all clinics.",
    }),
    email: normalizeSettingsSection(payload.email || payload.emailSettings, {
      name: "",
      status: "Enabled",
      notes: "Update email settings used across all clinics.",
    }),
    sms: normalizeSettingsSection(payload.sms || payload.smsSettings, {
      name: "",
      status: "Enabled",
      notes: "Update sms settings used across all clinics.",
    }),
    payment: normalizeSettingsSection(payload.payment || payload.paymentSettings, {
      name: "",
      status: "Enabled",
      notes: "Update payment settings used across all clinics.",
    }),
  };
};

export const fetchClinics = async () =>
  asArray(await superAdminRequest(SUPER_ADMIN_API.clinics)).map(normalizeClinic);

export const fetchClinic = async (id) =>
  normalizeClinic(await superAdminRequest(`${SUPER_ADMIN_API.clinics}/${id}`));

export const saveClinic = async (clinic, id) =>
  superAdminRequest(id ? `${SUPER_ADMIN_API.clinics}/${id}` : SUPER_ADMIN_API.clinics, {
    method: id ? "PUT" : "POST",
    body: clinic,
  });

export const deleteClinic = async (id) =>
  superAdminRequest(`${SUPER_ADMIN_API.clinics}/${id}`, { method: "DELETE" });

export const updateClinicStatus = async (id, status) =>
  superAdminRequest(`${SUPER_ADMIN_API.clinics}/${id}/status`, {
    method: "PATCH",
    body: { status },
  });

export const fetchAdmins = async () =>
  asArray(await superAdminRequest(SUPER_ADMIN_API.admins)).map(normalizeAdmin);

export const fetchAdmin = async (id) =>
  normalizeAdmin(await superAdminRequest(`${SUPER_ADMIN_API.admins}/${id}`));

export const createClinicAdmin = async (admin) =>
  superAdminRequest(SUPER_ADMIN_API.createClinicAdmin, {
    method: "POST",
    body: buildAdminPayload(admin),
  });

export const saveAdmin = async (admin, id) =>
  superAdminRequest(id ? `${SUPER_ADMIN_API.admins}/${id}` : SUPER_ADMIN_API.admins, {
    method: id ? "PUT" : "POST",
    body: buildAdminPayload(admin, { includeBlankPassword: !id }),
  });

const getEntityId = (item = {}) =>
  pick(item, ["id", "doctorId", "receptionistId", "userId", "_id"], "");

const getEntityClinicId = (item = {}) =>
  pick(item, ["clinicId", "hospitalId", "assignedClinicId", "ClinicId", "HospitalId"], "");

const getEntityClinicName = (item = {}) =>
  pick(item, ["clinicName", "hospitalName", "assignedClinic", "clinic", "ClinicName"], "");

const isAdminOwnedStaff = (item = {}, admin = {}) => {
  const adminId = pick(admin.raw || admin, ["id", "adminId", "userId", "_id"], admin.id);
  const adminEmail = pick(admin.raw || admin, ["email", "adminEmail", "AdminEmail"], admin.email);
  const adminName = pick(admin.raw || admin, ["name", "adminName", "AdminName", "fullName"], admin.name);
  const ownerId = pick(item, ["adminId", "createdById", "userId", "AdminId"], "");
  const ownerEmail = pick(item, ["adminEmail", "createdByEmail", "AdminEmail"], "");
  const ownerName = pick(item, ["adminName", "createdBy", "userName", "AdminName"], "");

  return (
    valuesEqual(ownerId, adminId) ||
    valuesEqual(ownerEmail, adminEmail) ||
    valuesEqual(ownerName, adminName)
  );
};

const isStaffInClinic = (item = {}, clinicId, clinicName) =>
  valuesEqual(getEntityClinicId(item), clinicId) ||
  valuesEqual(String(getEntityClinicName(item)).toLowerCase(), String(clinicName || "").toLowerCase());

const getAdminOwnerFields = (admin = {}) => ({
  adminId: pick(admin.raw || admin, ["id", "adminId", "userId", "_id"], admin.id),
  adminEmail: pick(admin.raw || admin, ["email", "adminEmail", "AdminEmail"], admin.email),
  adminName: pick(admin.raw || admin, ["name", "adminName", "AdminName", "fullName"], admin.name),
});

const buildDoctorClinicUpdateBody = (doctor = {}, clinicId, clinicName, admin = {}) => {
  const body = new FormData();
  const owner = getAdminOwnerFields(admin);
  const fields = {
    Name: pick(doctor, ["name", "Name"], ""),
    Specialization: pick(doctor, ["specialization", "Specialization"], ""),
    Experience: pick(doctor, ["experience", "Experience"], 0),
    Fees: pick(doctor, ["fees", "Fees"], 0),
    Email: pick(doctor, ["email", "Email"], ""),
    Phone: pick(doctor, ["phone", "Phone"], ""),
    Password: "",
    IsActive:
      typeof doctor.isActive === "boolean"
        ? String(doctor.isActive)
        : String(pick(doctor, ["isActive", "status"], "true")).toLowerCase() !== "inactive",
    HospitalId: clinicId,
    ClinicId: clinicId,
    HospitalName: clinicName,
    ClinicName: clinicName,
    AdminId: owner.adminId,
    AdminEmail: owner.adminEmail,
    AdminName: owner.adminName,
  };

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) body.append(key, String(value));
  });

  return body;
};

const buildReceptionistClinicUpdateBody = (receptionist = {}, clinicId, clinicName, admin = {}) => {
  const owner = getAdminOwnerFields(admin);

  return {
    ...receptionist,
    password: "",
    hospitalId: clinicId,
    clinicId,
    assignedClinicId: clinicId,
    hospitalName: clinicName,
    clinicName,
    assignedClinic: clinicName,
    adminId: owner.adminId,
    adminEmail: owner.adminEmail,
    adminName: owner.adminName,
  };
};

const updateStaffClinic = async ({ path, item, admin, clinicId, clinicName, buildBody }) => {
  const id = getEntityId(item);
  if (!id) return false;

  const body = buildBody(item, clinicId, clinicName, admin);
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("superAdminToken");
  const response = await fetch(apiUrl(`${path}/${id}`), {
    method: "PUT",
    headers:
      body instanceof FormData
        ? {
            "ngrok-skip-browser-warning": "true",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          }
        : {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
    body: body instanceof FormData ? body : JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Unable to update ${path.toLowerCase()} ${id}.`);
  }

  return true;
};

export const syncAdminStaffClinic = async ({
  admin,
  previousClinicId,
  previousClinicName,
  clinicId,
  clinicName,
}) => {
  if (!hasValue(clinicId)) {
    return { updated: 0 };
  }

  const [doctorsResult, receptionistsResult] = await Promise.allSettled([
    superAdminRequest("Doctor"),
    superAdminRequest("Receptionist"),
  ]);
  const staffGroups = [
    {
      path: "Doctor",
      rows: doctorsResult.status === "fulfilled" ? asArray(doctorsResult.value) : [],
      buildBody: buildDoctorClinicUpdateBody,
    },
    {
      path: "Receptionist",
      rows: receptionistsResult.status === "fulfilled" ? asArray(receptionistsResult.value) : [],
      buildBody: buildReceptionistClinicUpdateBody,
    },
  ];
  const updates = [];

  staffGroups.forEach(({ path, rows, buildBody }) => {
    const ownedRows = rows.filter((item) => isAdminOwnedStaff(item, admin));
    const targetRows = ownedRows.length
      ? ownedRows
      : rows.filter((item) => isStaffInClinic(item, previousClinicId, previousClinicName));

    targetRows.forEach((item) => {
      if (!isStaffInClinic(item, clinicId, clinicName)) {
        updates.push(updateStaffClinic({ path, item, admin, clinicId, clinicName, buildBody }));
      }
    });
  });

  const results = await Promise.allSettled(updates);
  const failed = results.filter((result) => result.status === "rejected");

  if (failed.length) {
    throw new Error(failed[0].reason?.message || "Admin updated, but staff clinic sync failed.");
  }

  return { updated: results.length };
};

export const deleteAdmin = async (id) =>
  superAdminRequest(`${SUPER_ADMIN_API.admins}/${id}`, { method: "DELETE" });

export const fetchNotifications = async () => {
  const localNotifications = readLocalList(LOCAL_NOTIFICATIONS_KEY).map(normalizeNotification);

  try {
    const remoteNotifications = asArray(
      await superAdminRequest(SUPER_ADMIN_API.notifications)
    ).map(normalizeNotification);

    return [...localNotifications, ...remoteNotifications];
  } catch (error) {
    if (localNotifications.length) return localNotifications;
    throw error;
  }
};

export const createNotification = async (notification) => {
  const createdAt = new Date().toISOString();
  const localNotification = normalizeNotification({
    ...notification,
    id: `local-notification-${Date.now()}`,
    createdAt,
  });

  prependLocalItem(LOCAL_NOTIFICATIONS_KEY, localNotification);

  try {
    return await superAdminRequest(SUPER_ADMIN_API.notifications, {
      method: "POST",
      body: notification,
    });
  } catch (error) {
    return localNotification;
  }
};

export const recordAuditLog = (log) =>
  prependLocalItem(LOCAL_AUDIT_LOGS_KEY, {
    id: `local-audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    ...log,
  });

export const createAuditLog = async (log) =>
  superAdminRequest(SUPER_ADMIN_API.auditLogs, {
    method: "POST",
    body: log,
  });

export const fetchAuditLog = async (id) =>
  normalizeAuditLog(await superAdminRequest(`${SUPER_ADMIN_API.auditLogs}/${id}`));

export const deleteAuditLog = async (id) =>
  superAdminRequest(`${SUPER_ADMIN_API.auditLogs}/${id}`, { method: "DELETE" });

export const createNotificationRemote = async (notification) =>
  superAdminRequest(SUPER_ADMIN_API.notifications, {
    method: "POST",
    body: notification,
  });

export const fetchAuditLogs = async () => {
  const [auditResult, loginResult] = await Promise.allSettled([
    superAdminRequest(SUPER_ADMIN_API.auditLogs),
    superAdminRequest(SUPER_ADMIN_API.loginHistory),
  ]);

  const auditLogs =
    auditResult.status === "fulfilled"
      ? asArray(auditResult.value).map(normalizeAuditLog)
      : [];
  const loginLogs =
    loginResult.status === "fulfilled"
      ? asArray(loginResult.value).map(normalizeLoginLog)
      : [];
  const localLogs = readLocalList(LOCAL_AUDIT_LOGS_KEY).map(normalizeAuditLog);
  const logs = [...localLogs, ...loginLogs, ...auditLogs];

  if (!logs.length && auditResult.status === "rejected" && loginResult.status === "rejected") {
    throw auditResult.reason;
  }

  return logs;
};

export const fetchRoles = async () => {
  try {
    return asArray(await superAdminRequest(SUPER_ADMIN_API.roles)).map(normalizeRole);
  } catch (error) {
    const fallbackRoles = asArray(
      await superAdminRequest(SUPER_ADMIN_API.roleNames)
    ).map(normalizeRole);

    return fallbackRoles;
  }
};

export const fetchRoleNames = async () =>
  asArray(await superAdminRequest(SUPER_ADMIN_API.roleNames)).map((role, index) =>
    typeof role === "string" ? role : normalizeRole(role, index).name
  );

export const fetchRole = async (id) =>
  normalizeRole(await superAdminRequest(`${SUPER_ADMIN_API.roles}/${id}`));

export const saveRole = async (role, id) =>
  superAdminRequest(id ? `${SUPER_ADMIN_API.roles}/${id}` : SUPER_ADMIN_API.roles, {
    method: id ? "PUT" : "POST",
    body: buildRolePayload(role),
  });

export const deleteRole = async (id) =>
  superAdminRequest(`${SUPER_ADMIN_API.roles}/${id}`, { method: "DELETE" });

export const updateRolePermissions = async (id, role) =>
  superAdminRequest(`${SUPER_ADMIN_API.roles}/${id}/permissions`, {
    method: "PUT",
    body: buildRolePayload(role),
  });

export const fetchUsers = async () =>
  asArray(await superAdminRequest(SUPER_ADMIN_API.users))
    .map(normalizeUser)
    .filter((user) => !user.isDeleted);

export const fetchUser = async (id) =>
  normalizeUser(await superAdminRequest(`${SUPER_ADMIN_API.users}/${id}`));

export const saveUser = async (user, id) =>
  superAdminRequest(id ? `${SUPER_ADMIN_API.users}/${id}` : SUPER_ADMIN_API.users, {
    method: id ? "PUT" : "POST",
    body: buildUserPayload(user, { includeBlankPassword: !id }),
  });

export const deleteUser = async (id) =>
  superAdminRequest(`${SUPER_ADMIN_API.users}/${id}`, { method: "DELETE" });

export const updateUserStatus = async (id, status) =>
  superAdminRequest(`${SUPER_ADMIN_API.users}/${id}/status`, {
    method: "PUT",
    body: { status },
  });

export const fetchSettings = async () =>
  normalizeSettings(await superAdminRequest(SUPER_ADMIN_API.settings));

export const updateGeneralSettings = async (settings) =>
  superAdminRequest(SUPER_ADMIN_API.settingsGeneral, {
    method: "PUT",
    body: settings,
  });

export const updateEmailSettings = async (settings) =>
  superAdminRequest(SUPER_ADMIN_API.settingsEmail, {
    method: "PUT",
    body: settings,
  });

export const updateSmsSettings = async (settings) =>
  superAdminRequest(SUPER_ADMIN_API.settingsSms, {
    method: "PUT",
    body: settings,
  });

export const updatePaymentSettings = async (settings) =>
  superAdminRequest(SUPER_ADMIN_API.settingsPayment, {
    method: "PUT",
    body: settings,
  });

export const fetchDashboardData = async () => {
  const [dashboard, summary, reportsSummary, revenueTrend, userActivity, billing] = await Promise.allSettled([
    superAdminRequestFirst([SUPER_ADMIN_API.dashboard, SUPER_ADMIN_API.dashboardCompat]),
    superAdminRequestFirst([SUPER_ADMIN_API.dashboardSummary, SUPER_ADMIN_API.dashboardSummaryCompat]),
    superAdminRequest(SUPER_ADMIN_API.reportsSummary),
    superAdminRequest(SUPER_ADMIN_API.reportsRevenueTrend),
    superAdminRequest(SUPER_ADMIN_API.reportsUserActivity),
    superAdminRequest(SUPER_ADMIN_API.billing),
  ]);

  const dashboardData = dashboard.status === "fulfilled" ? asObject(dashboard.value) : {};
  const summaryData = {
    ...(reportsSummary.status === "fulfilled" ? asObject(reportsSummary.value) : {}),
    ...(summary.status === "fulfilled" ? asObject(summary.value) : {}),
  };
  const revenueData = revenueTrend.status === "fulfilled" ? revenueTrend.value : [];
  const activityData = userActivity.status === "fulfilled" ? userActivity.value : [];
  const billingRows = billing.status === "fulfilled" ? asArray(billing.value) : [];
  const totalRevenue = billingRows.reduce((sum, item) => sum + getBillingAmount(item), 0);
  const nextSummary = {
    ...summaryData,
    totalRevenue: getDashboardMetric({ ...dashboardData, ...summaryData }, ["totalRevenue", "revenue", "revenueSummary"]) || totalRevenue,
  };

  return {
    dashboard: dashboardData,
    summary: nextSummary,
    revenueData: asArray(revenueData).length
      ? asArray(revenueData).map(normalizeRevenuePoint)
      : buildRevenueChart(billingRows),
    activities: asArray(activityData).map(normalizeActivity),
    error:
      dashboard.status === "rejected" &&
      summary.status === "rejected" &&
      reportsSummary.status === "rejected" &&
      revenueTrend.status === "rejected" &&
      userActivity.status === "rejected" &&
      billing.status === "rejected"
        ? dashboard.reason.message
        : "",
  };
};

export const fetchReports = async () => {
  const [summary, revenueTrend, topClinics, userActivity, revenue, activity, billing, clinics, admins] = await Promise.allSettled([
    superAdminRequest(SUPER_ADMIN_API.reportsSummary),
    superAdminRequest(SUPER_ADMIN_API.reportsRevenueTrend),
    superAdminRequest(SUPER_ADMIN_API.reportsTopClinics),
    superAdminRequest(SUPER_ADMIN_API.reportsUserActivity),
    superAdminRequest(SUPER_ADMIN_API.reportsRevenue),
    superAdminRequest(SUPER_ADMIN_API.reportsActivity),
    superAdminRequest(SUPER_ADMIN_API.billing),
    superAdminRequest(SUPER_ADMIN_API.clinics),
    superAdminRequest(SUPER_ADMIN_API.admins),
  ]);

  const topClinicRows = topClinics.status === "fulfilled" ? asArray(topClinics.value) : [];
  const revenueRows =
    revenue.status === "fulfilled"
      ? asArray(revenue.value)
      : revenueTrend.status === "fulfilled"
        ? asArray(revenueTrend.value)
        : [];
  const activityRows =
    activity.status === "fulfilled"
      ? asArray(activity.value)
      : userActivity.status === "fulfilled"
        ? asArray(userActivity.value)
        : [];
  const billingRows = billing.status === "fulfilled" ? asArray(billing.value) : [];
  const clinicRows = clinics.status === "fulfilled" ? asArray(clinics.value) : [];
  const adminRows = admins.status === "fulfilled" ? asArray(admins.value) : [];
  const rows = topClinicRows.length
    ? topClinicRows.map(normalizeReportRow)
    : revenueRows.length
      ? revenueRows.map(normalizeReportRow)
    : buildAdminRevenueRows({ billingRows, clinicRows, adminRows });

  return {
    rows,
    chartData: revenueRows.length
      ? revenueRows.map(normalizeRevenuePoint)
      : activityRows.length
        ? activityRows.map(normalizeRevenuePoint)
      : buildRevenueChart(billingRows),
    error:
      summary.status === "rejected" &&
      revenueTrend.status === "rejected" &&
      topClinics.status === "rejected" &&
      userActivity.status === "rejected" &&
      revenue.status === "rejected" &&
      activity.status === "rejected" &&
      billing.status === "rejected" &&
      clinics.status === "rejected" &&
      admins.status === "rejected"
        ? revenueTrend.reason?.message || revenue.reason.message
        : "",
  };
};

export const getDashboardMetric = (source, keys, fallback = 0) =>
  toNumber(pick(source, keys, fallback));
