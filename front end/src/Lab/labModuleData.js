import { parseList, requestJson } from "./labApi";
import { getLabProfile } from "./labSession";
import { readGeneratedLabReports } from "./labReportStore";
import { dedupeBillingRows } from "../utils/billingRevenue";

export const PATIENT_PHONE_KEYS = [
  "phone", "Phone", "mobile", "Mobile", "phoneNumber", "PhoneNumber", "mobileNumber", "MobileNumber",
  "patientPhone", "PatientPhone", "contactNumber", "ContactNumber",
  "patient.phone", "patient.Phone", "patient.mobile", "patient.Mobile", "patient.phoneNumber", "patient.PhoneNumber", "patient.mobileNumber", "patient.MobileNumber",
  "Patient.phone", "Patient.Phone", "Patient.mobile", "Patient.Mobile", "Patient.phoneNumber", "Patient.PhoneNumber", "Patient.mobileNumber", "Patient.MobileNumber",
  "appointment.phone", "appointment.Phone", "appointment.patientPhone", "appointment.PatientPhone",
  "Appointment.phone", "Appointment.Phone", "Appointment.patientPhone", "Appointment.PatientPhone",
];

export const VISIT_DATE_KEYS = [
  "visitDate", "VisitDate", "appointmentDate", "AppointmentDate", "appointmentDateTime", "AppointmentDateTime",
  "scheduledDate", "ScheduledDate", "slotDate", "SlotDate", "bookingDate", "BookingDate",
  "invoiceDate", "InvoiceDate", "billDate", "BillDate", "createdAt", "CreatedAt", "createdOn", "CreatedOn", "date", "Date",
  "appointment.visitDate", "appointment.VisitDate", "appointment.appointmentDate", "appointment.AppointmentDate", "appointment.date", "appointment.Date",
  "Appointment.visitDate", "Appointment.VisitDate", "Appointment.appointmentDate", "Appointment.AppointmentDate", "Appointment.date", "Appointment.Date",
  "bill.invoiceDate", "bill.billDate", "Bill.InvoiceDate", "Bill.BillDate",
];

export const readFirst = (record = {}, keys = [], fallback = "-") => {
  for (const key of keys) {
    const value = String(key).split(".").reduce((current, part) => (current && typeof current === "object" ? current[part] : undefined), record);
    if (value !== undefined && value !== null && String(value).trim() !== "" && String(value).trim() !== "-") return value;
  }
  return fallback;
};

export const normalizeId = (value) => String(value ?? "").trim();
export const normalizeText = (value) => String(value ?? "").trim().toLowerCase();

export const getRecordDateValue = (record = {}) => readFirst(record, VISIT_DATE_KEYS, "");
export const getRecordPhoneValue = (record = {}) => readFirst(record, PATIENT_PHONE_KEYS, "");
export const getNormalizedStatus = (record = {}) =>
  normalizeText(readFirst(record, ["status", "Status", "orderStatus", "sampleStatus", "resultStatus", "reportStatus"], ""));

export const getLabRecordIdentifier = (row = {}) =>
  String(readFirst(row, ["id", "Id", "orderId", "OrderId", "labOrderId", "LabOrderId", "billingId", "BillingId", "billId", "BillId", "invoiceId", "InvoiceId", "testId", "TestId", "sourceOrderId"], "") || "");

export const isToday = (value) => {
  const date = new Date(value || "");
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
};

export const isPendingStatus = (record = {}) => /\bpending\b|waiting|awaiting/.test(getNormalizedStatus(record));
export const isInProgressStatus = (record = {}) => /in\s*-?\s*progress|processing|started/.test(getNormalizedStatus(record));
export const isCompletedStatus = (record = {}) => /complete|completed|done|reported|delivered/.test(getNormalizedStatus(record));
export const isCancelledStatus = (record = {}) => /cancel|cancelled|canceled/.test(getNormalizedStatus(record));
export const isDoneRecord = (record = {}) => isCompletedStatus(record) || isCancelledStatus(record);

export const isCurrentLabWork = (record = {}) => {
  const dateValue = getRecordDateValue(record);
  return isToday(dateValue) || (!dateValue && !isDoneRecord(record));
};

