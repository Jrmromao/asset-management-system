import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Clock, User, Download } from "lucide-react";
import type { SimpleAuditLog } from "@/types/audit";

interface ActivityLogProps {
  sourceType: string;
  sourceId: string;
  auditLogs?: SimpleAuditLog[];
}

const actionLabel = (action: string) => {
  switch (action) {
    case "USER_CREATED":
      return "User Created";
    case "USER_UPDATED":
      return "User Updated";
    case "USER_SOFT_DELETED":
      return "User Deleted";
    default:
      return action.charAt(0).toUpperCase() + action.slice(1).toLowerCase();
  }
};

function exportLogsToCSV(logs: SimpleAuditLog[]) {
  if (!logs || logs.length === 0) return;
  const header = [
    "Date",
    "Action",
    "User",
    "Entity",
    "EntityId",
    "Details",
    "IP Address",
  ];
  const rows = logs.map((log) => [
    new Date(log.createdAt).toLocaleString(),
    actionLabel(log.action),
    log.user?.name || "Unknown",
    log.entity,
    log.entityId || "",
    log.details || "",
    log.ipAddress || "",
  ]);
  const csvContent = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "audit-logs.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const ActivityLog: React.FC<ActivityLogProps> = ({ auditLogs }) => {
  const [showAll, setShowAll] = useState(false);
  const logsToShow = showAll ? auditLogs : auditLogs?.slice(0, 10);
  return (
    <section className="flex w-full">
      <Card className="w-full mx-auto py-3 max-h-900 overflow-y-auto mt-2">
        <CardHeader className="px-4 text-xl flex flex-col gap-2">
          <span>Activity Log</span>
          <div className="flex gap-2 items-center">
            {auditLogs && auditLogs.length > 10 && (
              <button
                className="text-xs px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 border border-gray-300"
                onClick={() => setShowAll((prev) => !prev)}
              >
                {showAll ? "Show Top 10" : `Show All (${auditLogs.length})`}
              </button>
            )}
            {auditLogs && auditLogs.length > 0 && (
              <button
                className="text-xs px-3 py-1 rounded bg-blue-100 hover:bg-blue-200 border border-blue-300 flex items-center gap-1"
                onClick={() => exportLogsToCSV(auditLogs)}
                title="Export logs as CSV"
              >
                <Download className="h-4 w-4" /> Export Logs
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent className="max-h-900 overflow-y-auto">
          {!auditLogs || auditLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Clock className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">No Activity Log Entries</p>
              <p className="text-sm text-muted-foreground">No activity has been recorded for this user yet.</p>
            </div>
          ) : (
            <ol className="relative border-l border-gray-200 dark:border-gray-700">
              {logsToShow!.map((log) => (
                <li key={log.id} className="mb-8 ml-6 group">
                  <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-white border-2 border-gray-200 rounded-full shadow-sm group-hover:border-primary transition">
                    <Clock className="text-gray-400" />
                  </span>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {actionLabel(log.action)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-gray-500">
                      User: {log.user?.name || "Unknown"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 max-w-prose">
                    {log.details}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </section>
  );
};
export default ActivityLog;
