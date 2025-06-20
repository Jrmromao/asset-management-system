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
import { type ReactNode } from "react";

interface ScheduleMaintenanceDialogProps {
  children: ReactNode; // The trigger button
}

export const ScheduleMaintenanceDialog = ({
  children,
}: ScheduleMaintenanceDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Schedule New Maintenance</DialogTitle>
          <DialogDescription>
            Fill out the details below to add a new maintenance event for an
            asset.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <MaintenanceForm />
        </div>
      </DialogContent>
    </Dialog>
  );
};
