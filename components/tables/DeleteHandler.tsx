import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import ConfirmationDialog from "@/components/ConfirmationDialog";

const DeleteHandler = ({
  id,
  onDelete,
}: {
  id: string;
  onDelete?: (id: string) => object;
}) => {
  const handleDelete = (e: React.MouseEvent) => {
    if (e) e.preventDefault();
    onDelete ? onDelete(id) : undefined;
  };

  return (
    <ConfirmationDialog
      title="Delete item?"
      description="Are you sure you want to delete this item?"
      confirmText="Yes, delete it"
      variant="danger"
      onConfirm={() => handleDelete}
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn("h-8 px-2 transition-colors hover:text-red-600")}
        aria-label="Delete item"
      >
        <CheckCircle className="h-4 w-4" />
      </Button>
    </ConfirmationDialog>
  );
};

export default DeleteHandler;
