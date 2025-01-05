import { AlertCircle } from "lucide-react";
import { AlertItemProps } from "@/components/dashboard/types/dashboard";

export const AlertItem = ({ type, message }: AlertItemProps): JSX.Element => {
  const iconColors: Record<AlertItemProps["type"], string> = {
    warning: "text-amber-600",
    info: "text-blue-600",
    success: "text-emerald-600",
  };

  return (
    <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-2">
      <AlertCircle className={`h-4 w-4 ${iconColors[type]}`} />
      <span className="text-sm text-gray-600">{message}</span>
    </div>
  );
};
