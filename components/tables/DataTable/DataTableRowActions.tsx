import React from "react";
import { Row } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Swal from "sweetalert2";
import { toast } from "sonner";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  onView: (value: TData) => void;
  onDelete: (value: TData) => void;
}

const DataTableRowActions = <TData,>({
  row,
  onView,
  onDelete,
}: DataTableRowActionsProps<TData>) => {
  const handleDelete = () => {
    Swal.fire({
      title: "Are you sure?",
      text: `You won't be able to revert this operation!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        onDelete(row.original);
        toast.success("The item has been deleted!");
      }
    });
  };

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <span className="cusor-pointer sr-only sm:not-sr-only">...</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem onClick={() => handleDelete()}>
            <div className={"cursor-pointer text-[#344054]"}> Delete</div>
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem onClick={() => onView(row.original)}>
            <div className={"cursor-pointer text-[#344054]"}>View</div>
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default DataTableRowActions;
