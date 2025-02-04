import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import DataTableRowActions from "@/components/tables/DataTable/DataTableRowActions";
import { BooleanCell, SortableHeader } from "@/components/tables/customCells";

interface StatusLabelColumnsProps {
  onDelete?: (value: StatusLabel) => void;
  onUpdate?: (value: StatusLabel) => void;
}

const ColorCell = ({
  color,
  description,
}: {
  color: string;
  description?: string;
}) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center">
      <div
        className="h-4 w-4 rounded-full border border-gray-200 shadow-sm mr-2"
        style={{
          backgroundColor: color as React.CSSProperties["backgroundColor"],
        }}
      />
      {description && (
        <span className="text-sm text-gray-500">{description}</span>
      )}
    </div>
  </div>
);

const DateCell = ({ date }: { date: string }) => (
  <div className="text-sm text-gray-600 flex items-center justify-center h-full">
    {new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })}
  </div>
);

export const statusLabelColumns = ({
  onDelete,
  onUpdate,
}: StatusLabelColumnsProps = {}): ColumnDef<StatusLabel>[] => [
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
    header: "Archivable",
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
