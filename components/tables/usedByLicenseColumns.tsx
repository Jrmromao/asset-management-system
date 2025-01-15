import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, CheckCircle } from "lucide-react";
import LinkTableCell from "@/components/tables/LinkTableCell";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { cn } from "@/lib/utils";

interface UsedByColumnsProps {
  onCheckIn: (id: string) => Promise<void>;
  checkingInIds: Set<string>;
}

export const usedByLicenseColumns = ({
  onCheckIn,
  checkingInIds,
}: UsedByColumnsProps): ColumnDef<LicenseAssignment>[] => [
  {
    accessorKey: "user.name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase"
        >
          User Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const user = row.original.user;
      const isCheckingIn = checkingInIds.has(row.original.id);

      return (
        <div
          className={cn(
            "transition-all duration-500",
            isCheckingIn && "text-yellow-600",
          )}
        >
          <LinkTableCell
            value={user?.name}
            navigateTo={`/users/view/${user?.id}`}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "user.employeeId",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase"
        >
          Employee ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const isCheckingIn = checkingInIds.has(row.original.id);
      return (
        <div
          className={cn(
            "transition-all duration-500",
            isCheckingIn && "text-yellow-600",
          )}
        >
          {row.getValue("user.employeeId")}
        </div>
      );
    },
  },
  {
    accessorKey: "user.title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase"
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const isCheckingIn = checkingInIds.has(row.original.id);
      return (
        <div className={cn("transition-all duration-500")}>
          {row.getValue("user.title")}
        </div>
      );
    },
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase"
        >
          Quantity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const isCheckingIn = checkingInIds.has(row.original.id);
      return (
        <div
          className={cn(
            "transition-all duration-500",
            isCheckingIn && "text-yellow-600",
          )}
        >
          {row.getValue("quantity")}
        </div>
      );
    },
  },
  {
    accessorKey: "assignedAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase"
        >
          Assigned Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("assignedAt"));
      const isCheckingIn = checkingInIds.has(row.original.id);
      return (
        <div
          className={cn(
            "transition-all duration-500",
            isCheckingIn && "text-yellow-600",
          )}
        >
          {date.toLocaleDateString()}
        </div>
      );
    },
  },
  {
    accessorKey: "notes",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase"
        >
          Notes
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const isCheckingIn = checkingInIds.has(row.original.id);
      return (
        <div
          className={cn(
            "transition-all duration-500",
            isCheckingIn && "text-yellow-600",
          )}
        >
          {row.getValue("notes")}
        </div>
      );
    },
  },
  {
    accessorKey: "returnedAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const returnedAt = row.getValue("returnedAt");
      const isCheckingIn = checkingInIds.has(row.original.id);
      return (
        <div
          className={cn(
            "transition-all duration-500",
            returnedAt ? "text-red-500" : "text-green-500",
            isCheckingIn && "text-yellow-600",
          )}
        >
          {isCheckingIn ? "Checking in..." : returnedAt ? "Returned" : "Active"}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const returnedAt = row.original.assignedAt;
      const isCheckingIn = checkingInIds.has(row.original.id);

      if (returnedAt) return null;

      const handleConfirm = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
          await onCheckIn(row.original.id);
        } catch (error) {
          console.error("Failed to check in item:", error);
        }
      };

      return (
        <ConfirmationDialog
          title="Check in item?"
          description={`Are you sure you want to check in this item from ${row.original.user?.name}?`}
          confirmText="Yes, check it in"
          variant="warning"
          onConfirm={(e?: React.MouseEvent) => {
            if (e) e.preventDefault();
            return onCheckIn(row.original.id);
          }}
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 px-2 transition-colors",
              isCheckingIn
                ? "text-yellow-600 animate-pulse cursor-not-allowed"
                : "text-muted-foreground hover:text-green-600",
            )}
            aria-label={`Check in item from ${row.original.user?.name}`}
            disabled={isCheckingIn}
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
        </ConfirmationDialog>
      );
    },
  },
];