const getRecordClinicId = (record = {}) =>
  normalizeId(readFirst(record, [
    "hospitalId", "HospitalId", "clinicId", "ClinicId",
    "patient.hospitalId", "patient.clinicId", "Patient.HospitalId", "Patient.ClinicId",
    "bill.hospitalId", "bill.clinicId", "Bill.HospitalId", "Bill.ClinicId",
  ], ""));

const getRecordBranchId = (record = {}) =>
  normalizeId(readFirst(record, [
    "branchId", "BranchId", "clinicBranchId", "ClinicBranchId",
    "patient.branchId", "patient.clinicBranchId", "Patient.BranchId", "Patient.ClinicBranchId",
    "bill.branchId", "bill.clinicBranchId", "Bill.BranchId", "Bill.ClinicBranchId",
  ], ""));

const getRecordBranchName = (record = {}) =>
  normalizeText(readFirst(record, [
    "branchName", "BranchName", "branch.name", "Branch.Name",
    "patient.branchName", "Patient.BranchName", "bill.branchName", "Bill.BranchName",
  ], ""));

export const belongsToLabScope = (record = {}, profile = getLabProfile()) => {
  const clinicId = normalizeId(profile.hospitalId);
  const branchId = normalizeId(profile.branchId);
  const branchName = normalizeText(profile.branchName);
  const recordClinicId = getRecordClinicId(record);
  const recordBranchId = getRecordBranchId(record);
  const recordBranchName = getRecordBranchName(record);

  if (clinicId && recordClinicId && recordClinicId !== clinicId) return false;
  if (branchId && recordBranchId && recordBranchId !== branchId) return false;
  if (branchName && !recordBranchId && recordBranchName && recordBranchName !== branchName) return false;
  return true;
};

const getServiceBillType = (record = {}) =>
  normalizeText(readFirst(record, [
    "billingType", "BillingType", "invoiceType", "InvoiceType",
    "serviceType", "ServiceType", "type", "Type",
  ], ""));

export const isDiagnosticRecord = (record = {}) => {
  const source = normalizeText(record.__sourcePath);
  if (source.includes("lab/orders") || source.includes("lab/doctor/reports") || source.includes("lab/patient/reports") || source.includes("diagnostic") || source.includes("labgeneratedreports")) return true;
  const typeText = getServiceBillType(record);
  const labAmount = Number(readFirst(record, ["labCharges", "labCharge", "diagnosticRevenue"], 0)) || 0;
  const reportName = readFirst(record, ["reportName", "ReportName", "reportTitle", "testName", "TestName"], "");
  return /diagnostic|diagnosis|lab|test/.test(typeText) || labAmount > 0 || Boolean(reportName);
};

const getLineItems = (record = {}) => {
  const keys = [
    "items", "Items", "serviceItems", "ServiceItems", "billItems", "BillItems",
    "lineItems", "LineItems", "billingItems", "BillingItems", "tests", "Tests",
  ];
  for (const key of keys) {
    if (Array.isArray(record[key])) return record[key];
  }
  return [];
};

const getItemTestName = (item = {}) =>
  readFirst(item, ["testName", "TestName", "labTestName", "item", "name", "Name", "serviceName"], "");

export const getPatientTestNames = (record = {}) => {
  const direct = readFirst(record, ["testName", "TestName", "labTestName", "LabTestName", "diagnosisTests", "DiagnosisTests"], "");
  const names = [
    ...String(direct || "").split(","),
    ...getLineItems(record).map(getItemTestName),
  ]
    .map((name) => String(name).trim())
    .filter(Boolean);
  return Array.from(new Set(names)).join(", ") || "-";
};

const getPatientLabAmount = (record = {}) => {
  const direct = Number(readFirst(record, ["labCharges", "labCharge", "diagnosticRevenue", "totalAmount", "grandTotal", "amount"], 0)) || 0;
  if (direct > 0) return direct;
  return getLineItems(record).reduce((sum, item) => {
    const unitPrice = Number(readFirst(item, ["unitPrice", "price", "Price", "rate", "amount"], 0)) || 0;
    const quantity = Number(readFirst(item, ["quantity", "qty"], 1)) || 1;
    return sum + unitPrice * quantity;
  }, 0);
};

