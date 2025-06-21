import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IconType } from "react-icons";

interface CustomButtonProps {
  size?: "sm" | "lg" | "default" | "icon" | null | undefined;
  action?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  value: string;
  Icon: IconType;
  className?: string;
  disabled?: boolean;
}

const CustomButton = ({
  size = "sm",
  action,
  value,
  Icon,
  className,
  disabled,
}: CustomButtonProps) => {
  return (
    <div>
      <Button
        size={size}
        onClick={action}
        disabled={disabled}
        className={cn(
          "bg-emerald-600 text-white font-medium flex items-center transition-all duration-200 ease-in-out hover:bg-emerald-700 hover:shadow-lg hover:scale-[1.02]",
          className,
        )}
      >
        <Icon className="w-4 h-4 mr-2" />
        <span>{value}</span>
      </Button>
    </div>
  );
};
export default CustomButton;
