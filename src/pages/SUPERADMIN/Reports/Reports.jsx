import React, { useEffect, useMemo, useState } from "react";
import { BarChart3, Download, FileText, Receipt, Users } from "lucide-react";
import Header from "../../../components/superadmin/Header";
import Charts from "../../../components/superadmin/Charts";
import DashboardCards from "../../../components/superadmin/DashboardCards";
import DataTable from "../../../components/superadmin/DataTable";
import SearchFilter from "../../../components/superadmin/SearchFilter";
import { fetchReports } from "../superAdminApi";
import { formatIndianCurrency } from "../../../utils/format";

const downloadFile = (filename, content, type) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const csvEscape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
const htmlEscape = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const toNumber = (value) => Number(value || 0);
const getPerformance = (row) => (row.status === "Active" ? "Healthy" : "Needs Review");

const buildRowsHtml = (rows, columns) =>
  rows
    .map(
      (row) => `
      <tr>${columns.map((column) => `<td>${htmlEscape(row[column] ?? "-")}</td>`).join("")}</tr>
    `
    )
    .join("");

function Reports() {
  const [rows, setRows] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadReports = async () => {
      setLoading(true);
      setError("");

      try {
        const reports = await fetchReports();
        if (!active) return;

        setRows(reports.rows);
        setChartData(reports.chartData);
        setError(reports.error);
      } catch (requestError) {
        if (active) setError(requestError.message || "Unable to load reports.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadReports();

    return () => {
      active = false;
    };
  }, []);

  const columns = [
    { key: "adminName", label: "Admin" },
    { key: "name", label: "Clinic" },
    {
      key: "revenue",
      label: "Total Revenue",
      render: (clinic) => formatIndianCurrency(clinic.revenue),
    },
    {
      key: "invoiceCount",
      label: "Invoices",
      render: (clinic) =>
        clinic.invoiceCount !== undefined && clinic.invoiceCount !== null && clinic.invoiceCount !== ""
          ? Number(clinic.invoiceCount).toLocaleString("en-IN")
          : "-",
    },
    {
      key: "users",
      label: "Users",
      render: (clinic) =>
        clinic.users !== undefined && clinic.users !== null && clinic.users !== ""
          ? Number(clinic.users).toLocaleString("en-IN")
          : "-",
    },
    {
      key: "performance",
      label: "Clinic Performance",
      render: (clinic) => (clinic.status === "Active" ? "Healthy" : "Needs Review"),
    },
  ];

  const statusFilters = useMemo(
    () => ["All", ...Array.from(new Set(rows.map((row) => row.status).filter(Boolean)))],
    [rows]
  );

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesSearch = [row.adminName, row.adminEmail, row.name, row.revenue, row.users, row.status]
        .some((value) => String(value).toLowerCase().includes(query));
      const matchesStatus = status === "All" || row.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [rows, search, status]);

  const reportSummary = useMemo(() => {
    const revenueRows = filteredRows.filter((row) => toNumber(row.revenue) > 0);
    const userRows = revenueRows.length ? revenueRows : filteredRows;
    const totalRevenue = filteredRows.reduce((sum, row) => sum + toNumber(row.revenue), 0);
    const invoiceCount = filteredRows.reduce((sum, row) => sum + toNumber(row.invoiceCount), 0);
    const userCount = userRows.reduce((sum, row) => sum + toNumber(row.users), 0);
    const activeClinics = filteredRows.filter((row) => row.status === "Active").length;

    return {
      totalRevenue,
      invoiceCount,
      userCount,
      activeClinics,
      clinicCount: filteredRows.length,
    };
  }, [filteredRows]);

  const summaryCards = useMemo(
    () => [
      {
        label: "Total Revenue",
        value: formatIndianCurrency(reportSummary.totalRevenue),
        icon: Receipt,
        tone: "teal",
      },
      {
        label: "Invoices",
        value: reportSummary.invoiceCount.toLocaleString("en-IN"),
        icon: FileText,
        tone: "blue",
      },
      {
        label: "Users",
        value: reportSummary.userCount.toLocaleString("en-IN"),
        icon: Users,
        tone: "amber",
      },
      {
        label: "Active Clinics",
        value: `${reportSummary.activeClinics}/${reportSummary.clinicCount}`,
        icon: BarChart3,
        tone: "green",
      },
    ],
    [reportSummary]
  );

  const exportRows = useMemo(
    () =>
      filteredRows.map((row) => ({
        Admin: row.adminName || "-",
        "Admin Email": row.adminEmail || "-",
        Clinic: row.name || "-",
        Revenue: formatIndianCurrency(row.revenue),
        Invoices: row.invoiceCount || 0,
        Users: row.users || 0,
        Status: row.status || "-",
        Performance: getPerformance(row),
      })),
    [filteredRows]
  );

  const chartRows = useMemo(
    () =>
      chartData.map((point) => ({
        Period: point.name || "-",
        Revenue: formatIndianCurrency(point.revenue),
        Invoices: point.invoices || 0,
        Users: point.users || 0,
      })),
    [chartData]
  );

  const summaryRows = useMemo(
    () => [
      { Metric: "Total Revenue", Value: formatIndianCurrency(reportSummary.totalRevenue) },
      { Metric: "Invoices", Value: reportSummary.invoiceCount.toLocaleString("en-IN") },
      { Metric: "Users", Value: reportSummary.userCount.toLocaleString("en-IN") },
      { Metric: "Active Clinics", Value: `${reportSummary.activeClinics}/${reportSummary.clinicCount}` },
      { Metric: "Filter", Value: status },
      { Metric: "Search", Value: search.trim() || "All records" },
    ],
    [reportSummary, search, status]
  );

  const hasReportContent = exportRows.length > 0 || chartRows.length > 0;

  const exportExcel = () => {
    const summaryHtml = buildRowsHtml(summaryRows, ["Metric", "Value"]);
    const chartHtml = buildRowsHtml(chartRows, ["Period", "Revenue", "Invoices", "Users"]);
    const detailHtml = buildRowsHtml(exportRows, [
      "Admin",
      "Admin Email",
      "Clinic",
      "Revenue",
      "Invoices",
      "Users",
      "Status",
      "Performance",
    ]);
    const workbook = `
      <html>
        <head><meta charset="utf-8" /></head>
        <body>
          <h2>Super Admin Reports</h2>
          <p>Generated ${htmlEscape(new Date().toLocaleString("en-IN"))}</p>
          <h3>Summary Metrics</h3>
          <table border="1"><thead><tr><th>Metric</th><th>Value</th></tr></thead><tbody>${summaryHtml}</tbody></table>
          <h3>Usage Analytics</h3>
          <table border="1"><thead><tr><th>Period</th><th>Revenue</th><th>Invoices</th><th>Users</th></tr></thead><tbody>${chartHtml || '<tr><td colspan="4">No chart data found.</td></tr>'}</tbody></table>
          <h3>Filtered Report Data</h3>
          <table border="1">
            <thead><tr><th>Admin</th><th>Admin Email</th><th>Clinic</th><th>Revenue</th><th>Invoices</th><th>Users</th><th>Status</th><th>Performance</th></tr></thead>
            <tbody>${detailHtml || '<tr><td colspan="8">No report records found.</td></tr>'}</tbody>
          </table>
        </body>
      </html>
    `;
    downloadFile("superadmin-reports.xls", workbook, "application/vnd.ms-excel;charset=utf-8");
  };

  const exportCsv = () => {
    const header = ["Admin", "Admin Email", "Clinic", "Revenue", "Invoices", "Users", "Status", "Performance"];
    const body = filteredRows.map((row) => [
      row.adminName,
      row.adminEmail,
      row.name,
      row.revenue,
      row.invoiceCount,
      row.users,
      row.status,
      getPerformance(row),
    ]);
    const csv = [header, ...body].map((line) => line.map(csvEscape).join(",")).join("\n");
    downloadFile("superadmin-reports.csv", csv, "text/csv;charset=utf-8");
  };

  const exportPdf = () => {
    const summaryHtml = buildRowsHtml(summaryRows, ["Metric", "Value"]);
    const chartHtml = buildRowsHtml(chartRows, ["Period", "Revenue", "Invoices", "Users"]);
    const rowsHtml = buildRowsHtml(exportRows, [
      "Admin",
      "Admin Email",
      "Clinic",
      "Revenue",
      "Invoices",
      "Users",
      "Status",
      "Performance",
    ]);
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Super Admin Reports</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
            h1 { margin: 0 0 6px; font-size: 22px; }
            h2 { margin: 24px 0 10px; font-size: 16px; }
            p { margin: 0 0 14px; color: #475569; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
            th, td { border: 1px solid #dbe3ed; padding: 10px; text-align: left; font-size: 12px; }
            th { background: #f1f5f9; }
            .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 18px 0; }
            .metric { border: 1px solid #dbe3ed; padding: 12px; border-radius: 8px; }
            .metric b { display: block; font-size: 16px; }
            .metric span { color: #475569; font-size: 11px; }
            .bars { display: grid; gap: 8px; margin-bottom: 16px; }
            .bar-row { display: grid; grid-template-columns: 90px 1fr 80px; gap: 8px; align-items: center; font-size: 12px; }
            .bar { height: 10px; background: #e2e8f0; border-radius: 999px; overflow: hidden; }
            .bar i { display: block; height: 100%; background: #0f766e; }
          </style>
        </head>
        <body>
          <h1>Super Admin Reports</h1>
          <p>Generated ${new Date().toLocaleString("en-IN")}</p>
          <div class="metrics">
            <div class="metric"><b>${formatIndianCurrency(reportSummary.totalRevenue)}</b><span>Total Revenue</span></div>
            <div class="metric"><b>${reportSummary.invoiceCount.toLocaleString("en-IN")}</b><span>Invoices</span></div>
            <div class="metric"><b>${reportSummary.userCount.toLocaleString("en-IN")}</b><span>Users</span></div>
            <div class="metric"><b>${reportSummary.activeClinics}/${reportSummary.clinicCount}</b><span>Active Clinics</span></div>
          </div>
          <h2>Summary Metrics</h2>
          <table>
            <thead><tr><th>Metric</th><th>Value</th></tr></thead>
            <tbody>${summaryHtml}</tbody>
          </table>
          <h2>Usage Analytics</h2>
          <div class="bars">
            ${
              chartRows
                .map((row) => {
                  const maxRevenue = Math.max(...chartData.map((point) => toNumber(point.revenue)), 1);
                  const sourcePoint = chartData.find((point) => point.name === row.Period) || {};
                  const width = Math.max(4, Math.round((toNumber(sourcePoint.revenue) / maxRevenue) * 100));
                  return `<div class="bar-row"><span>${htmlEscape(row.Period)}</span><div class="bar"><i style="width:${width}%"></i></div><strong>${htmlEscape(row.Revenue)}</strong></div>`;
                })
                .join("") || "<p>No chart data found.</p>"
            }
          </div>
          <table>
            <thead><tr><th>Period</th><th>Revenue</th><th>Invoices</th><th>Users</th></tr></thead>
            <tbody>${chartHtml || '<tr><td colspan="4">No chart data found.</td></tr>'}</tbody>
          </table>
          <h2>Filtered Report Data</h2>
          <table>
            <thead>
              <tr>
                <th>Admin</th>
                <th>Email</th>
                <th>Clinic</th>
                <th>Revenue</th>
                <th>Invoices</th>
                <th>Users</th>
                <th>Status</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>${rowsHtml || '<tr><td colspan="8">No report records found.</td></tr>'}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <>
      <Header
        title="Reports"
        subtitle="Admin-wise clinic revenue, user activity, and performance reports."
        action={
          <>
            <button className="sa-btn" onClick={exportPdf} disabled={!filteredRows.length}>
              <Download size={16} />
              Export PDF
            </button>
            <button className="sa-btn sa-btn-primary" onClick={exportExcel} disabled={!hasReportContent}>
              <Download size={16} />
              Export Excel
            </button>
          </>
        }
      />

      <SearchFilter
        value={search}
        onChange={setSearch}
        placeholder="Search reports by admin, clinic, revenue, users, or status..."
        filters={statusFilters}
        selectedFilter={status}
        onFilterChange={setStatus}
      />

      <div className="sa-panel">
        <h3>Reports Dashboard</h3>
        <p>Monthly total revenue and admin-wise usage trend.</p>
        {loading ? <div className="sa-state">Loading reports...</div> : null}
        {!loading && error ? <div className="sa-state sa-state--error">{error}</div> : null}
        {!loading && !error ? (
          <>
            <DashboardCards cards={summaryCards} />
            <Charts data={chartData} type="bar" dataKey="revenue" />
          </>
        ) : null}
      </div>

      <div style={{ marginTop: 16 }}>
        <DataTable
          columns={columns}
          rows={filteredRows}
          loading={loading}
          error={error}
          emptyMessage="No report records found."
        />
      </div>
    </>
  );
}

export default Reports;
