import React, { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import Header from "../../../components/superadmin/Header";
import Charts from "../../../components/superadmin/Charts";
import DataTable from "../../../components/superadmin/DataTable";
import SearchFilter from "../../../components/superadmin/SearchFilter";
import { fetchReports } from "../superAdminApi";

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
      render: (clinic) => `Rs. ${clinic.revenue.toLocaleString("en-IN")}`,
    },
    { key: "invoiceCount", label: "Invoices" },
    { key: "users", label: "Users" },
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
      row.status === "Active" ? "Healthy" : "Needs Review",
    ]);
    const csv = [header, ...body].map((line) => line.map(csvEscape).join(",")).join("\n");
    downloadFile("superadmin-reports.csv", csv, "text/csv;charset=utf-8");
  };

  const exportPdf = () => {
    const rowsHtml = filteredRows.map((row) => `
      <tr>
        <td>${row.adminName || "-"}</td>
        <td>${row.adminEmail || "-"}</td>
        <td>${row.name || "-"}</td>
        <td>Rs. ${Number(row.revenue || 0).toLocaleString("en-IN")}</td>
        <td>${row.invoiceCount || 0}</td>
        <td>${row.users || 0}</td>
        <td>${row.status || "-"}</td>
        <td>${row.status === "Active" ? "Healthy" : "Needs Review"}</td>
      </tr>
    `).join("");
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Super Admin Reports</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
            h1 { margin: 0 0 6px; font-size: 22px; }
            p { margin: 0 0 18px; color: #475569; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #dbe3ed; padding: 10px; text-align: left; font-size: 12px; }
            th { background: #f1f5f9; }
          </style>
        </head>
        <body>
          <h1>Super Admin Reports</h1>
          <p>Generated ${new Date().toLocaleString("en-IN")}</p>
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
            <button className="sa-btn sa-btn-primary" onClick={exportCsv} disabled={!filteredRows.length}>
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
        {!loading && !error ? <Charts data={chartData} type="line" dataKey="revenue" secondaryKey="users" /> : null}
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
