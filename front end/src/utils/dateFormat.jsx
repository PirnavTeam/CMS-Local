export const formatDateMMDDYYYY = (value, fallback = "-") => {
  if (!value || value === "0001-01-01T00:00:00") return fallback;

  const raw = String(value);
  const dateValue = /^\d{4}-\d{2}-\d{2}$/.test(raw)
    ? `${raw}T00:00:00`
    : raw;
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return raw || fallback;

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();

  return `${month}/${day}/${year}`;
};

export const formatGeneratedDateTime = (value = new Date(), fallback = "-") => {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return fallback;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};
