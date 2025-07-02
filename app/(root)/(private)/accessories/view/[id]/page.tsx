"use client";

import { useEffect, useState, use } from "react";
import { DetailView } from "@/components/shared/DetailView/DetailView";
import Link from "next/link";
// import { toast } from "sonner";
import toast from "react-hot-toast";
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
import { EnhancedAccessoryType } from "@/lib/services/accessory.service";

interface LoadingStates {
  isInitialLoading: boolean;
  isCheckingIn: Set<string>; // Track multiple check-in operations
  isAssigning: boolean;
  isRefreshing: boolean;
}

interface AssetPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Helper to safely format date values
function safeToISOString(dateValue: any) {
  const date = new Date(dateValue);
  return dateValue && !isNaN(date.getTime()) ? date.toISOString() : "-";
}

export default function Page({ params }: AssetPageProps) {
  const [error, setError] = useState<string | null>(null);
  const { id } = use(params);
  const { isAssignOpen, onAssignOpen, onAssignClose } = useAccessoryStore();
  const [accessory, setAccessory] = useState<EnhancedAccessoryType | undefined>(
    undefined,
  );

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
      setAccessory(foundAccessory as EnhancedAccessoryType);
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
      archive: () => toast.error("Archive action not implemented"),
      duplicate: () => toast.error("Duplicate action not implemented"),
      edit: () => toast.error("Edit action not implemented"),
      print: () => toast.error("Print label action not implemented"),
    };

    actions[action]();
  };

  const detailViewProps: DetailViewProps = {
    title: accessory?.name ?? "Untitled Accessory",
    isLoading: loadingStates.isInitialLoading || loadingStates.isRefreshing,
    co2Score:
      typeof accessory?.co2Score === "number"
        ? { co2e: accessory.co2Score, units: "kg" }
        : (accessory?.co2Score ?? { co2e: 0, units: "kg" }),
    units: "kg",
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
        value: safeToISOString(accessory?.createdAt),
        type: "date",
      },
      {
        label: "Last Updated",
        value: safeToISOString(accessory?.updatedAt),
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
              <Link href="/accessories">Accessories</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/accessories/view/${id}`}>View</Link>
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
    badge: accessory?.belowReorderPoint
      ? { text: "Below reorder point!", color: "warning" }
      : undefined,
  };

  return (
    <>
      {accessory ? <DetailView {...detailViewProps} /> : <DetailViewSkeleton />}
      <DialogContainer
        description="Assign this asset to a user"
        open={isAssignOpen}
        onOpenChange={onAssignClose}
        title="Accessory Checkout"
        form={null}
        body={
          <AssignmentForm
            itemId={id}
            type="accessory"
            assignAction={checkout}
            availableQuantity={
              accessory
                ? Math.max(
                    accessory.totalQuantity - accessory.unitsAllocated,
                    0,
                  )
                : 0
            }
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
          auditLogs={(accessory?.auditLogs ?? []) as any}
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
