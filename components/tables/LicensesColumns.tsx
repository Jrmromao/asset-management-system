"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import LinkTableCell from "@/components/tables/LinkTableCell";
import React from "react";
import LEGACY_CustomTableCell from "@/components/tables/LEGACY_CustomTableCell";
import { TableCell } from "@/components/ui/table";

import { useAssetStore } from "@/lib/stores/assetStore";
import { formatDateTime } from "@/lib/utils";
import DataTableRowActions from "@/components/tables/DataTable/DataTableRowActions";

interface LicenseColumnsProps {
  onDelete: (value: License) => void;
  onView: (value: License) => void;
}
// const navigate = useRouter() ncannot use hook in a non hook component

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
      const value = new Date(row.getValue("createdAt"));
      const formattedDate = value.toLocaleDateString();
      return <div>{formattedDate}</div>;
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Last Updated",

    cell: ({ row }) => {
      const value = new Date(row.getValue("updatedAt"));
      const formattedDate = value.toLocaleDateString();
      return <div>{formattedDate}</div>;
    },
  },
  {
    accessorKey: "datePurchased",
    header: "Date Purchased",
    cell: ({ row }) => {
      // TODO: use fix this issue with the date format
      const license = row.original;
      return (
        <div className={"cursor-pointer"}>
          <LinkTableCell
            value={formatDateTime(license.purchaseDate).dateOnly}
            navigateTo={`/assets/view/?id=${license.id}`}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "renewalDate",
    header: "Renewal Date",
    cell: ({ row }) => {
      const license = row.original;
      return (
        <div className={"cursor-pointer"}>
          <LinkTableCell
            value={formatDateTime(license.renewalDate).dateOnly}
            navigateTo={`/assets/view/?id=${license.id}`}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "minCopiesAlert",
    header: "Min. Copies Alert",
  },
  {
    accessorKey: "alertRenewalDays",
    header: "Alert Renewal Days",
  },
  {
    accessorKey: "purchasePrice",
    header: "Purchase Price",
  },
  {
    accessorKey: "licenseCopiesCount",
    header: "License Copies Count",
  },
  {
    accessorKey: "licensedEmail",
    header: "Licensed Email",
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
