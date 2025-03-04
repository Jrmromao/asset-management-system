import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import LinkTableCell from "@/components/tables/LinkTableCell";
import React from "react";
import DataTableRowActions from "@/components/tables/DataTable/DataTableRowActions";

// const navigate = useRouter() cannot use hook in a non hook component
interface AssetColumnsProps {
  onDelete: (value: Asset) => void;
  onView: (value: Asset) => void;
}

export const userAssetColumns = ({
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
          Namee
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
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

      console.log(row.original);
      return <div>{value?.name}</div>;
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
      const value = row.original.model?.category;
      return (
        <LinkTableCell
          className={"hover:underline hover:text-red-500 hover:decoration-wavy"}
          value={value?.name}
          navigateTo={`/assets/view/${row.original.id}`}
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
