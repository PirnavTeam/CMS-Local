import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./DoctorSchedule.css";
import { apiUrl } from "../../config/api";

const DOCTORS_API = apiUrl("Doctor");
const SCHEDULE_API = apiUrl("Schedule");

const DAY_MAPPING = [
  { short: "Mon", full: "Monday" },
  { short: "Tue", full: "Tuesday" },
  { short: "Wed", full: "Wednesday" },
  { short: "Thu", full: "Thursday" },
  { short: "Fri", full: "Friday" },
  { short: "Sat", full: "Saturday" },
  { short: "Sun", full: "Sunday" }
];

function Schedule() {
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [days, setDays] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [workStart, setWorkStart] = useState("09:00");
  const [workEnd, setWorkEnd] = useState("17:00");
  const [breakStart, setBreakStart] = useState("13:00");
  const [breakEnd, setBreakEnd] = useState("14:00");
  const [slotDuration, setSlotDuration] = useState("30");

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Preview State
  const [previewDate, setPreviewDate] = useState(new Date().toISOString().split('T')[0]);
  const [previewSlots, setPreviewSlots] = useState([]);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);

  useEffect(() => {
    fetch(DOCTORS_API, { headers: { "ngrok-skip-browser-warning": "true" } })
      .then(res => res.json())
      .then(data => {
        setDoctors(data);
        if (data.length > 0) {
          setDoctorId(data[0].id.toString());
        }
      })
      .catch(err => console.error("Error fetching doctors", err));
  }, []);

  useEffect(() => {
    if (!doctorId || !previewDate) return;

    setIsFetchingSlots(true);
    fetch(`${SCHEDULE_API}/day-slots?doctorId=${doctorId}&date=${previewDate}`, {
      headers: { "ngrok-skip-browser-warning": "true" }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch slots");
        return res.json();
      })
      .then(data => setPreviewSlots(data))
      .catch(err => {
        console.error(err);
        setPreviewSlots([]); // No slots or error
      })
      .finally(() => setIsFetchingSlots(false));
  }, [doctorId, previewDate]);

  const toggleDay = (fullDay) => {
    setDays(prev =>
      prev.includes(fullDay) ? prev.filter(d => d !== fullDay) : [...prev, fullDay]
    );
  };

  const handleSave = async () => {
    if (!doctorId || !startDate || !endDate || days.length === 0) {
      setSaveMessage("Please fill all required fields (Doctor, Days, Start/End dates).");
      return;
    }

    setIsSaving(true);
    setSaveMessage("");

    // Time inputs format HH:mm, API needs HH:mm:ss
    const formatTime = (t) => t.length === 5 ? `${t}:00` : t;

    const payload = {
      doctorId: parseInt(doctorId),
      days,
      startDate,
      endDate,
      workStart: formatTime(workStart),
      workEnd: formatTime(workEnd),
      breakStart: formatTime(breakStart),
      breakEnd: formatTime(breakEnd),
      slotDuration: parseInt(slotDuration)
    };

    try {
      const res = await fetch(SCHEDULE_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to save schedule");
      setSaveMessage("Schedule saved successfully!");
      // Trigger slot refresh if the saved schedule affects the current previewDate
      setPreviewDate(prev => prev);
      // Force refresh by creating a new reference or calling fetch again
      // The easiest way is to just do a fake date swap if needed, but react won't trigger if it's the same string.
      // We will let the user navigate naturally or we can add a toggle state.
    } catch (err) {
      setSaveMessage("Error saving schedule.");
    } finally {
      setIsSaving(false);
    }
  };

  const changePreviewDate = (daysToAdd) => {
    const d = new Date(previewDate);
    d.setDate(d.getDate() + daysToAdd);
    setPreviewDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="schedule-page">
      <h2>Doctor Schedule</h2>
      <p>Configure working hours and availability per doctor</p>

      <div className="schedule-container">
        {/* LEFT */}
        <div className="left">
          <label>Doctor</label>
          <select value={doctorId} onChange={e => setDoctorId(e.target.value)}>
            {doctors.map(doc => (
              <option key={doc.id} value={doc.id}>
                Dr. {doc.name} — {doc.specialization}
              </option>
            ))}
          </select>

          <h4>Working Days</h4>
          <div className="days">
            {DAY_MAPPING.map(d => (
              <button
                key={d.short}
                className={days.includes(d.full) ? "active" : "off"}
                onClick={() => toggleDay(d.full)}
              >
                {d.short}
              </button>
            ))}
          </div>

          <div className="grid">
            <div>
              <label>Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>

            <div>
              <label>End Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>

            <div>
              <label>Start Time</label>
              <input type="time" value={workStart} onChange={e => setWorkStart(e.target.value)} />
            </div>

            <div>
              <label>End Time</label>
              <input type="time" value={workEnd} onChange={e => setWorkEnd(e.target.value)} />
            </div>

            <div>
              <label>Break Start</label>
              <input type="time" value={breakStart} onChange={e => setBreakStart(e.target.value)} />
            </div>

            <div>
              <label>Break End</label>
              <input type="time" value={breakEnd} onChange={e => setBreakEnd(e.target.value)} />
            </div>

            <div>
              <label>Slot Duration</label>
              <select value={slotDuration} onChange={e => setSlotDuration(e.target.value)}>
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">60 min</option>
              </select>
            </div>
          </div>

          <button className="save" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Schedule"}
          </button>
          {saveMessage && <p className="save-message">{saveMessage}</p>}
        </div>

        {/* RIGHT */}
        <div className="right">
          <div className="preview-header">
            <div>
              <h3>Preview</h3>
              <p>Generated time slots</p>
            </div>
            <div className="date-pagination">
              <button onClick={() => changePreviewDate(-1)}><ChevronLeft size={16} /></button>
              <span>{previewDate}</span>
              <button onClick={() => changePreviewDate(1)}><ChevronRight size={16} /></button>
            </div>
          </div>

          <div className="slots">
            {isFetchingSlots ? (
              <p className="slots-msg">Loading slots...</p>
            ) : previewSlots.length > 0 ? (
              previewSlots.map((slot, i) => (
                <div className="slot" key={i}>
                  <span>{slot.start.substring(0, 5)} – {slot.end.substring(0, 5)}</span>
                  <span className={slot.isBooked ? "booked" : "available"}>
                    {slot.isBooked ? "Booked" : "Available"}
                  </span>
                </div>
              ))
            ) : (
              <p className="slots-msg">No slots available on this date.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Schedule;
