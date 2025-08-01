"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Activity, ArrowUpDown, Clock, Info, User } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { getActionColor } from "@/components/shared/DetailsTabs/action-colors";
import { SimpleAuditLog } from "@/types/audit";

interface AuditLogDataAccessed {
  assetId?: string;
  previousAssignee?: string;
  [key: string]: any;
}

export const auditLogColumns = (): ColumnDef<SimpleAuditLog>[] => [
  {
    id: "createdAt",
    accessorFn: (row) => new Date(row.createdAt).getTime(),
    enableSorting: true,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase"
        >
          <Clock className="w-4 h-4" />
          Date & Time
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const auditLog = row.original;
      return (
        <div className="text-sm text-gray-600">
          {formatDateTime(new Date(auditLog.createdAt)).dateTime}
        </div>
      );
    },
  },
  {
    id: "action",
    accessorFn: (row) => row.action,
    enableSorting: true,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase"
        >
          <Activity className="w-4 h-4" />
          Event Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const action = row.original.action;
      return (
        <div className={`text-sm font-medium ${getActionColor(action)}`}>
          {action}
        </div>
      );
    },
  },
  {
    id: "details",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase"
        >
          <Info className="w-4 h-4" />
          Details
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const data = row.original;
      const dataAccessed = data.dataAccessed as {
        assetId?: string;
        previousAssignee?: string;
        [key: string]: any;
      };
      return (
        <div className="space-y-1 p-2">
          <div className="text-sm text-gray-600">{data.details}</div>
          {dataAccessed && (
            <div className="text-xs text-gray-500 space-y-0.5">
              {dataAccessed.assetId && (
                <div>
                  <span className="font-medium">Item ID: </span>
                  <span className="font-mono">{dataAccessed.assetId}</span>
                </div>
              )}
              {dataAccessed.previousAssignee && (
                <div>
                  <span className="font-medium">Previous Assignee: </span>
                  <span className="font-mono">
                    {dataAccessed.previousAssignee}
                  </span>
                </div>
              )}
            </div>
          )}
          <div className="text-xs text-gray-400 font-mono">ID: {data.id}</div>
        </div>
      );
    },
  },
  {
    id: "performedBy",
    accessorFn: (row) => row.userId,
    enableSorting: true,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase"
        >
          <User className="w-4 h-4" />
          Performed By
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const data = row.original;
      const user = data.user as
        | { id: string; name?: string; email?: string; role?: string }
        | undefined;
      const name = user?.name || null;
      const email = user?.email || null;
      const userId = user?.id || data.userId;
      return (
        <div className="flex items-center">
          <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-gray-500" />
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              {name || email || userId || "Unknown"}
            </div>
            {email && <div className="text-xs text-gray-500">{email}</div>}
            {name && email && (
              <div className="text-xs text-gray-400">{userId}</div>
            )}
            {user?.role && (
              <div className="text-xs text-gray-400">{user.role}</div>
            )}
          </div>
        </div>
      );
    },
  },
];
