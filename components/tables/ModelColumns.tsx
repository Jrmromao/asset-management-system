import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import React from "react";
import DataTableRowActions from "@/components/tables/DataTable/DataTableRowActions";
import { BooleanCell } from "@/components/tables/CustomCells";
import { ColumnsProps } from "@/components/tables/table.types";

export const modelColumns = ({
  onDelete,
  onUpdate,
}: ColumnsProps<Model>): ColumnDef<Model>[] => [
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
    accessorKey: "modelNo",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Model #
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "manufacturer",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Manufacturer
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const value = row.original;
      return (
        <div className="text-sm text-gray-600">{value.manufacturer?.name}</div>
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
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const value = new Date(row.getValue("createdAt"));
      const formattedDate = value.toLocaleDateString();
      return <div>{formattedDate}</div>;
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
