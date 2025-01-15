"use client";

import { useEffect, useState } from "react";
import { DetailView } from "@/components/shared/DetailView/DetailView";
import Link from "next/link";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { DialogContainer } from "@/components/dialogs/DialogContainer";
import AssignmentForm from "@/components/forms/AssignmentForm";
import { DetailViewProps } from "@/components/shared/DetailView/types";
import { checkin, checkout, findById } from "@/lib/actions/accessory.actions";
import { useAccessoryStore } from "@/lib/stores/accessoryStore";
import ItemDetailsTabs from "@/components/shared/DetailsTabs/ItemDetailsTabs";
import { sleep, sumUnitsAssigned } from "@/lib/utils";
import QRCode from "react-qr-code";
import DetailViewSkeleton from "@/components/shared/DetailView/DetailViewSkeleton";

interface LoadingStates {
  isInitialLoading: boolean;
  isCheckingIn: Set<string>; // Track multiple check-in operations
  isAssigning: boolean;
  isRefreshing: boolean;
}

interface AssetPageProps {
  params: {
    id: string;
  };
}

interface EnhancedAccessoryType {
  id: string;
  name: string;
  category: {
    name: string;
  } | null;
  statusLabel: {
    name: string;
    colorCode: string;
  } | null;
  modelNumber: string | null;
  location: {
    name: string;
  } | null;
  department: {
    name: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
  inventory: {
    name: string;
  } | null;
  totalQuantity: number;
  reorderPoint: number;
  unitsAllocated: number;
  alertEmail: string;
  supplier: {
    name: string;
  } | null;
  poNumber: string | null;
  auditLogs: AuditLog[];
  usedBy: UserItems[];
  co2Score?: number;
}

export default function Page({ params }: AssetPageProps) {
  const [error, setError] = useState<string | null>(null);
  const { id } = params;
  const { isAssignOpen, onAssignOpen, onAssignClose } = useAccessoryStore();
  const [accessory, setAccessory] = useState<
    EnhancedAccessoryType | undefined
  >();

  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    isInitialLoading: true,
    isCheckingIn: new Set<string>(),
    isAssigning: false,
    isRefreshing: false,
  });

  const updateLoadingState = (
    key: keyof Omit<LoadingStates, "isCheckingIn">,
    value: boolean,
  ) => {
    setLoadingStates((prev) => ({ ...prev, [key]: value }));
  };

  const addCheckingInId = (id: string) => {
    setLoadingStates((prev) => ({
      ...prev,
      isCheckingIn: new Set(prev.isCheckingIn).add(id),
    }));
  };

  const removeCheckingInId = (id: string) => {
    setLoadingStates((prev) => {
      const newSet = new Set(prev.isCheckingIn);
      newSet.delete(id);
      return { ...prev, isCheckingIn: newSet };
    });
  };

  const fetchAccessory = async (isRefresh = false) => {
    if (!id) return;

    try {
      updateLoadingState(isRefresh ? "isRefreshing" : "isInitialLoading", true);

      const response = await findById(id);
      if (response.error) {
        setError(response.error);
        return;
      }

      const foundAccessory = response.data;
      if (!foundAccessory) return;

      setAccessory({
        id: foundAccessory.id,
        name: foundAccessory.name,
        co2Score: 0,
        category: foundAccessory.category
          ? {
              name: foundAccessory.category.name,
            }
          : null,
        modelNumber: foundAccessory.modelNumber || null,
        statusLabel: foundAccessory.statusLabel
          ? {
              name: foundAccessory.statusLabel.name,
              colorCode: foundAccessory.statusLabel.colorCode,
            }
          : null,
        location: foundAccessory.departmentLocation
          ? {
              name: foundAccessory.departmentLocation.name,
            }
          : null,
        department: foundAccessory.department
          ? {
              name: foundAccessory.department.name,
            }
          : null,
        unitsAllocated: sumUnitsAssigned(foundAccessory.userAccessories ?? []),
        createdAt: new Date(foundAccessory.createdAt),
        updatedAt: new Date(foundAccessory.updatedAt),
        alertEmail: foundAccessory.alertEmail,
        inventory: foundAccessory.inventory
          ? {
              name: foundAccessory.inventory.name,
            }
          : null,
        poNumber: foundAccessory.poNumber || null,
        reorderPoint: foundAccessory.reorderPoint,
        supplier: foundAccessory.supplier
          ? {
              name: foundAccessory.supplier.name,
            }
          : null,
        totalQuantity: foundAccessory.totalQuantityCount,
        auditLogs: foundAccessory.auditLogs ?? [],
        usedBy: foundAccessory.userAccessories ?? [],
      });
    } catch (error) {
      console.error("Error fetching accessory:", error);
      setError("Failed to load accessory details");
    } finally {
      updateLoadingState(
        isRefresh ? "isRefreshing" : "isInitialLoading",
        false,
      );
    }
  };

  useEffect(() => {
    fetchAccessory();
  }, [id]);

  const handleCheckIn = async (userAccessoryId: string) => {
    const previousState = accessory;

    try {
      // Add to checking in set
      addCheckingInId(userAccessoryId);

      // Wait a moment to show the transition state
      await sleep(1000);

      // Make the actual API call
      const result = await checkin(userAccessoryId);

      if (result.error) {
        throw new Error(result.error);
      }

      // Wait a moment to show completion
      await sleep(500);

      // Update with server response to ensure consistency
      if (result.data) {
        setAccessory((prev) => {
          if (!prev) return undefined;

          const updatedUsedBy = prev.usedBy.filter(
            (ua) => ua.id !== userAccessoryId,
          );

          return {
            ...prev,
            usedBy: updatedUsedBy,
            unitsAllocated: sumUnitsAssigned(updatedUsedBy),
          };
        });
      }

      toast.success("Item checked in successfully");
    } catch (error) {
      console.error("Check-in error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to check in item",
      );
    } finally {
      removeCheckingInId(userAccessoryId);
    }
  };
  const handleAssignment = async (formData: any) => {
    try {
      updateLoadingState("isAssigning", true);

      // Optimistic update
      setAccessory((prev) =>
        prev
          ? {
              ...prev,
              unitsAllocated: prev.unitsAllocated + 1,
            }
          : undefined,
      );

      await checkout(formData);
      toast.success("Asset assigned successfully");
      onAssignClose();

      // Refresh data
      await fetchAccessory(true);
    } catch (error) {
      setAccessory((prev) =>
        prev
          ? {
              ...prev,
              unitsAllocated: Math.max(0, prev.unitsAllocated - 1),
            }
          : undefined,
      );
      toast.error("Failed to assign asset");
    } finally {
      updateLoadingState("isAssigning", false);
    }
  };

  const handleAction = (action: "archive" | "duplicate" | "edit" | "print") => {
    const actions: Record<typeof action, () => void> = {
      archive: () => toast.info("Archive action not implemented"),
      duplicate: () => toast.info("Duplicate action not implemented"),
      edit: () => toast.info("Edit action not implemented"),
      print: () => toast.info("Print label action not implemented"),
    };

    actions[action]();
  };

  const detailViewProps: DetailViewProps = {
    title: accessory?.name ?? "Untitled Accessory",
    isLoading: loadingStates.isInitialLoading || loadingStates.isRefreshing,
    co2Score: accessory?.co2Score ?? 0,
    error,
    fields: [
      { label: "Name", value: accessory?.name ?? "-", type: "text" },
      {
        label: "Category",
        value: accessory?.category?.name ?? "-",
        type: "text",
      },
      {
        label: "Model Number",
        value: accessory?.modelNumber ?? "-",
        type: "text",
      },
      {
        label: "Status",
        value: accessory?.statusLabel?.name ?? "-",
        type: "text",
      },
      {
        label: "Location",
        value: accessory?.location?.name ?? "-",
        type: "text",
      },
      {
        label: "Department",
        value: accessory?.department?.name ?? "-",
        type: "text",
      },
      {
        label: "Created At",
        value: accessory?.createdAt?.toISOString() ?? "-",
        type: "date",
      },
      {
        label: "Last Updated",
        value: accessory?.updatedAt?.toISOString() ?? "-",
        type: "date",
      },
      { label: "Quantity", value: accessory?.totalQuantity ?? 0, type: "text" },
      {
        label: "Reorder Point",
        value: accessory?.reorderPoint ?? 0,
        type: "text",
      },
      {
        label: "Alert Email",
        value: accessory?.alertEmail ?? "-",
        type: "text",
      },
      {
        label: "Supplier",
        value: accessory?.supplier?.name ?? "-",
        type: "text",
      },
      { label: "Units", value: accessory?.totalQuantity ?? 0, type: "text" },
      {
        label: "Units Allocated",
        value: accessory?.unitsAllocated ?? 0,
        type: "text",
      },
    ],
    breadcrumbs: (
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/assets">Accessories</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/assets/view/${id}`}>View</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
        </BreadcrumbList>
      </Breadcrumb>
    ),
    qrCode: (
      <div className="flex flex-col items-center justify-center gap-2">
        <QRCode value={`/assets/view/${id}`} size={140} />
      </div>
    ),
    actions: {
      onArchive: () => handleAction("archive"),
      onAssign: onAssignOpen,
      onUnassign: () => handleCheckIn,
      onDuplicate: () => handleAction("duplicate"),
      onEdit: () => handleAction("edit"),
      onPrintLabel: () => handleAction("print"),
    },
    sourceData: "accessory",
    checkoutDisabled:
      (accessory?.unitsAllocated ?? 0) >= (accessory?.totalQuantity ?? 0),
  };

  return (
    <>
      {accessory ? <DetailView {...detailViewProps} /> : <DetailViewSkeleton />}
      <DialogContainer
        description="Assign this asset to a user"
        open={isAssignOpen}
        onOpenChange={onAssignClose}
        title="Accessory Checkout"
        form={
          <AssignmentForm
            itemId={id}
            type="accessory"
            assignAction={checkout}
            onOptimisticUpdate={() => {
              setAccessory((prev) =>
                prev
                  ? {
                      ...prev,
                      unitsAllocated: prev.unitsAllocated + 1,
                    }
                  : undefined,
              );
            }}
            onSuccess={async () => {
              toast.success("Asset assigned successfully");
              onAssignClose();
              await fetchAccessory(); // Refresh data
            }}
            onError={() => {
              setAccessory((prev) =>
                prev
                  ? {
                      ...prev,
                      unitsAllocated: Math.max(0, prev.unitsAllocated - 1),
                    }
                  : undefined,
              );
              toast.error("Failed to assign asset");
            }}
          />
        }
      />
      <div className="mt-5">
        <ItemDetailsTabs
          handleCheckIn={handleCheckIn}
          auditLogs={accessory?.auditLogs ?? []}
          itemId={id}
          usedBy={accessory?.usedBy}
          itemType="accessory"
          isCheckingIn={loadingStates.isCheckingIn}
          isRefreshing={loadingStates.isRefreshing}
        />
      </div>
    </>
  );
}
