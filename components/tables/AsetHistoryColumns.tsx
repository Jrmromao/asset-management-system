"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Clock, Info } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export const assetHistoryColumns = (): ColumnDef<AssetHistory>[] => [
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
      return (
        <div className="space-y-1 p-2">
          <div className="text-xs text-gray-400 font-mono">ID: {data.id}</div>
        </div>
      );
    },
  },
];
