import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import React from "react";

interface IProps {
  open: boolean;
  onOpenChange: () => void;
  title: string;
  description: string;
  form: any;
  className?: string;
  body?: React.ReactNode;
}

export function DialogContainer({
  open,
  onOpenChange,
  title,
  description,
  form,
  className,
  body,
}: IProps) {
  return (
    <div className={"asset-dialog"}>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={className ? className + " max-w-3xl w-full" : "max-w-3xl w-full"}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className="text-gray-500 text-sm">
              {description}
            </DialogDescription>
          </DialogHeader>
          {body}
        </DialogContent>
      </Dialog>
    </div>
  );
}
