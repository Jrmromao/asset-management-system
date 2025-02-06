import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import DataTableRowActions from "@/components/tables/DataTable/DataTableRowActions";
import {
  BooleanCell,
  ColorCell,
  DateCell,
  SortableHeader,
} from "@/components/tables/CustomCells";
import { ColumnsProps } from "@/components/tables/table.types";

export const statusLabelColumns = ({
  onDelete,
  onUpdate,
}: ColumnsProps<StatusLabel>): ColumnDef<StatusLabel>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column} label="Name" />,
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "colorCode",
    header: "Description",
    cell: ({ row }) => {
      const statusLabel = row.original;
      return (
        <ColorCell
          color={row.getValue("colorCode")}
          description={statusLabel.description}
        />
      );
    },
  },
  {
    accessorKey: "isArchived",
    header: "Achievable",
    cell: ({ row }) => <BooleanCell value={row.getValue("isArchived")} />,
  },
  {
    accessorKey: "allowLoan",
    header: "Allow Loan",
    cell: ({ row }) => <BooleanCell value={row.getValue("allowLoan")} />,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <SortableHeader column={column} label="Created Date" />
    ),
    cell: ({ row }) => <DateCell date={row.getValue("createdAt")} />,
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
