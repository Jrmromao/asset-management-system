import React, { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
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
    case "USER_ACTIVATED":
      return "User Activated";
    case "USER_DEACTIVATED":
      return "User Deactivated";
    case "USER_NOTES_UPDATED":
      return "User Notes Updated";
    default:
      return action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
};

const actionIcon = (action: string) => {
  switch (action) {
    case "USER_CREATED":
      return <User className="text-green-500 h-5 w-5" />;
    case "USER_UPDATED":
      return <User className="text-blue-500 h-5 w-5" />;
    case "USER_SOFT_DELETED":
      return <User className="text-red-500 h-5 w-5" />;
    case "USER_ACTIVATED":
      return <User className="text-green-600 h-5 w-5" />;
    case "USER_DEACTIVATED":
      return <User className="text-yellow-600 h-5 w-5" />;
    default:
      return <Clock className="text-gray-400 h-5 w-5" />;
  }
};

function renderChanges(changes: any[]) {
  if (!Array.isArray(changes) || changes.length === 0) return null;
  return (
    <ul className="text-xs text-gray-700 mt-2 ml-2 border-l pl-3 border-blue-200">
      {changes.map((chg, idx) => (
        <li key={idx} className="mb-1">
          <span className="font-semibold">{chg.field}:</span>{" "}
          <span className="text-red-600 line-through">
            {String((chg as any)?.before)}
          </span>{" "}
          <span className="mx-1">→</span>{" "}
          <span className="text-green-600">{String((chg as any)?.after)}</span>
        </li>
      ))}
    </ul>
  );
}

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
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
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
  const [expanded, setExpanded] = useState<{ [id: string]: boolean }>({});
  const logsToShow = showAll ? auditLogs : auditLogs?.slice(0, 5);
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
                {showAll ? "Show Top 5" : `Show All (${auditLogs.length})`}
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
              <p className="text-sm text-muted-foreground">
                No activity has been recorded for this user yet.
              </p>
            </div>
          ) : (
            <ol className="relative border-l border-gray-200 dark:border-gray-700">
              {logsToShow!.map((log) => {
                const isExpanded = expanded[log.id];
                const changes = Array.isArray(
                  (log.dataAccessed as any)?.changes,
                )
                  ? (log.dataAccessed as any).changes
                  : [];
                return (
                  <li key={log.id} className="mb-8 ml-6 group">
                    <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-white border-2 border-gray-200 rounded-full shadow-sm group-hover:border-primary transition">
                      {actionIcon(log.action)}
                    </span>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                        {actionLabel(log.action)}
                      </span>
                      <span
                        className="text-xs text-gray-400"
                        title={format(new Date(log.createdAt), "PPpp")}
                      >
                        {format(new Date(log.createdAt), "Pp")} (
                        {formatDistanceToNow(new Date(log.createdAt), {
                          addSuffix: true,
                        })}
                        )
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-gray-500">
                        By:{" "}
                        {log.user?.name && (log.user as any)?.email
                          ? `${log.user.name} (${(log.user as any).email})`
                          : log.user?.name
                            ? log.user.name
                            : (log.user as any)?.email
                              ? (log.user as any).email
                              : "Unknown User"}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 max-w-prose">
                      {log.details}
                      {changes.length > 0 && (
                        <>
                          <button
                            className="ml-2 text-xs text-blue-600 underline cursor-pointer"
                            onClick={() =>
                              setExpanded((prev) => ({
                                ...prev,
                                [log.id]: !isExpanded,
                              }))
                            }
                          >
                            {isExpanded ? "Hide Changes" : "Show Changes"}
                          </button>
                          {isExpanded && renderChanges(changes)}
                        </>
                      )}
                    </div>
                    {isExpanded && log.dataAccessed && (
                      <div className="mt-2 p-2 bg-gray-50 border rounded text-xs">
                        <div className="font-semibold mb-1">Before:</div>
                        <pre className="overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(
                            (log.dataAccessed as any)?.before,
                            null,
                            2,
                          )}
                        </pre>
                        <div className="font-semibold mt-2 mb-1">After:</div>
                        <pre className="overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(
                            (log.dataAccessed as any)?.after,
                            null,
                            2,
                          )}
                        </pre>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </CardContent>
      </Card>
    </section>
  );
};
export default ActivityLog;
