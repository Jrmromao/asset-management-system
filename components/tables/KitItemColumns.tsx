import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import LinkTableCell from "@/components/tables/LinkTableCell";
import React from "react";

// const navigate = useRouter() cannot use hook in a non hook component

export const KiltItemColumns = (): ColumnDef<Asset | License | Accessory>[] => [
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
    accessorKey: "quantity",
    header: "Remaining Quantity",
    cell: ({ row }) => {
      const value = row.getValue("model");
      const asset = row.original;
      return (
        <LinkTableCell
          value={value as string}
          navigateTo={`/assets/view/?id=${asset.id}`}
        />
      );
    },
  },
  {
    accessorKey: "checkoutQuantity",
    header: "Checkout Quantity",
  },
  // {
  //     id: "actions",
  //     cell: ({row}) => {
  //         return (
  //             <DataTableRowActions row={row} onDelete={onDelete} onView={onView}/>
  //         )
  //     },
  // },
];
