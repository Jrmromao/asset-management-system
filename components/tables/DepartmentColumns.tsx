import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Check, X } from "lucide-react";
import React from "react";
import DataTableRowActions from "@/components/tables/DataTable/DataTableRowActions";
import { ColumnsProps } from "@/components/tables/table.types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const departmentColumns = ({
  onDelete,
  onUpdate,
}: ColumnsProps<Department>): ColumnDef<Department>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-medium text-gray-900">{row.getValue("name")}</span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Created At
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const value = new Date(row.getValue("createdAt"));
      return (
        <span className="text-sm text-gray-600">
          {value.toLocaleDateString()}
        </span>
      );
    },
  },
  {
    accessorKey: "active",
    header: "Active",
    cell: ({ row }) => {
      const value = row.getValue("active");
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={`flex items-center justify-center ${
                  value ? "text-green-600" : "text-red-500"
                }`}
                aria-label={value ? "Active" : "Inactive"}
              >
                {value ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <X className="w-5 h-5" />
                )}
              </span>
            </TooltipTrigger>
            <TooltipContent>{value ? "Active" : "Inactive"}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    meta: { align: "center" },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DataTableRowActions row={row} onDelete={onDelete} onUpdate={onUpdate} />
    ),
  },
];
