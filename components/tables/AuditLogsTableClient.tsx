"use client";
import { DataTable } from "@/components/tables/DataTable/data-table";
import { auditLogColumns } from "@/components/tables/AuditLogColumns";
import { SimpleAuditLog } from "@/types/audit";
import React from "react";

function toCsvValue(value: any): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // Escape quotes and wrap in quotes if needed
  if (str.includes(",") || str.includes("\"") || str.includes("\n")) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function logsToCsv(logs: SimpleAuditLog[]): string {
  const headers = [
    "Date/Time",
    "Action",
    "Entity",
    "Entity ID",
    "Details",
    "Performed By",
    "IP Address",
  ];
  const rows = logs.map((log) => [
    log.createdAt ? new Date(log.createdAt).toLocaleString() : "",
    log.action ?? "",
    log.entity ?? "",
    log.entityId ?? "",
    log.details ?? "",
    log.userId ?? "",
    log.ipAddress ?? "",
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map(toCsvValue).join(","))
    .join("\n");
  return csv;
}

export default function AuditLogsTableClient({ logs }: { logs: SimpleAuditLog[] }) {
  const handleExport = () => {
    const csv = logsToCsv(logs);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert(`Exported ${logs.length} audit log record${logs.length === 1 ? '' : 's'} as CSV.`);
  };

  return (
    <div>
      {/* Placeholder for future search/filter controls */}
      <div className="flex justify-end mb-4">
        <button
          className="bg-green-700 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-green-800 transition"
          onClick={handleExport}
        >
          Export CSV
        </button>
      </div>
      <DataTable columns={auditLogColumns()} data={logs} />
    </div>
  );
}

