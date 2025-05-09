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
}

export function DialogContainer({
  open,
  onOpenChange,
  title,
  description,
  form,
}: IProps) {
  return (
    <div className={"asset-dialog"}>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[725px]">
          <Progress value={4} />
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className="text-gray-500 text-sm">
              {description}
            </DialogDescription>
          </DialogHeader>
          {form}
        </DialogContent>
      </Dialog>
    </div>
  );
}
