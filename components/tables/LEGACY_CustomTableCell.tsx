import React, { useState } from "react";
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
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const LEGACY_CustomTableCell = ({
  id,
  deleteEntity,
  updateEntity,
  viewPath,
  setRefresh,
}: {
  id: string;
  entity: object;
  deleteEntity: (id: string) => void;
  updateEntity: (id: string) => void;
  viewPath: string;
  setRefresh: (flag: boolean) => void;
}) => {
  const navigate = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    deleteEntity(id);
    setRefresh(true);
    setShowDeleteDialog(false);
    toast.success("Item has been deleted successfully");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <span className="cusor-pointer sr-only sm:not-sr-only">...</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem
            onClick={() => navigate.push(`${viewPath}`)}
          >
            <div className={"cursor-pointer text-[#344054]"}>View</div>
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem onClick={() => updateEntity(id)}>
            <div className={"cursor-pointer text-[#344054]"}> Update</div>
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem onClick={() => setShowDeleteDialog(true)}>
            <div className={"cursor-pointer text-[#344054]"}> Delete</div>
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              You won&apos;t be able to revert this action!
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
    </>
  );
};
export default LEGACY_CustomTableCell;
