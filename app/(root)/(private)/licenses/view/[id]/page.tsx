"use client";

import { useEffect, useState, use } from "react";
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
import { checkin, checkout, findById } from "@/lib/actions/license.actions";
import { useAccessoryStore } from "@/lib/stores/accessoryStore";
import ItemDetailsTabs from "@/components/shared/DetailsTabs/ItemDetailsTabs";
import { sleep, sumSeatsAssigned } from "@/lib/utils";
import DetailViewSkeleton from "@/components/shared/DetailView/DetailViewSkeleton";

interface AssetPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface EnhancedLicenseType {
  id: string;
  name: string;
  statusLabel: {
    name: string;
    colorCode: string;
  };
  purchaseDate: Date;
  renewalDate: Date;
  co2Score?: number;
  location: {
    name: string;
  };
  department: {
    name: string;
  };
  assigneeId?: string;
  usedBy: UserItems[];
  inventory: {
    name: string;
  };
  seats: number;
  seatsAllocated: number;
  reorderPoint: number;
  seatsAlert: string;
  supplier: {
    name: string;
  };
  poNumber: string;
  auditLogs: AuditLog[];
}

interface LoadingStates {
  isInitialLoading: boolean;
  isCheckingIn: Set<string>;
  isAssigning: boolean;
  isRefreshing: boolean;
}

