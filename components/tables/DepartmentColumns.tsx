import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import React from "react";

interface DepartmentColumnsProps {
  onDelete: (value: Asset) => void;
  onView: (value: Asset) => void;
}

export const departmentColumns = (): ColumnDef<Department>[] => [
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
    enableSorting: false,
    enableHiding: false,
    header: () => <span>Actions</span>,
    cell: ({ row }) => {
      return <div className="flex items-center gap-2">...</div>;
    },
  },
];
