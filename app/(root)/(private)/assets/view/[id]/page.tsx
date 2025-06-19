"use client";

import { useEffect, useState } from "react";
import { DetailView } from "@/components/shared/DetailView/DetailView";
import QRCode from "react-qr-code";
import Link from "next/link";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { Scan } from "lucide-react";
import { headers } from "next/headers";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { DialogContainer } from "@/components/dialogs/DialogContainer";
import AssignmentForm from "@/components/forms/AssignmentForm";
import { useAssetStore } from "@/lib/stores/assetStore";
import { DetailViewProps } from "@/components/shared/DetailView/types";
import { checkin, checkout, findById } from "@/lib/actions/assets.actions";
import DetailViewSkeleton from "@/components/shared/DetailView/DetailViewSkeleton";
import printQRCode from "@/utils/QRCodePrinter";
import { useRouter } from "next/navigation";
import ItemDetailsTabs from "@/components/shared/DetailsTabs/ItemDetailsTabs";
import { Decimal } from "@prisma/client/runtime/library";
import type { Asset, User, Model, StatusLabel, Department, DepartmentLocation, FormTemplate, FormTemplateValue, AssetHistory, Co2eRecord } from "@prisma/client";
import { JsonValue } from "@prisma/client/runtime/library";
import { AssetWithRelations, EnhancedAssetType } from "@/types/asset";

interface AssetResponse {
  success: boolean;
  data: Asset | null;
  error?: string;
}

interface AssetPageProps {
  params: {
    id: string;
  };
}

interface AuditLogDataAccessed {
  assetId?: string;
  previousAssignee?: string;
  [key: string]: JsonValue | undefined;
}

type SimpleAuditLog = {
  id: string;
  companyId: string;
  createdAt: Date;
  userId: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: string | null;
  ipAddress: string | null;
  dataAccessed: JsonValue;
};

const UnassignModal = async () => {
  return await Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this operation!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, unassign it!",
  });
};

interface LoadingStates {
  isInitialLoading: boolean;
  isCheckingIn: Set<string>;
  isAssigning: boolean;
  isRefreshing: boolean;
}

