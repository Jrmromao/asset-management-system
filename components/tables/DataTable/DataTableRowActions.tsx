import React from "react";
import { Row } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  onView?: (value: TData) => void;
  onDelete?: (value: TData) => void;
  onUpdate?: (value: TData) => void;
}

const DataTableRowActions = <TData,>({
  row,
  onView,
  onDelete,
  onUpdate,
}: DataTableRowActionsProps<TData>) => {
  // const handleDelete = () => {
  //   Swal.fire({
  //     title: "Are you sure?",
  //     text: `You won't be able to revert this operation!`,
  //     icon: "warning",
  //     showCancelButton: true,
  //     confirmButtonColor: "#3085d6",
  //     cancelButtonColor: "#d33",
  //     confirmButtonText: "Yes, delete it!",
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       console.log(row.original);
  //       onDelete(row.original);
  //       // toast.success("The item has been deleted!");
  //     }
  //   });
  // };

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <span className="cusor-pointer sr-only sm:not-sr-only">...</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {onDelete && (
            <DropdownMenuCheckboxItem onClick={() => onDelete(row.original)}>
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
