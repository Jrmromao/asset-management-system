import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ConfirmationDialogProps {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  children?: React.ReactNode;
  variant?: "warning" | "danger" | "info";
}

const ConfirmationDialog = ({
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Continue",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  children,
  variant = "warning",
}: ConfirmationDialogProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "warning":
        return {
          icon: <AlertTriangle className="h-6 w-6 text-amber-500" />,
          confirmClass: "bg-amber-600 hover:bg-amber-700 text-white",
        };
      case "danger":
        return {
          icon: <AlertTriangle className="h-6 w-6 text-red-500" />,
          confirmClass: "bg-red-600 hover:bg-red-700 text-white",
        };
      default:
        return {
          icon: null,
          confirmClass: "bg-primary hover:bg-primary/90",
        };
    }
  };

  const { icon, confirmClass } = getVariantStyles();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children || <Button variant="outline">Open</Button>}
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-[425px] bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex gap-2 items-center">
            {icon}
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onCancel}
            className="bg-gray-100 hover:bg-gray-200"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className={confirmClass}>
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmationDialog;