export default function AssetPage({ params }: AssetPageProps) {
  const [error, setError] = useState<string | null>(null);
  const { id } = params;
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    isInitialLoading: true,
    isCheckingIn: new Set<string>(),
    isAssigning: false,
    isRefreshing: false,
  });

  const { isAssignOpen, onAssignOpen, onAssignClose } = useAssetStore();
  const navigate = useRouter();
  const [asset, setAsset] = useState<EnhancedAssetType | undefined>();

  const handleCheckIn = async (userAccessoryId: string) => {};

  useEffect(() => {
    // Add no-cache headers
    const headers = new Headers();
    headers.append('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.append('Pragma', 'no-cache');
    headers.append('Expires', '0');
  }, []);

  useEffect(() => {
    const fetchAsset = async () => {
      if (!id) return;

      try {
        const response = await fetch(`/api/assets/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch asset');
        }
        const foundAssetResponse = await response.json();
        console.log(foundAssetResponse);

        if (foundAssetResponse.success) {
          if (!foundAssetResponse.data) {
            setError("Asset not found. Please make sure the asset exists and you have permission to view it.");
            setLoadingStates((prev) => ({ ...prev, isInitialLoading: false }));
            return;
          }

          const foundAsset = foundAssetResponse.data as unknown as AssetWithRelations;
          
          const allValues =
            foundAsset?.formTemplateValues?.map((item) => item?.values) ?? [];
          let co2Score = 0;
          let units = "";

                      if (foundAsset?.Co2eRecord?.[0]) {
              co2Score = Number(foundAsset.Co2eRecord[0].co2e);
              units = foundAsset.Co2eRecord[0].units;
            }

          setAsset({
            id: foundAsset?.id ?? "",
            name: foundAsset?.name ?? "",
            price: foundAsset?.price ? Number(foundAsset.price) : 0,
            serialNumber: foundAsset?.serialNumber ?? "",
            status: foundAsset?.status ?? "",
            category: {
              name: foundAsset?.model?.name ?? "",
            },
            statusLabel: foundAsset?.statusLabel ? {
              name: foundAsset.statusLabel.name,
              colorCode: foundAsset.statusLabel.colorCode,
            } : null,
            assignee: foundAsset?.assignee ? {
              name: foundAsset.assignee.name,
            } : undefined,
                          co2Score: foundAsset?.Co2eRecord?.[0] ? {
                co2e: Number(foundAsset.Co2eRecord[0].co2e),
                units: foundAsset.Co2eRecord[0].units,
              } : undefined,
            model: foundAsset?.model ? {
              name: foundAsset.model.name,
            } : null,
            location: foundAsset?.departmentLocation ? {
              name: foundAsset.departmentLocation.name,
            } : null,
            department: foundAsset?.department ? {
              name: foundAsset.department.name,
            } : null, 
            formTemplate: foundAsset?.formTemplate ? {
              id: foundAsset.formTemplate.id,
              name: foundAsset.formTemplate.name,
              values: allValues ?? [],
            } : null,
            AssetHistory: foundAsset?.AssetHistory ?? [],
            auditLogs: foundAsset?.auditLogs?.map(log => ({
              ...log,
              dataAccessed: log.dataAccessed as AuditLogDataAccessed | null
            })) ?? [],
            assigneeId: foundAsset?.assigneeId ?? "",
            createdAt: foundAsset?.createdAt ?? new Date(),
            updatedAt: foundAsset?.updatedAt ?? new Date(),
            usedBy: [],
          });
        }
      } catch (error) {
        console.error("Error fetching asset:", error);
        setError("Failed to load asset details");
      } finally {
        setLoadingStates((prev) => ({ ...prev, isInitialLoading: false }));
      }
    };

    fetchAsset();
  }, [id]);


  const handleUnassign = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (!asset?.id) return;

    const result = await UnassignModal();

    if (result.isConfirmed) {
      const previousState = { ...asset };
      try {
        setAsset((prev) =>
          prev
            ? {
                ...prev,
                assigneeId: undefined,
                assignee: undefined,
              }
            : undefined,
        );

        const checkinResponse = await fetch(`/api/assets/${asset.id}/checkin`, {
          method: 'POST'
        });
        if (!checkinResponse.ok) {
          throw new Error('Failed to checkin asset');
        }

        const freshResponse = await fetch(`/api/assets/${asset.id}`);
        if (!freshResponse.ok) {
          throw new Error('Failed to fetch updated asset');
        }
        const freshData = await freshResponse.json();
        
        if (!freshData.error && freshData.data) {
          const freshAsset = freshData.data as unknown as AssetWithRelations;
          setAsset((prev) => {
            if (!prev) return undefined;

            return {
              ...prev,
              auditLogs: freshAsset?.auditLogs?.map(log => ({
                ...log,
                company: undefined,
                user: undefined
              })) ?? [],
              assigneeId: undefined,
              assignee: undefined,
            };
          });
        }
        toast.success("Asset unassigned successfully");
      } catch (error) {
        setAsset(previousState);
        toast.error("Failed to unassign asset");
      }
    }
  };

  const canPerformActions = (status: string) => {
    return status !== "Inactive";
  };

  const handleAssignmentAction = (status: string) => {
    if (!canPerformActions(status)) {
      return undefined;
    }
    return asset?.assigneeId ? undefined : () => onAssignOpen();
  };

  const handleUnassignmentAction = (status: string) => {
    if (!canPerformActions(status)) {
      return undefined;
    }
    return asset?.assigneeId ? handleUnassign : undefined;
  };

  const detailViewProps: DetailViewProps = {
    title: asset?.name ?? "Untitled Asset",
    isLoading: loadingStates.isInitialLoading,
    co2Score: {
      co2e: asset?.co2Score?.co2e ?? 0,
      units: asset?.co2Score?.units ?? "kg",
    },
    units: "kg",
    isAssigned: Boolean(asset?.assigneeId),
    error,
    fields: [
      { label: "Name", value: asset?.name ?? "", type: "text" },
      { label: "Category", value: asset?.category?.name ?? "", type: "text" },
      { label: "Model", value: asset?.model?.name ?? "", type: "text" },
      {
        label: "Status",
        value: asset?.status,
        type: "text",
      },
      { label: "Location", value: asset?.location?.name ?? "", type: "text" },
      {
        label: "Department",
        value: asset?.department?.name ?? "",
        type: "text",
      },
      {
        label: asset?.assigneeId ? "Assigned To" : "Not Assigned",
        value: asset?.assignee?.name ?? "",
        type: "text",
      },
      { label: "Tag Number", value: asset?.serialNumber ?? "", type: "text" },
      {
        label: "Created At",
        value: asset?.createdAt?.toString() ?? "",
        type: "date",
      },
      {
        label: "Last Updated",
        value: asset?.updatedAt?.toString() ?? "",
        type: "date",
      },
    ],
    customFormFields: asset?.formTemplate?.values ?? [],
    breadcrumbs: asset ? (
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/assets">Assets</Link>
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
    ) : null,
    qrCode: (
      <div className="flex items-center gap-2">
        <QRCode value={`/qr-code/sample.png`} size={140} />
        <Scan className="w-6 h-6 text-gray-500" />
      </div>
    ),
    actions: {
      onArchive: () => handleAction("archive"),
      onAssign: handleAssignmentAction(asset?.status!),
      onUnassign: handleUnassignmentAction(asset?.status!),
      onDuplicate: () => handleAction("duplicate"),
      onEdit: () => handleAction("edit"),
      onPrintLabel: () => printQRCode("/qr-code/sample.png"),
    },
  };

  const handleAction = (action: "archive" | "duplicate" | "edit" | "print") => {
    const actions: Record<typeof action, () => void> = {
      archive: () => toast.info("Archive action not implemented"),
      duplicate: () => toast.info("Duplicate action not implemented"),
      edit: () => navigate.push(`/assets/edit/${id}`),
      print: () => toast.info("Print label action not implemented"),
    };

    actions[action]();
  };

  return (
    <>
      {asset ? <DetailView {...detailViewProps} /> : <DetailViewSkeleton />}
      <DialogContainer
        description="Assign this asset to a user"
        open={isAssignOpen}
        onOpenChange={onAssignClose}
        title="Assign Checkout"
        form={
          <AssignmentForm
            itemId={asset?.id!}
            type="asset"
            assignAction={async (data) => {
              const response = await fetch(`/api/assets/${data.itemId}/checkout`, {
                method: 'POST'
              });
              if (!response.ok) {
                throw new Error('Failed to checkout asset');
              }
              const result = await response.json();
              return { error: result.error };
            }}
            onOptimisticUpdate={(userData) => {
              setAsset((prev) =>
                prev
                  ? {
                      ...prev,
                      assigneeId: userData.userId,
                      assignee: { name: userData.userName },
                    }
                  : undefined,
              );
            }}
            onSuccess={async () => {
              toast.success("Asset assigned successfully");
              onAssignClose();

              try {
                const freshResponse = await fetch(`/api/assets/${asset?.id}`);
                if (!freshResponse.ok) {
                  throw new Error('Failed to fetch updated asset');
                }
                const freshData = await freshResponse.json();
                
                if (!freshData.error && freshData.data) {
                  const freshAsset = freshData.data as unknown as AssetWithRelations;
                  setAsset((prev) => {
                    if (!prev) return undefined;

                    return {
                      ...prev,
                      auditLogs: freshAsset?.auditLogs?.map(log => ({
                        ...log,
                        company: undefined,
                        user: undefined
                      })) ?? [],
                      assigneeId: prev.assigneeId,
                      assignee: prev.assignee,
                    };
                  });
                }
              } catch (error) {
                console.error("Error refreshing audit logs:", error);
              }
            }}
            onError={(previousData) => {
              if (previousData) {
                setAsset((prev) =>
                  prev
                    ? {
                        ...prev,
                        assigneeId: undefined,
                        assignee: undefined,
                      }
                    : undefined,
                );
              }
              toast.error("Failed to assign asset");
            }}
          />
        }
      />

      <div className="mt-5">
        <ItemDetailsTabs
          handleCheckIn={handleCheckIn}
          auditLogs={asset?.auditLogs ?? []}
          itemId={id}
          usedBy={asset?.usedBy}
          itemType="asset"
          isCheckingIn={loadingStates.isCheckingIn}
          isRefreshing={loadingStates.isRefreshing}
        />
      </div>
    </>
  );
}