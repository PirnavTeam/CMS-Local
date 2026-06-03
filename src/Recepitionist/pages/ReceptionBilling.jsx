import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { parseList, requestJson } from "../receptionApi";

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const firstValue = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "" && value !== 0);

const getInvoiceNumber = (invoice) =>
  firstValue(
    invoice?.invoiceNo,
    invoice?.invoiceNumber,
    invoice?.billNo,
    invoice?.billNumber,
    invoice?.billingId,
    invoice?.billId,
    invoice?.paymentId,
    invoice?.transactionId,
    invoice?.id,
    invoice?.appointmentId ? `APT-${invoice.appointmentId}` : ""
  ) || "-";

const getInvoiceStatus = (invoice) =>
  firstValue(invoice?.paymentStatus, invoice?.invoiceStatus, invoice?.billingStatus, invoice?.status) ||
  "Paid";

const getLatestInvoice = (data) => {
  const invoices = parseList(data);
  return invoices.sort((a, b) => {
    const bDate = new Date(b?.createdAt || 0).getTime();
    const aDate = new Date(a?.createdAt || 0).getTime();
    if (bDate !== aDate) return bDate - aDate;
    return Number(b?.id || 0) - Number(a?.id || 0);
  })[0] || null;
};

function ReceptionBilling() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState("");
  const [invoice, setInvoice] = useState(null);
  const [showInvoiceActions, setShowInvoiceActions] = useState(false);
  const [form, setForm] = useState({
    appointmentId: "",
    paymentMode: "UPI",
    medicineCharges: 0,
    labCharges: 0,
  });

  useEffect(() => {
    Promise.all([requestJson("Billing/appointments"), requestJson("Billing")])
      .then((data) => {
        const [appointmentsData, invoicesData] = data;
        const list = parseList(appointmentsData);
        setAppointments(list);
        setForm((prev) => ({
          ...prev,
          appointmentId: String(list[0]?.appointmentId || list[0]?.id || ""),
        }));
        setInvoice(getLatestInvoice(invoicesData));
      })
      .catch((error) => setMessage(error.message));
  }, []);

  const selectedAppointment = useMemo(() => {
    return appointments.find(
      (item) => String(item.id || item.appointmentId) === String(form.appointmentId)
    );
  }, [appointments, form.appointmentId]);

  const consultationCharge = Number(selectedAppointment?.consultationCharge || 0);
  const total =
    consultationCharge +
    Number(form.medicineCharges || 0) +
    Number(form.labCharges || 0);

  const generate = async (event) => {
    event.preventDefault();
    const body = {
      appointmentId: Number(form.appointmentId),
      medicineCharge: Number(form.medicineCharges || 0),
      labCharge: Number(form.labCharges || 0),
      paymentMode: String(form.paymentMode || "").toLowerCase(),
    };

    try {
      const data = await requestJson("Billing", {
        method: "POST",
        body: JSON.stringify(body),
      });

      const invoiceData = Array.isArray(data) ? data[0] : data;
      setInvoice({
        ...body,
        ...(invoiceData || {}),
        consultationCharge,
        patientName:
          invoiceData?.patientName ||
          selectedAppointment?.patientName ||
          selectedAppointment?.patient?.name ||
          "-",
        doctorName:
          invoiceData?.doctorName ||
          selectedAppointment?.doctorName ||
          selectedAppointment?.doctor?.name ||
          "-",
      });
      setShowInvoiceActions(false);
      setMessage(invoiceData?.message || "Invoice generated successfully.");
    } catch (error) {
      setMessage(error.message);
      setInvoice(null);
      setShowInvoiceActions(false);
    }
  };

  const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const downloadInvoicePdf = () => {
    if (!invoice) return;

    const invoiceNumber = getInvoiceNumber(invoice);
    const patientName = invoice.patientName || "-";
    const doctorName = invoice.doctorName || "-";
    const status = getInvoiceStatus(invoice);
    const paymentMode = invoice.paymentMode || form.paymentMode || "-";
    const consultationCharge =
      invoice.consultationCharge ?? invoice.consultationCharges ?? selectedAppointment?.consultationCharge;
    const medicineCharge = invoice.medicineCharge ?? invoice.medicineCharges ?? form.medicineCharges;
    const labCharge = invoice.labCharge ?? invoice.labCharges ?? form.labCharges;
    const grandTotal = invoice.totalAmount || invoice.total || total;

    const printWindow = window.open("", "_blank", "width=760,height=920");
    if (!printWindow) {
      setMessage("Please allow popups to download the invoice PDF.");
      return;
    }

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Invoice ${escapeHtml(invoiceNumber)}</title>
          <style>
            body {
              margin: 0;
              padding: 32px;
              color: #071120;
              font-family: Arial, sans-serif;
            }
            .invoice {
              max-width: 720px;
              margin: 0 auto;
              border: 1px solid #d9e1ec;
              border-radius: 10px;
              padding: 28px;
            }
            h1 {
              margin: 0 0 8px;
              font-size: 24px;
            }
            .muted {
              color: #40516a;
              font-size: 13px;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 12px;
              margin: 24px 0;
            }
            .field {
              border: 1px solid #e3e9f1;
              border-radius: 8px;
              padding: 12px;
            }
            .field span {
              display: block;
              color: #40516a;
              font-size: 12px;
              margin-bottom: 6px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 12px;
            }
            th,
            td {
              padding: 12px;
              border-bottom: 1px solid #e3e9f1;
              text-align: left;
            }
            td:last-child,
            th:last-child {
              text-align: right;
            }
            .total {
              display: flex;
              justify-content: space-between;
              margin-top: 22px;
              padding-top: 18px;
              border-top: 2px solid #071120;
              font-size: 20px;
              font-weight: 800;
            }
          </style>
        </head>
        <body>
          <main class="invoice">
            <h1>Invoice</h1>
            <div class="muted">Generated from billing</div>
            <section class="grid">
              <div class="field"><span>Invoice No</span><strong>${escapeHtml(invoiceNumber)}</strong></div>
              <div class="field"><span>Status</span><strong>${escapeHtml(status)}</strong></div>
              <div class="field"><span>Patient</span><strong>${escapeHtml(patientName)}</strong></div>
              <div class="field"><span>Doctor</span><strong>${escapeHtml(doctorName)}</strong></div>
              <div class="field"><span>Payment Mode</span><strong>${escapeHtml(paymentMode)}</strong></div>
              <div class="field"><span>Appointment ID</span><strong>${escapeHtml(invoice.appointmentId || form.appointmentId || "-")}</strong></div>
            </section>
            <table>
              <thead>
                <tr><th>Charge</th><th>Amount</th></tr>
              </thead>
              <tbody>
                <tr><td>Consultation</td><td>Rs ${escapeHtml(consultationCharge || 0)}</td></tr>
                <tr><td>Medicine</td><td>Rs ${escapeHtml(medicineCharge || 0)}</td></tr>
                <tr><td>Lab</td><td>Rs ${escapeHtml(labCharge || 0)}</td></tr>
              </tbody>
            </table>
            <div class="total"><span>Total</span><span>Rs ${escapeHtml(grandTotal)}</span></div>
          </main>
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    setShowInvoiceActions(false);
  };

  return (
    <section className="rc-page">
      <div className="rc-page-head">
        <div>
          <h2>Billing</h2>
          <p>Fetch appointment, add charges, confirm payment, and generate invoice.</p>
        </div>
        <button className="rc-btn" onClick={() => navigate("/reception/dashboard")}>
          <ArrowLeft size={16} /> Dashboard
        </button>
      </div>

      {message ? <div className="rc-alert error">{message}</div> : null}

      <form className="rc-card rc-billing-form" onSubmit={generate}>
        <h3>Generate Bill</h3>
        <div className="rc-patient-summary">
          <strong>
            {selectedAppointment?.patientName || selectedAppointment?.patient?.name || "-"}
          </strong>
          <span>
            {selectedAppointment?.patientId || selectedAppointment?.patient?.id || "-"} |{" "}
            {selectedAppointment?.doctorName || selectedAppointment?.doctor?.name || "-"}
          </span>
        </div>
        <label>
          <span>Appointment</span>
          <select value={form.appointmentId} onChange={(e) => setField("appointmentId", e.target.value)}>
            {appointments.map((a) => (
              <option value={a.id || a.appointmentId} key={a.id || a.appointmentId}>
                {a.patientName || a.patient?.name || "-"} - {a.time || "-"} -{" "}
                {a.status || "-"}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Payment Mode</span>
          <select value={form.paymentMode} onChange={(e) => setField("paymentMode", e.target.value)}>
            <option value="UPI">UPI</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="Insurance">Insurance</option>
          </select>
        </label>
        <label>
          <span>Consultation Charge</span>
          <input
            type="number"
            value={consultationCharge}
            readOnly
          />
        </label>
        <label>
          <span>Medicine Charges</span>
          <input
            type="number"
            value={form.medicineCharges}
            onChange={(e) => setField("medicineCharges", e.target.value)}
          />
        </label>
        <label>
          <span>Lab Charges</span>
          <input type="number" value={form.labCharges} onChange={(e) => setField("labCharges", e.target.value)} />
        </label>
        <div className="rc-total">
          <span>Total</span>
          <strong>₹ {total}</strong>
        </div>
        <button className="rc-confirm" type="submit">
          <FileText size={15} /> Confirm Payment and Generate Invoice
        </button>
      </form>

      <div className="rc-card rc-invoice">
        <h3>Latest Invoice</h3>
        <div className="rc-invoice-box">
          <div>
            <strong>
              {invoice?.patientName || selectedAppointment?.patientName || selectedAppointment?.patient?.name || "-"}
            </strong>
            <span>{invoice ? "Invoice generated" : "No invoice generated yet"}</span>
          </div>
          <div className="rc-invoice-meta">
            <div className="rc-invoice-file">
              <button
                type="button"
                className="rc-icon-btn"
                aria-label="Invoice file options"
                aria-expanded={showInvoiceActions}
                disabled={!invoice}
                onClick={() => setShowInvoiceActions((prev) => !prev)}
              >
                <FileText size={18} />
              </button>
              {invoice && showInvoiceActions ? (
                <div className="rc-invoice-menu">
                  <button type="button" onClick={downloadInvoicePdf}>
                    <Download size={15} /> Download PDF
                  </button>
                </div>
              ) : null}
            </div>
            <div>
              <p>
                Status <b>{invoice ? getInvoiceStatus(invoice) : "Pending"}</b>
              </p>
              <p>
                Total <b>Rs {invoice?.totalAmount || invoice?.total || total}</b>
              </p>
              {invoice?.paymentMode ? (
                <p>
                  Payment <b>{invoice.paymentMode}</b>
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ReceptionBilling;

