"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Activity, ArrowUpDown, Clock, User } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export const auditLogColumns = ({}): ColumnDef<AuditLog>[] => [
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
    accessorFn: (row) => row.action.toLowerCase(),
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
      return (
        <div className="text-sm text-gray-900">
          {row.original.action.split("_").join(" ")}
        </div>
      );
    },
  },
  {
    id: "targetUser",
    accessorFn: (row) => row.userId || row.userId,
    enableSorting: true,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase"
        >
          <User className="w-4 h-4" />
          Recipient
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const targetUserId = row.original.userId || row.original.userId;
      return (
        <div className="flex items-center">
          <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-gray-500" />
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              {targetUserId}
            </div>
            <div className="text-xs text-gray-500">User ID</div>
          </div>
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
      return (
        <div className="flex items-center">
          <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-gray-500" />
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              {row.original.userId}
            </div>
            <div className="text-xs text-gray-500">Administrator</div>
          </div>
        </div>
      );
    },
  },
];
