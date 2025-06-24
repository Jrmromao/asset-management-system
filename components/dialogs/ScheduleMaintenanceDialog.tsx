"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MaintenanceForm } from "@/components/forms/MaintenanceForm";
import { type ReactNode, useState } from "react";

interface ScheduleMaintenanceDialogProps {
  children: ReactNode; // The trigger button
  onSuccess?: () => void;
  preselectedAssetId?: string;
}

export const ScheduleMaintenanceDialog = ({
  children,
  onSuccess,
  preselectedAssetId,
}: ScheduleMaintenanceDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule New Maintenance</DialogTitle>
          <DialogDescription>
            Fill out the details below to schedule a new maintenance event for an asset.
            This will help track maintenance costs, carbon footprint, and asset health.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <MaintenanceForm 
            onSuccess={handleSuccess}
            preselectedAssetId={preselectedAssetId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
