import React from "react";
import { Clock, Edit, Trash2, Plus, User } from "lucide-react";

// Mock data for demonstration (replace with real query/fetch logic)
const mockLogs = [
  {
    id: 1,
    action: "created",
    user: "Alice Smith",
    timestamp: "2024-08-05T10:15:00Z",
    details: "Asset created with initial values.",
  },
  {
    id: 2,
    action: "updated",
    user: "Bob Lee",
    timestamp: "2024-08-06T14:22:00Z",
    details: "Changed status from 'Active' to 'Maintenance'.",
  },
  {
    id: 3,
    action: "deleted",
    user: "Charlie Kim",
    timestamp: "2024-08-07T09:05:00Z",
    details: "Removed old attachment.",
  },
];

const actionIcon = (action: string) => {
  switch (action) {
    case "created":
      return <Plus className="text-green-500" />;
    case "updated":
      return <Edit className="text-blue-500" />;
    case "deleted":
      return <Trash2 className="text-red-500" />;
    default:
      return <Clock className="text-gray-400" />;
  }
};

const actionLabel = (action: string) => {
  switch (action) {
    case "created":
      return "Created";
    case "updated":
      return "Updated";
    case "deleted":
      return "Deleted";
    default:
      return action.charAt(0).toUpperCase() + action.slice(1);
  }
};

const AuditLogTab: React.FC<{ assetId: string }> = ({ assetId }) => {
  // Replace mockLogs with real data fetch in production
  const logs = mockLogs; // TODO: fetch logs for assetId

  return (
    <div className="px-2 py-4">
      <h3 className="text-lg font-semibold mb-4">Audit Log</h3>
      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <Clock className="h-12 w-12 mb-4" />
          <p className="text-lg font-medium">No Audit Log Entries</p>
          <p className="text-sm text-muted-foreground">No audit activities have been recorded for this asset yet.</p>
        </div>
      ) : (
        <ol className="relative border-l border-gray-200 dark:border-gray-700">
          {logs.map((log) => (
            <li key={log.id} className="mb-8 ml-6 group">
              <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-white border-2 border-gray-200 rounded-full shadow-sm group-hover:border-primary transition">
                {actionIcon(log.action)}
              </span>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {actionLabel(log.action)}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-gray-500">{log.user}</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 max-w-prose">
                {log.details}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default AuditLogTab; 