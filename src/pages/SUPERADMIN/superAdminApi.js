import { apiUrl } from "../../config/api";

export const SUPER_ADMIN_API = {
  dashboard: "SuperAdmin/dashboard",
  createClinicAdmin: "SuperAdmin/create-clinic-admin",
  superAdminClinics: "SuperAdmin/clinics",
  admins: "SuperAdmin/admins",
  clinics: "clinics",
  notifications: "notifications",
  auditLogs: "logs/audit",
  loginHistory: "logs/login-history",
  dashboardSummary: "dashboard/summary",
  revenueOverview: "dashboard/revenue-overview",
  activities: "dashboard/activities",
  dailyAppointmentsReport: "Report/daily-appointments",
  revenueReport: "Report/revenue",
  doctorWiseReport: "Report/doctor-wise",
  reportsRevenue: "reports/revenue",
  reportsActivity: "reports/activity",
  revenue: "revenue",
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
    "notifications",
    "logs",
    "activities",
    "reports",
    "users",
  ];

  for (const key of collectionKeys) {
    if (Array.isArray(value[key])) return value[key];
  }

  return [];
};

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
  const response = await fetch(apiUrl(path), {
    ...rest,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
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
  id: pick(admin, ["id", "adminId", "userId", "_id"]),
  name: pick(admin, ["name", "fullName", "adminName", "userName"]),
  email: pick(admin, ["email", "emailAddress"]),
  assignedClinic: pick(admin, ["assignedClinic", "clinicName", "clinic", "clinicId"]),
  role: pick(admin, ["role", "roleName"], "Clinic Admin"),
  status: normalizeStatus(pick(admin, ["status", "isActive", "active"], "Active")),
  raw: admin,
});

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
  revenue: toNumber(pick(row, ["revenue", "totalRevenue", "amount"], 0)),
  users: toNumber(pick(row, ["users", "userCount", "activity", "totalUsers"], 0)),
  status: normalizeStatus(pick(row, ["status", "isActive", "active"], "Active")),
});

export const normalizeRole = (role = {}, index = 0) => {
  const permissions = pick(role, ["permissions", "permissionNames", "claims"], []);
  const normalizedPermissions = Array.isArray(permissions)
    ? permissions.map((permission) =>
        typeof permission === "string"
          ? permission
          : pick(permission, ["name", "permission", "claimValue", "value"])
      )
    : [];

  return {
    id: pick(role, ["id", "roleId", "_id"], index),
    name: pick(role, ["name", "roleName", "title"], "Role"),
    users: toNumber(pick(role, ["users", "userCount", "assignedUsers", "totalUsers"], 0)),
    status: normalizeStatus(pick(role, ["status", "isActive", "active"], "Active")),
    permissions: normalizedPermissions.filter(Boolean),
    raw: role,
  };
};

export const normalizeUser = (user = {}, index = 0) => ({
  id: pick(user, ["id", "userId", "_id"], index),
  name: pick(user, ["name", "fullName", "userName", "displayName"], "User"),
  email: pick(user, ["email", "emailAddress"]),
  clinic: pick(user, ["clinic", "clinicName", "assignedClinic", "clinicId"]),
  type: pick(user, ["type", "userType", "role", "roleName"], "User"),
  status: normalizeStatus(pick(user, ["status", "isActive", "active"], "Active")),
  lastActive: formatDateTime(pick(user, ["lastActive", "lastLogin", "lastSeen", "updatedAt"], "")),
  phone: pick(user, ["phone", "phoneNumber", "mobile", "contactNumber"]),
  raw: user,
});

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
      name: "MediCore Platform",
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

export const fetchAdmins = async () =>
  asArray(await superAdminRequest(SUPER_ADMIN_API.admins)).map(normalizeAdmin);

export const createClinicAdmin = async (admin) =>
  superAdminRequest(SUPER_ADMIN_API.createClinicAdmin, {
    method: "POST",
    body: admin,
  });

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

export const fetchRoles = async () =>
  asArray(await superAdminRequest(SUPER_ADMIN_API.roles)).map(normalizeRole);

export const fetchRole = async (id) =>
  normalizeRole(await superAdminRequest(`${SUPER_ADMIN_API.roles}/${id}`));

export const saveRole = async (role, id) =>
  superAdminRequest(id ? `${SUPER_ADMIN_API.roles}/${id}` : SUPER_ADMIN_API.roles, {
    method: id ? "PUT" : "POST",
    body: role,
  });

export const deleteRole = async (id) =>
  superAdminRequest(`${SUPER_ADMIN_API.roles}/${id}`, { method: "DELETE" });

export const updateRolePermissions = async (id, permissions) =>
  superAdminRequest(`${SUPER_ADMIN_API.roles}/${id}/permissions`, {
    method: "PUT",
    body: { permissions },
  });

export const fetchUsers = async () =>
  asArray(await superAdminRequest(SUPER_ADMIN_API.users)).map(normalizeUser);

export const fetchUser = async (id) =>
  normalizeUser(await superAdminRequest(`${SUPER_ADMIN_API.users}/${id}`));

export const saveUser = async (user, id) =>
  superAdminRequest(id ? `${SUPER_ADMIN_API.users}/${id}` : SUPER_ADMIN_API.users, {
    method: id ? "PUT" : "POST",
    body: user,
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
  const [dashboard, summary, revenueOverview, activities] = await Promise.allSettled([
    superAdminRequest(SUPER_ADMIN_API.dashboard),
    superAdminRequest(SUPER_ADMIN_API.dashboardSummary),
    superAdminRequest(SUPER_ADMIN_API.revenueOverview),
    superAdminRequest(SUPER_ADMIN_API.activities),
  ]);

  const dashboardData = dashboard.status === "fulfilled" ? asObject(dashboard.value) : {};
  const summaryData = summary.status === "fulfilled" ? asObject(summary.value) : {};
  const revenueData = revenueOverview.status === "fulfilled" ? revenueOverview.value : [];
  const activityData = activities.status === "fulfilled" ? activities.value : [];

  return {
    dashboard: dashboardData,
    summary: summaryData,
    revenueData: asArray(revenueData).map(normalizeRevenuePoint),
    activities: asArray(activityData).map(normalizeActivity),
    error:
      dashboard.status === "rejected" &&
      summary.status === "rejected" &&
      revenueOverview.status === "rejected" &&
      activities.status === "rejected"
        ? dashboard.reason.message
        : "",
  };
};

export const fetchReports = async () => {
  const [revenue, activity] = await Promise.allSettled([
    superAdminRequest(SUPER_ADMIN_API.reportsRevenue),
    superAdminRequest(SUPER_ADMIN_API.reportsActivity),
  ]);

  const revenueRows = revenue.status === "fulfilled" ? asArray(revenue.value) : [];
  const activityRows = activity.status === "fulfilled" ? asArray(activity.value) : [];
  const rows = revenueRows.length ? revenueRows : activityRows;

  return {
    rows: rows.map(normalizeReportRow),
    chartData: revenueRows.map(normalizeRevenuePoint),
    error:
      revenue.status === "rejected" && activity.status === "rejected"
        ? revenue.reason.message
        : "",
  };
};

export const getDashboardMetric = (source, keys, fallback = 0) =>
  toNumber(pick(source, keys, fallback));
