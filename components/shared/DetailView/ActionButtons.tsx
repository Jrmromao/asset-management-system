"use client";

import React from "react";
import { DetailViewProps } from "./types";
import CustomButton from "@/components/CustomButton";
import {
  FaArchive,
  FaChevronLeft,
  FaChevronRight,
  FaCopy,
  FaPen,
  FaPrint,
  FaTools,
} from "react-icons/fa";
import { Skeleton } from "@/components/ui/skeleton";
import { ScheduleMaintenanceDialog } from "@/components/dialogs/ScheduleMaintenanceDialog";

export const ActionButtons: React.FC<{
  actions: NonNullable<DetailViewProps["actions"]>;
  isLoading?: boolean;
  isAssigned?: boolean;
  isActive?: boolean;
}> = ({ actions, isLoading, isAssigned, isActive }) => {
  if (isLoading) {
    return (
      <div className="w-full flex flex-col sm:flex-row lg:justify-end gap-2 md:flex-row md:justify-center mt-4 md:mt-0">
        {Array(5)
          .fill(null)
          .map((_, i) => (
            <Skeleton key={i} className="h-9 w-24" />
          ))}
      </div>
    );
  }

  return (
    <div className=" px-4 py-3 sm:px-6 flex-wrap w-full flex flex-col sm:flex-row lg:justify-end gap-2 md:flex-row md:justify-center mt-4 md:mt-0">
      {actions.onArchive && (
        <CustomButton
          size="sm"
          className="w-full sm:w-auto"
          action={actions.onArchive}
          value="Archive"
          Icon={FaArchive}
        />
      )}
      {actions.onOpenMaintenanceDialog && (
        <CustomButton
          size="sm"
          className="w-full sm:w-auto"
          action={actions.onOpenMaintenanceDialog}
          value="Set Maintenance"
          Icon={FaTools}
        />
      )}
      {isAssigned ? (
        <CustomButton
          size="sm"
          className="w-full sm:w-auto"
          action={actions.onUnassign}
          value="Checkin"
          Icon={FaChevronLeft}
        />
      ) : (
        actions.onAssign && (
          <CustomButton
            disabled={isActive}
            size="sm"
            className="w-full sm:w-auto"
            action={actions.onAssign}
            value="Checkout"
            Icon={FaChevronRight}
          />
        )
      )}
      {actions.onDuplicate && (
        <CustomButton
          className="w-full sm:w-auto md:w-auto"
          size="sm"
          action={actions.onDuplicate}
          value="Duplicate"
          Icon={FaCopy}
        />
      )}
      {actions.onEdit && (
        <CustomButton
          className="w-full sm:w-auto md:w-auto"
          size="sm"
          action={actions.onEdit}
          value="Edit"
          Icon={FaPen}
        />
      )}
      {actions.onPrintLabel && (
        <CustomButton
          className="w-full sm:w-auto md:w-auto"
          size="sm"
          action={actions.onPrintLabel}
          value="Print Label"
          Icon={FaPrint}
        />
      )}
    </div>
  );
};