const mergeTextValues = (...values) =>
  values.map((value) => String(value ?? "").trim()).find((value) => value && value !== "-") || "-";

const getRecordAppointmentId = (record = {}) =>
  normalizeId(readFirst(record, [
    "appointmentId", "AppointmentId", "appointment.id", "appointment.appointmentId", "Appointment.Id", "Appointment.AppointmentId",
  ], ""));

const getRecordPatientId = (record = {}) =>
  normalizeId(readFirst(record, [
    "patientId", "PatientId", "patient.id", "patient.patientId", "Patient.Id", "Patient.PatientId",
  ], ""));

const getRecordPatientName = (record = {}) =>
  normalizeText(readFirst(record, ["patientName", "PatientName", "patient.name", "Patient.Name", "name", "Name", "fullName"], ""));

const getPatientGroupKey = (record = {}) => {
  const appointmentId = getRecordAppointmentId(record);
  if (appointmentId) return `appointment:${appointmentId}`;

  const patientId = getRecordPatientId(record);
  const patientName = getRecordPatientName(record);
  const visitDate = normalizeText(getRecordDateValue(record));
  return `patient:${patientId || patientName}:${visitDate}`;
};

export const mergeLabPatientRows = (rows = []) => {
  const grouped = new Map();

  rows.forEach((row) => {
    const key = getPatientGroupKey(row);
    const existing = grouped.get(key);
    if (!existing) {
      grouped.set(key, row);
      return;
    }

    const testNames = [
      ...String(existing.__labTestNames || "").split(","),
      ...String(row.__labTestNames || "").split(","),
    ]
      .map((name) => name.trim())
      .filter((name) => name && name !== "-");

    grouped.set(key, {
      ...existing,
      ...row,
      patientName: mergeTextValues(existing.patientName, existing.PatientName, row.patientName, row.PatientName),
      PatientName: mergeTextValues(existing.PatientName, existing.patientName, row.PatientName, row.patientName),
      phone: mergeTextValues(existing.phone, existing.Phone, row.phone, row.Phone),
      Phone: mergeTextValues(existing.Phone, existing.phone, row.Phone, row.phone),
      visitDate: mergeTextValues(existing.visitDate, existing.VisitDate, row.visitDate, row.VisitDate, getRecordDateValue(existing), getRecordDateValue(row)),
      VisitDate: mergeTextValues(existing.VisitDate, existing.visitDate, row.VisitDate, row.visitDate, getRecordDateValue(existing), getRecordDateValue(row)),
      __labTestNames: Array.from(new Set(testNames)).join(", ") || "-",
      __labAmount: (Number(existing.__labAmount) || 0) + (Number(row.__labAmount) || 0),
      __groupedRows: [...(existing.__groupedRows || [existing]), row],
    });
  });

  return Array.from(grouped.values());
};

const mergeAppointmentFallback = (row = {}, appointment = null) => {
  if (!appointment) return row;

  const phone = mergeTextValues(getRecordPhoneValue(row), getRecordPhoneValue(appointment));
  const visitDate = mergeTextValues(getRecordDateValue(row), getRecordDateValue(appointment));

  return {
    ...appointment,
    ...row,
    patient: row.patient || appointment.patient || appointment.Patient,
    appointment: row.appointment || appointment,
    phone,
    Phone: phone,
    patientPhone: phone,
    PatientPhone: phone,
    visitDate,
    VisitDate: visitDate,
    appointmentDate: visitDate,
    AppointmentDate: visitDate,
  };
};

const enrichLabPatientRow = (record = {}) => {
  const phone = getRecordPhoneValue(record);
  const visitDate = getRecordDateValue(record);

  return {
    ...record,
    phone,
    Phone: phone,
    visitDate,
    VisitDate: visitDate,
    __labTestNames: getPatientTestNames(record),
    __labAmount: getPatientLabAmount(record),
  };
};

