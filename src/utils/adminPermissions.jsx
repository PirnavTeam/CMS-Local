const ROLE_OVERRIDES_KEY = "superadmin_role_overrides";
const SESSION_PERMISSIONS_KEY = "adminPermissions";

export const ADMIN_PERMISSION_DENIED_MESSAGE =
  "You do not have permission for this action. Please contact Super Admin.";

const normalizeRole = (role = "") =>
  String(role || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "");

const normalizePermission = (permission = "") =>
  String(permission || "").trim().toLowerCase();

const safeJsonParse = (value, fallback) => {
  try {
    return JSON.parse(value || "");
  } catch {
    return fallback;
  }
};

const readRoleOverrides = () => {
  const value = safeJsonParse(localStorage.getItem(ROLE_OVERRIDES_KEY), {});
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
};

const toPermissionList = (permissions) => {
  if (!Array.isArray(permissions)) return [];

  return permissions
    .map((permission) =>
      typeof permission === "string"
        ? permission
        : permission?.name || permission?.permission || permission?.value
    )
    .filter(Boolean);
};

const getRoleOverride = (overrides = {}, role = "") => {
  const normalizedRole = normalizeRole(role);
  const directOverride =
    overrides.Admin ||
    overrides.admin ||
    overrides[role] ||
    overrides[normalizedRole] ||
    null;

  if (directOverride) return directOverride;

  return Object.values(overrides).find((override) => {
    if (!override || typeof override !== "object") return false;

    const overrideRole = normalizeRole(
      override.roleName || override.name || override.role || ""
    );

    return overrideRole === normalizedRole || overrideRole === "admin";
  });
};

export const getCurrentAdminRole = () =>
  localStorage.getItem("adminRole") || localStorage.getItem("userRole") || "";

export const getAdminPermissions = () => {
  const role = getCurrentAdminRole();
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === "superadmin") {
    return ["View", "Create", "Edit", "Delete"];
  }

  if (normalizedRole !== "admin" && normalizedRole !== "clinicadmin") {
    return ["View"];
  }

  const overrides = readRoleOverrides();
  const override = getRoleOverride(overrides, role);
  const overridePermissions = toPermissionList(override?.permissions);

  if (overridePermissions.length) {
    return Array.from(new Set(["View", ...overridePermissions]));
  }

  const sessionPermissions = toPermissionList(
    safeJsonParse(localStorage.getItem(SESSION_PERMISSIONS_KEY), [])
  );

  if (sessionPermissions.length) {
    return Array.from(new Set(["View", ...sessionPermissions]));
  }

  return ["View"];
};

export const hasAdminPermission = (permission) => {
  const normalizedPermission = normalizePermission(permission);

  if (normalizedPermission === "view") return true;

  return getAdminPermissions().some(
    (item) => normalizePermission(item) === normalizedPermission
  );
};

export const requireAdminPermission = (permission, onDenied) => {
  if (hasAdminPermission(permission)) return true;

  if (typeof onDenied === "function") {
    onDenied(ADMIN_PERMISSION_DENIED_MESSAGE);
  }

  return false;
};
