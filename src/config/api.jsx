const DEFAULT_API_BASE_URL = "https://posological-bea-subacademically.ngrok-free.dev";

export const API_BASE_URL = (
  process.env.REACT_APP_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/+$/, "");

export const API_ASSET_BASE_URL = API_BASE_URL;

export const apiUrl = (path) => {
  const cleanPath = String(path || "")
    .replace(/^\/+/, "")
    .replace(/^api\/?/i, "");

  return `${API_BASE_URL}/api/${cleanPath}`;
};