export const filterRowsByLabView = (rows = [], view = "") => {
  if (view === "today") return rows.filter(isCurrentLabWork);
  if (view === "pending") return rows.filter(isPendingStatus);
  if (view === "samples") return rows.filter((row) => isPendingStatus(row) || !getNormalizedStatus(row));
  if (view === "in-progress") return rows.filter(isInProgressStatus);
  if (view === "completed") return rows.filter((row) => isToday(getRecordDateValue(row)) && isCompletedStatus(row));
  if (view === "cancelled") return rows.filter(isCancelledStatus);
  if (view === "pending-reports") return rows.filter(isPendingStatus);
  return rows;
};

export const isGeneratedReport = (row = {}) =>
  isPendingStatus(row) ||
  isCompletedStatus(row) ||
  /reported|delivered/.test(getNormalizedStatus(row)) ||
  Boolean(readFirst(row, ["reportName", "ReportName", "reportTitle", "findings", "Findings", "reportFindings", "ReportFindings"], ""));

const fetchRowsFromPaths = async (paths = []) => {
  const results = await Promise.allSettled(paths.map((path) => requestJson(path)));
  return results.flatMap((result, index) =>
    result.status === "fulfilled"
      ? parseList(result.value).map((row) => ({ ...row, __sourcePath: paths[index] }))
      : []
  );
};

export const loadLabWorkRows = async ({ includeOrders = true, includeGeneratedReports = false } = {}) => {
  const labProfile = getLabProfile();
  const backendData = includeOrders ? await fetchRowsFromPaths(["Lab/orders", "Billing/lab"]) : [];
  const reportRows = includeGeneratedReports
    ? [
        ...await fetchRowsFromPaths(["Lab/doctor/reports", "Lab/patient/reports"]),
        ...readGeneratedLabReports(),
      ]
    : [];
  const appointmentRows = await fetchRowsFromPaths(["Appointment", "Billing/appointments"]);
  const sortedAppointmentRows = [...appointmentRows].sort((left, right) => {
    const leftTime = new Date(getRecordDateValue(left) || 0).getTime() || 0;
    const rightTime = new Date(getRecordDateValue(right) || 0).getTime() || 0;
    return rightTime - leftTime;
  });
  const appointmentsById = new Map(sortedAppointmentRows.map((appointment) => [getRecordAppointmentId(appointment), appointment]).filter(([id]) => id));
  const appointmentsByPatientId = new Map(sortedAppointmentRows.map((appointment) => [getRecordPatientId(appointment), appointment]).filter(([id]) => id));
  const appointmentsByPhone = new Map(sortedAppointmentRows.map((appointment) => [normalizeText(getRecordPhoneValue(appointment)), appointment]).filter(([phone]) => phone));
  const appointmentsByName = new Map(sortedAppointmentRows.map((appointment) => [getRecordPatientName(appointment), appointment]).filter(([name]) => name));
  const findAppointmentFallback = (row = {}) =>
    appointmentsById.get(getRecordAppointmentId(row)) ||
    appointmentsByPatientId.get(getRecordPatientId(row)) ||
    appointmentsByPhone.get(normalizeText(getRecordPhoneValue(row))) ||
    appointmentsByName.get(getRecordPatientName(row));

  return dedupeBillingRows([...backendData, ...reportRows])
    .map((row) => mergeAppointmentFallback(row, findAppointmentFallback(row)))
    .filter(isDiagnosticRecord)
    .filter((row) => belongsToLabScope(row, labProfile))
    .map(enrichLabPatientRow);
};

export const buildLabDashboardMetrics = ({ orderRows = [], reportRows = [] } = {}) => {
  const groupedOrders = mergeLabPatientRows(orderRows);
  return {
    todaysOrders: filterRowsByLabView(groupedOrders, "today").length,
    pendingOrders: filterRowsByLabView(groupedOrders, "pending").length,
    sampleCollectionNeeded: filterRowsByLabView(orderRows, "samples").length,
    inProgressTests: filterRowsByLabView(orderRows, "in-progress").length,
    completedToday: filterRowsByLabView(orderRows, "completed").length,
    cancelledTests: filterRowsByLabView(orderRows, "cancelled").length,
    pendingReports: filterRowsByLabView(reportRows.filter(isGeneratedReport), "pending-reports").length,
    recentOrders: groupedOrders.slice(0, 10),
  };
};
