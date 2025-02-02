import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ExternalLink } from "lucide-react";
import React from "react";
import DataTableRowActions from "@/components/tables/DataTable/DataTableRowActions";

interface manufacturersColumnsProps {
  onDelete: (value: Manufacturer) => void;
  onUpdate: (value: Manufacturer) => void;
}

export const manufacturerColumns = ({
  onDelete,
  onUpdate,
}: manufacturersColumnsProps): ColumnDef<Manufacturer>[] => [
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
    accessorKey: "url",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Url
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const manufacturer = row.original;
      return (
        <div className="text-sm text-gray-600 hover:text-gray-900 transition-colors group flex items-center gap-2">
          <a
            href={manufacturer.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 hover:underline"
          >
            <ExternalLink className="w-4 h-4 group-hover:text-gray-900" />
            <span className="truncate max-w-[200px]">{manufacturer.url}</span>
          </a>
        </div>
      );
    },
  },

  {
    accessorKey: "supportEmail",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Support Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const manufacturer = row.original;
      return (
        <div className="text-sm text-gray-600 hover:text-gray-900 transition-colors group flex items-center gap-2">
          <span className="truncate max-w-[200px]">
            {manufacturer.supportEmail}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Registered Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const value = new Date(row.getValue("createdAt"));
      return (
        <div className="text-sm text-gray-600 hover:text-gray-900 transition-colors group flex items-center gap-2">
          <span className="truncate max-w-[200px]">
            {value.toLocaleDateString()}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <DataTableRowActions
          row={row}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      );
    },
  },
];
