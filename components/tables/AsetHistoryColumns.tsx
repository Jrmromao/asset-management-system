"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Clock, Info } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

const typeLabels: Record<string, string> = {
  assignment: "Assigned",
  return: "Checked In",
  disposal: "Disposed",
  purchase: "Purchased",
  status_change: "Status Changed",
};

export const assetHistoryColumns = (): ColumnDef<AssetHistory>[] => [
  {
    id: "date",
    accessorFn: (row) => new Date(row.date).getTime(),
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
      const history = row.original;
      return (
        <div className="text-sm text-gray-600">
          {formatDateTime(new Date(history.date)).dateTime}
        </div>
      );
    },
  },
  {
    id: "type",
    header: "Type",
    cell: ({ row }) => {
      const history = row.original;
      return (
        <div className="text-sm text-gray-800">
          {typeLabels[history.type] || history.type}
        </div>
      );
    },
  },
  {
    id: "notes",
    header: "Notes",
    cell: ({ row }) => {
      const history = row.original;
      let notes = history.notes || "-";
      // Remove user IDs for readability (e.g., 'user cmcavp32m00118ozo6gowy820' -> 'user')
      notes = notes.replace(/user [a-z0-9]+/gi, "user");
      notes = notes.replace(/to user [a-z0-9]+/gi, "to user");
      notes = notes.replace(/from user [a-z0-9]+/gi, "from user");
      return (
        <div className="text-sm text-gray-700 whitespace-pre-line">{notes}</div>
      );
    },
  },
  {
    id: "details",
    header: "Details",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div className="space-y-1 p-2">
          <div className="text-xs text-gray-400 font-mono">ID: {data.id}</div>
        </div>
      );
    },
  },
];
