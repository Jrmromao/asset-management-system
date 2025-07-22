import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import React from "react";
import DataTableRowActions from "@/components/tables/DataTable/DataTableRowActions";
import { FormTemplate } from "@/types/form";

interface AssetCategoriesColumnsProps {
  onDelete: (category: FormTemplate) => void;
  onUpdate: (category: FormTemplate) => void;
}

export const assetCategoriesColumns = ({
  onDelete,
  onUpdate,
}: AssetCategoriesColumnsProps): ColumnDef<FormTemplate>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Category Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
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
    id: "actions",
    cell: ({ row }) => (
      <DataTableRowActions
        row={row}
        onDelete={() => onDelete(row.original)}
        onUpdate={() => onUpdate(row.original)}
      />
    ),
  },
];
