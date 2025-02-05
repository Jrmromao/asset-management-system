import React from "react";
import { Row } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Swal from "sweetalert2";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  onView?: (value: TData) => void;
  onDelete?: (value: TData) => void;
  onUpdate?: (value: TData) => void;
  className?: string;
}

const DataTableRowActions = <TData,>({
  row,
  onView,
  onDelete,
  onUpdate,
  className = "",
}: DataTableRowActionsProps<TData>) => {
  const handleDelete = () => {
    Swal.fire({
      title: "Are you sure?",
      text: `This operation will deactivate the item and it wont be shown to the users.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        console.log("row.original: ", row.original);
        onDelete && onDelete(row.original);
        // toast.success("The item has been deleted!");
      }
    });
  };

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <span className="cusor-pointer sr-only sm:not-sr-only">...</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {onDelete && (
            <DropdownMenuCheckboxItem onClick={() => handleDelete()}>
              <div className={"cursor-pointer text-[#344054]"}> Delete</div>
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
    </div>
  );
};

export default DataTableRowActions;
