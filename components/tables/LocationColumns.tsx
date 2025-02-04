import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import React from "react";
import DataTableRowActions from "@/components/tables/DataTable/DataTableRowActions";
import { BooleanCell } from "@/components/tables/customCells";

interface LocationsColumnsProps {
  onDelete: (value: DepartmentLocation) => void;
  onUpdate: (value: DepartmentLocation) => void;
}

export const locationColumns = ({
  onDelete,
  onUpdate,
}: LocationsColumnsProps): ColumnDef<DepartmentLocation>[] => [
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
    accessorKey: "addressLine1",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Address
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const location = row.original;
      return (
        <div className="text-sm text-gray-600 space-y-0.5">
          <div className="font-medium text-gray-900">
            {location.addressLine1}
            {location.addressLine2 && (
              <span className="text-gray-600">, {location.addressLine2}</span>
            )}
          </div>
          <div>
            {[location.city, location.state, location.zip, location.country]
              .filter(Boolean)
              .join(", ")}
          </div>
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
          Created Date
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
    accessorKey: "active",
    header: "Active",
    cell: ({ row }) => <BooleanCell value={row.getValue("active")} />,
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
