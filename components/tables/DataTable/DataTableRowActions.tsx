import React, { useState } from "react";
import { Row } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  onView?: (value: TData) => void;
  onDelete?: (value: TData) => void;
  onUpdate?: (value: TData) => void;
  onDisable?: (value: TData) => void;
  className?: string;
}

const DataTableRowActions = <TData,>({
  row,
  onView,
  onDelete,
  onUpdate,
  onDisable,
  className = "",
}: DataTableRowActionsProps<TData>) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);

  const handleDelete = () => {
    onDelete && onDelete(row.original);
    setShowDeleteDialog(false);
  };

  const handleDisable = () => {
    onDisable && onDisable(row.original);
    setShowDisableDialog(false);
  };

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <span className="cusor-pointer sr-only sm:not-sr-only">...</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {onDelete && (
            <DropdownMenuCheckboxItem onClick={() => setShowDeleteDialog(true)}>
              <div className={"cursor-pointer text-[#344054]"}> Delete</div>
            </DropdownMenuCheckboxItem>
          )}
          {onDisable && (
            <DropdownMenuCheckboxItem
              onClick={() => setShowDisableDialog(true)}
            >
              <div className={"cursor-pointer text-[#344054]"}> Disable</div>
            </DropdownMenuCheckboxItem>
          )}
          {onView && (
            <DropdownMenuCheckboxItem onClick={() => onView(row.original)}>
              <div className={"cursor-pointer text-[#344054]"}>View</div>
            </DropdownMenuCheckboxItem>
          )}

          {onUpdate && (
            <DropdownMenuCheckboxItem onClick={() => onUpdate(row.original)}>
              <div className={"cursor-pointer text-[#344054]"}>Update</div>
            </DropdownMenuCheckboxItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This operation will delete this item and it cannot be recovered.
              Deleting this may lead to unexpected results and loss of data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, delete it!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Disable Confirmation Dialog */}
      <AlertDialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This operation will deactivate the item and it won&apos;t be shown
              to the users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisable}>
              Yes, disable it!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DataTableRowActions;
