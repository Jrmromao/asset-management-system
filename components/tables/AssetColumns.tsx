import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import LinkTableCell from "@/components/tables/LinkTableCell";
import React from "react";
import DataTableRowActions from "@/components/tables/DataTable/DataTableRowActions";
import { cn } from "@/lib/utils";

// const navigate = useRouter() cannot use hook in a non hook component
interface AssetColumnsProps {
  onDelete: (value: Asset) => void;
  onView: (value: Asset) => void;
}

export const assetColumns = ({
  onDelete,
  onView,
}: AssetColumnsProps): ColumnDef<Asset>[] => [
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
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-gray-100 transition-colors duration-200 group flex items-center gap-2 px-3 py-2 rounded-md"
        >
          <span className="font-medium text-gray-700">Status</span>
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as string;

      return (
        <div className="flex items-center">
          <span
            className={cn(
              "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
              {
                "bg-green-100 text-green-800": status === "Available",
                "bg-yellow-100 text-yellow-800": status === "In Use",
                "bg-blue-100 text-blue-800": status === "In Repair",
                "bg-red-100 text-red-800": status === "Inactive",
                "bg-gray-100 text-gray-800": status === "Pending",
              },
            )}
          >
            {status}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "assigneeId",
    header: "Assigned",
    cell: ({ row }) => {
      const value = row.getValue("assigneeId") as string;
      return <div>{value ? "Yes" : "No"}</div>;
    },
  },
  {
    accessorKey: "model",
    header: "Model",
    cell: ({ row }) => {
      const value = row.getValue("model") as Model;

      return <div>{value?.name ?? "-"}</div>;
    },
  },
  {
    header: "CO2 Footprint",
    cell: ({ row }) => {
      return <div>{"-"}</div>;
    },
  },
  {
    accessorKey: "serialNumber",
    header: "Serial Number",
  },
  {
    accessorKey: "statusLabel",
    header: "Status Label",
    cell: ({ row }) => {
      const value = row.getValue("statusLabel") as StatusLabel;
      return (
        <LinkTableCell value={value?.name} label={value} navigateTo={`#`} />
      );
    },
  },
  {
    accessorKey: "endOfLife",
    header: "Planned End of Life",
    cell: ({ row }) => {
      const value = new Date(row.getValue("endOfLife"));
      const formattedDate = value.toLocaleDateString();
      return <div>{formattedDate}</div>;
    },
  },

  {
    accessorKey: "category",
    header: "Category",

    cell: ({ row }) => {
      const value = row.original.formTemplate;
      return (
        <LinkTableCell
          className={"hover:underline"}
          value={value?.name}
          navigateTo={`/assets/view/${row.original.id}`}
        />
      );
    },
  },

  // {
  //     accessorKey: "customForm",
  //     // header: "Custom Form",
  //     header: ({column}) => {
  //         return (
  //             <div className="flex gap-1">
  //                 <div className={``}>Custom form</div>
  //                 <div className={`w-3/12 `}>
  //                     <Popover>
  //                         <PopoverTrigger asChild>
  //                             <InfoIcon className="h-4 w-4 "/>
  //                         </PopoverTrigger>
  //                         <PopoverContent className={`bg-white p-4 text-2sm`}>
  //                             This asset has a custom form
  //                         </PopoverContent>
  //                     </Popover>
  //                 </div>
  //             </div>
  //
  //         )
  //     },
  //
  //     cell: ({row}) => {
  //         const value = row.original.formTemplate;
  //         return <LinkTableCell className={'hover:underline hover:text-red-500 hover:decoration-wavy'}
  //                               value={value?.name} navigateTo={`/assets/view/${row.original.id}`}/>
  //     },
  // }
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <DataTableRowActions row={row} onDelete={onDelete} onView={onView} />
      );
    },
  },
];
