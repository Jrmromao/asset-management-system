import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import React from "react";

interface AssetCategoriesColumnsProps {
  onDelete: (value: Asset) => void;
  onView: (value: Asset) => void;
}

export const assetCategoriesColumns = (): ColumnDef<FormTemplateValues>[] => [
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
];
