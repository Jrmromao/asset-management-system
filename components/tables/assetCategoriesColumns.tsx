import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import React from "react";
import { FormTemplate } from "@/types/form";
import DataTableRowActions from "@/components/tables/DataTable/DataTableRowActions";
import { BooleanCell } from "@/components/tables/CustomCells";
import { ColumnsProps } from "@/components/tables/table.types";

export const assetCategoriesColumns = ({
  onDelete,
  onUpdate,
}: ColumnsProps<FormTemplate>): ColumnDef<FormTemplate>[] => [
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
  //   accessorKey: "fields",
  //   header: "Fields",
  //   cell: ({ row }) => {
  //     return (
  //       <div className="overflow-x-auto" style={{ maxWidth: "650px" }}>
  //         {" "}
  //         {/* Add a max-width as needed */}
  //         <div className="flex items-center">
  //           {row.original.fields.map((field) => {
  //             return (
  //               <div className="mr-2" key={field.name}>
  //                 <div className="text-sm text-gray-600">{field.name}</div>
  //                 <div className="text-sm text-gray-400">{field.type}</div>
  //               </div>
  //             );
  //           })}
  //         </div>
  //       </div>
  //     );
  //   },
  // },
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