export default function View({ params }: AssetPageProps) {
  const [error, setError] = useState<string | null>(null);
  const { id } = use(params); // ✅ Use use(params) to properly await the promise
  const { isAssignOpen, onAssignOpen, onAssignClose } = useAccessoryStore();
  const [license, setLicense] = useState<EnhancedLicenseType | undefined>();
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

  const fetcdData = async (isRefresh = false) => {
    if (!id) return;

    try {
      updateLoadingState(isRefresh ? "isRefreshing" : "isInitialLoading", true);

      const response = await findById(id);
      if (response.error) {
        setError(response.error);
        return;
      }

      const foundLicense = response.data;
      if (!foundLicense) return;

      setLicense({
        id: foundLicense?.id!,
        name: foundLicense?.name ?? "",
        co2Score: 23,
        statusLabel: {
          name: foundLicense?.statusLabel?.name ?? "",
          colorCode: foundLicense?.statusLabel?.colorCode ?? "#000000",
        },
        location: {
          name: foundLicense?.departmentLocation?.name ?? "",
        },
        department: {
          name: foundLicense?.department?.name ?? "",
        },
        purchaseDate: foundLicense?.purchaseDate ?? new Date(),
        renewalDate: foundLicense?.renewalDate ?? new Date(),
        inventory: {
          name: foundLicense?.inventory?.name ?? "",
        },
        auditLogs: foundLicense?.auditLogs ?? [],
        seats: foundLicense?.seats ?? 0,
        seatsAllocated: sumSeatsAssigned(foundLicense?.users ?? []),
        reorderPoint: foundLicense?.minSeatsAlert ?? 0,
        seatsAlert: foundLicense?.licensedEmail ?? "",
        supplier: {
          name: foundLicense?.supplier?.name ?? "",
        },
        poNumber: foundLicense?.poNumber ?? "",
        usedBy: foundLicense?.userLicenses ?? [],
      });
    } catch (error) {
      console.error("Error fetching license:", error);
      setError("Failed to fetch license details");
    } finally {
      updateLoadingState(
        isRefresh ? "isRefreshing" : "isInitialLoading",
        false,
      );
    }
  };

  useEffect(() => {
    fetcdData();
  }, [id]);

  const handleCheckIn = async (userLicenseId: string) => {
    const previousState = license;

    try {
      addCheckingInId(userLicenseId);

      // Wait a moment to show the transition state
      await sleep(1000);

      // Optimistic update including usedBy
      setLicense((prev) => {
        if (!prev) return undefined;
        const updatedUsedBy = prev.usedBy.filter(
          (ul) => ul.id !== userLicenseId,
        );
        return {
          ...prev,
          seatsAllocated: Math.max(0, prev.seatsAllocated - 1),
          usedBy: updatedUsedBy,
        };
      });

      const result = await checkin(userLicenseId);

      if (!result.data || result.error) {
        throw new Error(result.error || "Failed to check in license");
      }

      // Wait a moment to show completion
      await sleep(500);

      // Fetch fresh data
      await fetcdData(true);
      toast.success("License seat released successfully");
    } catch (error) {
      setLicense(previousState);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to release license seat",
      );
    } finally {
      removeCheckingInId(userLicenseId);
    }
  };
  const handleAction = (action: "archive" | "duplicate" | "edit" | "print") => {
    const actions: Record<typeof action, () => void> = {
      archive: () => toast.info("Archive action not implemented"),
      duplicate: () => toast.info("Duplicate action not implemented"),
      edit: () => toast.info("Edit action not implemented", { id: "edit" }),
      print: () => toast.info("Print label action not implemented"),
    };

    actions[action]();
  };
  const detailViewProps: DetailViewProps = {
    title: license?.name ?? "Untitled License",
    isLoading: false,
    co2Score:
      typeof license?.co2Score === "number"
        ? { co2e: license.co2Score, units: "kg" }
        : (license?.co2Score ?? { co2e: 0, units: "kg" }),
    units: "kg",
    isAssigned: Boolean(license?.assigneeId),
    error,
    fields: [
      { label: "Name", value: license?.name ?? "", type: "text" },
      {
        label: "Status",
        value: license?.statusLabel?.name ?? "",
        type: "text",
      },
      {
        label: "Location",
        value: license?.location?.name ?? "",
        type: "text",
      },
      {
        label: "Department",
        value: license?.department?.name ?? "",
        type: "text",
      },
      {
        label: "Purchase Date",
        value: license?.purchaseDate
          ? new Date(license.purchaseDate).toLocaleDateString()
          : "",
        type: "text",
      },
      {
        label: "Renewal Date",
        value: license?.renewalDate
          ? new Date(license.renewalDate).toLocaleDateString()
          : "",
        type: "text",
      },
      {
        label: "Inventory",
        value: license?.inventory?.name ?? "",
        type: "text",
      },
      {
        label: "Reorder Point",
        value: license?.reorderPoint ?? 0,
        type: "text",
      },
      {
        label: "Alert Email",
        value: license?.seatsAlert ?? "",
        type: "text",
      },
      {
        label: "Supplier",
        value: license?.supplier?.name ?? "",
        type: "text",
      },
      { label: "PO Number", value: license?.poNumber ?? "", type: "text" },
      { label: "Seats", value: license?.seats ?? 0, type: "text" },
      {
        label: "Seats Allocated",
        value: license?.seatsAllocated ?? 0,
        type: "text",
      },
    ],
    breadcrumbs: (
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/licenses">Licenses</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/licenses/${id}`}>View</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
        </BreadcrumbList>
      </Breadcrumb>
    ),
    qrCode: null,
    actions: {
      onArchive: () => handleAction("archive"),
      onAssign: license?.assigneeId ? undefined : () => onAssignOpen(),
      onUnassign: license?.assigneeId ? () => handleCheckIn : undefined,
      onDuplicate: () => handleAction("duplicate"),
      onEdit: () => handleAction("edit"),
    },
    sourceData: "license",
  };

  return (
    <>
      {license ? <DetailView {...detailViewProps} /> : <DetailViewSkeleton />}

      <DialogContainer
        description="Checkout this License to a user"
        open={isAssignOpen}
        onOpenChange={onAssignClose}
        title="Checkout License"
        form={null}
        body={
          <AssignmentForm
            itemId={license?.id!}
            type="license"
            seatsRequested={1}
            assignAction={checkout}
            availableSeats={license ? Math.max(license.seats - license.seatsAllocated, 0) : 0}
            onOptimisticUpdate={(formData) => {
              setLicense((prev: EnhancedLicenseType | undefined) => {
                if (!prev) return undefined;

                return {
                  ...prev,
                  seatsAllocated: prev.seatsAllocated + 1,
                  usedBy: [...prev.usedBy],
                };
              });
            }}
            onSuccess={async () => {
              toast.success("License assigned successfully");
              onAssignClose();
              await fetcdData(true);
            }}
            onError={(previousData) => {
              setLicense((prev: EnhancedLicenseType | undefined) => {
                if (!prev) return undefined;
                return {
                  ...prev,
                  seatsAllocated: prev.seatsAllocated - 1,
                  usedBy: prev.usedBy.filter(
                    (user) => user.id !== previousData?.userId,
                  ),
                };
              });
              toast.error("Failed to checkout license seat");
            }}
          />
        }
      />
      <div className="mt-5">
        {/* <ItemDetailsTabs
          handleCheckIn={handleCheckIn}
          auditLogs={license?.auditLogs ?? []}
          itemId={id}
          usedBy={license?.usedBy ?? []}
          itemType="license"
          isCheckingIn={loadingStates.isCheckingIn}
          isRefreshing={loadingStates.isRefreshing}
        /> */}
      </div>
    </>
  );
}
