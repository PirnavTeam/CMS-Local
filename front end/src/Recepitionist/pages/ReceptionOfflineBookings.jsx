import React from "react";
import ReceptionAppointmentList from "./ReceptionAppointmentList";
import { getOfflineAppointments } from "../receptionApi";

function ReceptionOfflineBookings() {
  return (
    <ReceptionAppointmentList
      title="Offline Bookings"
      subtitle="Appointments created manually by the receptionist."
      fetchAppointments={getOfflineAppointments}
      bookingType="Offline"
      emptyState="No offline bookings found for the current filters."
    />
  );
}

export default ReceptionOfflineBookings;
