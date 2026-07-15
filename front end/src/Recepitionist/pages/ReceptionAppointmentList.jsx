import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, RefreshCw, Search, SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/ToastProvider";
import { formatDateMMDDYYYY } from "../../utils/dateFormat";
import { filterAppointments, getAppointmentValue, getBookingType } from "./appointmentListUtils";

const pageSize = 8;

function ReceptionAppointmentList({ title, subtitle, fetchAppointments, bookingType, emptyState }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchAppointments();
      const nextAppointments = data.filter((item) => {
        const currentBookingType = getBookingType(item);
        return currentBookingType === bookingType;
      });
      setAppointments(nextAppointments);
      setPage(1);
    } catch (err) {
      setError(err.message || "Unable to load appointments.");
      toast.error(err.message || "Unable to load appointments.");
    } finally {
      setLoading(false);
    }
  }, [bookingType, fetchAppointments, toast]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const filteredAppointments = useMemo(() => {
    return filterAppointments(appointments, {
      search,
      doctor: doctorFilter === "All" ? "" : doctorFilter,
      status: statusFilter === "All" ? "" : statusFilter,
      date: dateFilter,
    });
  }, [appointments, doctorFilter, dateFilter, search, statusFilter]);

  const doctorOptions = useMemo(() => {
    const doctors = new Set(
      appointments
        .map((item) => getAppointmentValue(item, ["doctorName", "doctor.name", "DoctorName", "doctor", "doctorDetails.name"], ""))
        .filter(Boolean)
    );

    return Array.from(doctors).sort();
  }, [appointments]);

  const statusOptions = useMemo(() => {
    const statuses = new Set(
      appointments
        .map((item) => getAppointmentValue(item, ["status", "appointmentStatus", "AppointmentStatus", "Status"], ""))
        .filter(Boolean)
    );

    return Array.from(statuses).sort();
  }, [appointments]);

  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visibleAppointments = filteredAppointments.slice((safePage - 1) * pageSize, safePage * pageSize);

  useEffect(() => {
    setPage(1);
  }, [search, doctorFilter, statusFilter, dateFilter]);

  return (
    <section className="rc-page">
      <div className="rc-page-head">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <div className="rc-head-actions">
          <button className="rc-btn ghost" onClick={loadAppointments} type="button">
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="rc-btn" onClick={() => navigate("/reception/appointments")} type="button">
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      </div>

      {error ? <div className="rc-alert error">{error}</div> : null}

      <div className="rc-card">
        <div className="rc-card-head">
          <div>
            <h3>{title}</h3>
            <p>Search, filter, and review {bookingType.toLowerCase()} appointments.</p>
          </div>
        </div>

        <div className="rc-filter-grid">
          <label className="rc-filter-field">
            <span>
              <Search size={14} /> Search
            </span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Patient name, code, token"
            />
          </label>
          <label className="rc-filter-field">
            <span>
              <SlidersHorizontal size={14} /> Doctor
            </span>
            <select value={doctorFilter} onChange={(event) => setDoctorFilter(event.target.value)}>
              <option value="All">All doctors</option>
              {doctorOptions.map((doctor) => (
                <option key={doctor} value={doctor}>
                  {doctor}
                </option>
              ))}
            </select>
          </label>
          <label className="rc-filter-field">
            <span>Status</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="All">All statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="rc-filter-field">
            <span>Date</span>
            <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
          </label>
        </div>

        {loading ? (
          <div className="rc-empty">Loading appointments...</div>
        ) : visibleAppointments.length === 0 ? (
          <div className="rc-empty">{emptyState}</div>
        ) : (
          <>
            <div className="rc-table-wrap">
              <table className="rc-table-data">
                <thead>
                  <tr>
                    <th>Token</th>
                    <th>Patient Code</th>
                    <th>Patient Name</th>
                    <th>Doctor Name</th>
                    <th>Specialization</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Chief Complaint</th>
                    <th>Phone</th>
                    <th>Payment</th>
                    <th>Booking Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleAppointments.map((item, index) => (
                    <tr key={`${item.id || item.appointmentId || index}`}>
                      <td>{getAppointmentValue(item, ["tokenNumber", "token", "TokenNumber", "tokenNo", "token_number"], "-")}</td>
                      <td>{getAppointmentValue(item, ["patientCode", "patient.code", "patient.patientCode", "PatientCode"], "-")}</td>
                      <td>{getAppointmentValue(item, ["patientName", "patient.name", "patient.fullName", "PatientName"], "-")}</td>
                      <td>{getAppointmentValue(item, ["doctorName", "doctor.name", "doctor.fullName", "DoctorName"], "-")}</td>
                      <td>{getAppointmentValue(item, ["doctorSpecialization", "doctor.specialization", "doctorSpeciality", "DoctorSpecialization", "specialization"], "-")}</td>
                      <td>{formatDateMMDDYYYY(getAppointmentValue(item, ["date", "appointmentDate", "AppointmentDate", "scheduledDate"], ""))}</td>
                      <td>{getAppointmentValue(item, ["time", "slot", "startTime", "appointmentTime", "AppointmentTime"], "-")}</td>
                      <td>{getAppointmentValue(item, ["chiefComplaint", "chiefComplaints", "ChiefComplaint", "complaint", "reason"], "-")}</td>
                      <td>{getAppointmentValue(item, ["phoneNumber", "mobileNumber", "patient.phoneNumber", "patient.mobileNumber", "patient.phone", "PhoneNumber"], "-")}</td>
                      <td>{getAppointmentValue(item, ["paymentStatus", "PaymentStatus", "payment.status", "billing.paymentStatus"], "-")}</td>
                      <td>{getBookingType(item)}</td>
                      <td>{getAppointmentValue(item, ["status", "appointmentStatus", "AppointmentStatus", "Status"], "-")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rc-pagination">
              <button className="rc-btn ghost" type="button" onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={safePage === 1}>
                Previous
              </button>
              <span>
                Page {safePage} of {totalPages}
              </span>
              <button className="rc-btn ghost" type="button" onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} disabled={safePage === totalPages}>
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default ReceptionAppointmentList;
