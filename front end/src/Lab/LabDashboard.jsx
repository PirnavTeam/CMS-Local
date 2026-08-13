import React, { useEffect, useState } from "react";
import { CheckCircle, ClipboardList, Clock, FileBarChart2, FlaskConical, TestTube2, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  buildLabDashboardMetrics,
  getPatientTestNames,
  getRecordDateValue,
  getNormalizedStatus,
  loadLabWorkRows,
  readFirst,
} from "./labModuleData";

const orderPatient = (order) => readFirst(order, ["patientName", "PatientName", "patient.name", "Patient.Name", "name", "Name"], "Patient");
const orderTest = (order) => readFirst(order, ["__labTestNames", "testName", "TestName", "labTestName", "test.name", "Test.Name", "category"], getPatientTestNames(order));
const orderStatus = (order) => readFirst(order, ["status", "Status", "orderStatus", "sampleStatus", "resultStatus"], getNormalizedStatus(order) || "-");
const orderDate = (order) => {
  const raw = getRecordDateValue(order);
  if (!raw) return "-";
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? String(raw) : new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};

function LabDashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    todaysOrders: 0,
    pendingOrders: 0,
    sampleCollectionNeeded: 0,
    inProgressTests: 0,
    completedToday: 0,
    cancelledTests: 0,
    pendingReports: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const loadDashboard = async () => {
      setLoading(true);
      setError("");
      try {
        const [orderRows, reportRows] = await Promise.all([
          loadLabWorkRows(),
          loadLabWorkRows({ includeOrders: false, includeGeneratedReports: true }),
        ]);
        if (!active) return;
        setMetrics(buildLabDashboardMetrics({ orderRows, reportRows }));
      } catch (loadError) {
        if (!active) return;
        setMetrics({
          todaysOrders: 0,
          pendingOrders: 0,
          sampleCollectionNeeded: 0,
          inProgressTests: 0,
          completedToday: 0,
          cancelledTests: 0,
          pendingReports: 0,
          recentOrders: [],
        });
        setError(loadError.message || "Unable to load lab dashboard.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDashboard();
    window.addEventListener("receptionDiagnosticBillingCompleted", loadDashboard);
    window.addEventListener("labReportsUpdated", loadDashboard);
    window.addEventListener("labOrderStatusUpdated", loadDashboard);
    window.addEventListener("storage", loadDashboard);
    window.addEventListener("focus", loadDashboard);
    return () => {
      active = false;
      window.removeEventListener("receptionDiagnosticBillingCompleted", loadDashboard);
      window.removeEventListener("labReportsUpdated", loadDashboard);
      window.removeEventListener("labOrderStatusUpdated", loadDashboard);
      window.removeEventListener("storage", loadDashboard);
      window.removeEventListener("focus", loadDashboard);
    };
  }, []);

  const cards = [
    { label: "Today's orders", value: metrics.todaysOrders, icon: ClipboardList, tone: "blue", to: "/lab/patients?view=today" },
    { label: "Pending orders", value: metrics.pendingOrders, icon: Clock, tone: "amber", to: "/lab/patients?view=pending" },
    { label: "Sample collection needed", value: metrics.sampleCollectionNeeded, icon: TestTube2, tone: "blue", to: "/lab/sample-collection?view=samples" },
    { label: "In-progress tests", value: metrics.inProgressTests, icon: FlaskConical, tone: "amber", to: "/lab/sample-collection?view=in-progress" },
    { label: "Completed today", value: metrics.completedToday, icon: CheckCircle, tone: "green", to: "/lab/sample-collection?view=completed" },
    { label: "Cancelled tests", value: metrics.cancelledTests, icon: XCircle, tone: "red", to: "/lab/sample-collection?view=cancelled" },
    { label: "Pending reports", value: metrics.pendingReports, icon: FileBarChart2, tone: "amber", to: "/lab/reports?view=pending-reports" },
  ];

  return (
    <section className="rc-page lab-page">
      {error ? <div className="rc-error">{error}</div> : null}
      {loading ? <div className="rc-card">Loading lab dashboard...</div> : null}

      <div className="rc-stat-grid lab-dashboard-grid">
        {cards.map(({ label, value, icon: Icon, tone, to }) => (
          <article className="rc-stat-card" key={label} role="button" tabIndex={0} onClick={() => navigate(to)} onKeyDown={(event) => event.key === "Enter" && navigate(to)}>
            <div className={`rc-stat-icon ${tone}`}><Icon size={22} /></div>
            <span>Open</span>
            <p>{label}</p>
            <strong>{loading ? "..." : value}</strong>
          </article>
        ))}
      </div>

      <div className="rc-action-grid">
        <button type="button" onClick={() => navigate("/lab/diagnosis-tests")}><FlaskConical size={22} /><span><strong>Diagnosis Tests</strong> Manage lab master tests</span></button>
        <button type="button" onClick={() => navigate("/lab/sample-collection")}><TestTube2 size={22} /><span><strong>Sample Collection</strong> Track order status</span></button>
        <button type="button" onClick={() => navigate("/lab/reports")}><FileBarChart2 size={22} /><span><strong>Reports</strong> Review result reports</span></button>
      </div>

      <div className="rc-card">
        <div className="rc-card-head">
          <div>
            <h3>Recent Lab Orders</h3>
            <p>Latest 10 lab orders</p>
          </div>
        </div>
        <div className="rc-table compact lab-table">
          <div className="rc-table-head four">
            <span>Patient</span>
            <span>Test</span>
            <span>Status</span>
            <span>Date</span>
          </div>
          {metrics.recentOrders.length ? metrics.recentOrders.map((order, index) => (
            <div className="rc-table-row four" key={readFirst(order, ["id", "Id", "orderId", "OrderId"], index)}>
              <span>{orderPatient(order)}</span>
              <span>{orderTest(order)}</span>
              <span>{orderStatus(order)}</span>
              <span>{orderDate(order)}</span>
            </div>
          )) : <div className="rc-empty">No recent lab orders found.</div>}
        </div>
      </div>
    </section>
  );
}

export default LabDashboard;
