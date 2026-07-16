import React from "react";
import ReceptionAppointmentList from "./ReceptionAppointmentList";
import { getOnlineAppointments } from "../receptionApi";

function ReceptionOnlineBookings() {
  return (
    <ReceptionAppointmentList
      title="Online Bookings"
      subtitle="Appointments booked through the patient portal or app."
      fetchAppointments={getOnlineAppointments}
      bookingType="Online"
      emptyState="No online bookings found for the current filters."
    />
  );
}

export default ReceptionOnlineBookings;
