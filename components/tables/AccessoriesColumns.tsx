"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import LinkTableCell from "@/components/tables/LinkTableCell";
import React from "react";
import DataTableRowActions from "@/components/tables/DataTable/DataTableRowActions";

interface AccessoriesColumnsProps {
  onDelete: (value: Accessory) => void;
  onView: (value: Accessory) => void;
}

// const navigate = useRouter() cannot use hook in a non hook component
export const accessoriesColumns = ({
  onDelete,
  onView,
}: AccessoriesColumnsProps): ColumnDef<Accessory>[] => [
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
  // {
  //     accessorKey: "datePurchased",
  //     header: "Date Purchased",
  //     cell: ({row}) => {
  //         const accessory = row.original
  //         return (
  //             <div className={'cursor-pointer'}>
  //                 <LinkTableCell value={formatDateTime(accessory.purchaseDate).dateOnly}
  //                                                              navigateTo={`/accessories/view/?id=${accessory.id}`}/>
  //             </div>)
  //     }
  // },
  {
    accessorKey: "supplier",
    header: "Supplier",
    cell: ({ row }) => {
      const accessory = row.original;
      return (
        <LinkTableCell
          value={accessory.supplier?.name}
          navigateTo={`/accessories/view/?id=${accessory.id}`}
        />
      );
    },
  },
  {
    accessorKey: "alertEmail",
    header: "Alert Email",
    cell: ({ row }) => {
      const accessory = row.original;
      return (
        <LinkTableCell
          value={accessory.alertEmail}
          navigateTo={`/accessories/view/?id=${accessory.id}`}
        />
      );
    },
  },
  {
    accessorKey: "reorderPoint",
    header: "Min Quantity Alert",
    cell: ({ row }) => {
      const accessory = row.original;
      return (
        <LinkTableCell
          value={accessory.reorderPoint}
          navigateTo={`/accessories/view/?id=${accessory.id}`}
        />
      );
    },
  },
  {
    accessorKey: "totalQuantityCount",
    header: "Total Quantity Count",
    cell: ({ row }) => {
      const accessory = row.original;
      return (
        <LinkTableCell
          value={accessory.totalQuantityCount}
          navigateTo={`/accessories/view/?id=${accessory.id}`}
        />
      );
    },
  },
  {
    accessorKey: "inventory",
    header: "Inventory",
    cell: ({ row }) => {
      const accessory = row.original;
      return (
        <LinkTableCell
          value={accessory.inventory?.name}
          navigateTo={`/accessories/view/${accessory.id}`}
        />
      );
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
