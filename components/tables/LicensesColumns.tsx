"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import React from "react";
import DataTableRowActions from "@/components/tables/DataTable/DataTableRowActions";

interface LicenseColumnsProps {
  onDelete: (value: License) => void;
  onView: (value: License) => void;
}

// const navigate = useRouter() ncannot use hook in a non hook component

// Helper to safely format date values
function safeToLocaleDateString(dateValue: any) {
  const date = new Date(dateValue);
  return dateValue && !isNaN(date.getTime()) ? date.toLocaleDateString() : "-";
}

export const licenseColumns = ({
  onDelete,
  onView,
}: LicenseColumnsProps): ColumnDef<License>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      return <div>{safeToLocaleDateString(row.getValue("createdAt"))}</div>;
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Last Updated",
    cell: ({ row }) => {
      return <div>{safeToLocaleDateString(row.getValue("updatedAt"))}</div>;
    },
  },
  {
    accessorKey: "purchaseDate",
    header: "Date Purchased",
    cell: ({ row }) => {
      return <div>{safeToLocaleDateString(row.getValue("purchaseDate"))}</div>;
    },
  },
  {
    accessorKey: "renewalDate",
    header: "Renewal Date",
    cell: ({ row }) => {
      return <div>{safeToLocaleDateString(row.getValue("renewalDate"))}</div>;
    },
  },
  {
    accessorKey: "alertRenewalDays",
    header: "Alert Renewal Days",
    cell: ({ row }) => {
      const value = row.getValue("alertRenewalDays");
      return value !== undefined && value !== null && value !== ""
        ? String(value)
        : "-";
    },
  },
  {
    accessorKey: "licensedEmail",
    header: "Licensed Email",
    cell: ({ row }) => {
      const value = row.getValue("licensedEmail");
      return value ? String(value) : "-";
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <DataTableRowActions row={row} onDelete={onDelete} onView={onView} />
      );
    },
  },
];
