import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Check, X } from "lucide-react";
import React from "react";

interface StatusLabel {
  id: string;
  name: string;
  colorCode: string;
  description: string;
  isArchived: boolean;
  allowLoan: boolean;
  createdAt: string;
}

interface StatusLabelColumnsProps {
  onDelete?: (value: StatusLabel) => void;
  onEdit?: (value: StatusLabel) => void;
}

const SortableHeader = ({ column, label }: { column: any; label: string }) => (
  <Button
    variant="ghost"
    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    className="hover:bg-transparent"
  >
    {label}
    <ArrowUpDown className="ml-2 h-4 w-4" />
  </Button>
);

const BooleanCell = ({ value }: { value: boolean }) => (
  <div className="flex items-center">
    {value ? (
      <Check className="w-5 h-5 text-green-500" />
    ) : (
      <X className="w-5 h-5 text-red-500" />
    )}
  </div>
);

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
  <div className="text-sm text-gray-600">
    {new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })}
  </div>
);

export const statusLabelColumns = ({
  onDelete,
  onEdit,
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
    id: "actions",
    enableSorting: false,
    cell: ({ row }) => {
      const statusLabel = row.original;

      return <a>...</a>;
    },
  },
];
