"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import Swal from "sweetalert2";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { DialogContainer } from "@/components/dialogs/DialogContainer";
import AssignmentForm, {
  type AssetType,
} from "@/components/forms/AssignmentForm";
import { useAssetStore } from "@/lib/stores/assetStore";
import {
  checkinAsset,
  checkoutAsset,
  setMaintenanceStatus,
  findAssetById,
} from "@/lib/actions/assets.actions";
import DetailViewSkeleton from "@/components/shared/DetailView/DetailViewSkeleton";
import { useRouter } from "next/navigation";
import ItemDetailsTabs from "@/components/shared/DetailsTabs/ItemDetailsTabs";
import { AssetWithRelations, EnhancedAssetType } from "@/types/asset";
import { FaEdit, FaTrash, FaTools } from "react-icons/fa";
import { GenerateCo2Button } from "@/components/actions/GenerateCo2Button";
import { AssetDetailView } from "@/components/shared/DetailView/AssetDetailView";
import * as z from "zod";
import { assignmentSchema } from "@/lib/schemas";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

interface AssetPageProps {
  params: {
    id: string;
  };
}

export default function AssetPage({ params }: AssetPageProps) {
  const { id } = params;
  const [asset, setAsset] = useState<EnhancedAssetType | undefined>();
  const { isAssignOpen, onAssignOpen, onAssignClose } = useAssetStore();
  const navigate = useRouter();
  const queryClient = useQueryClient();

  const {
    data: fetchedAsset,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["asset", id],
    queryFn: async () => {
      const response = await findAssetById(id);
      if (response.error) throw new Error(response.error);
      return response.data?.[0];
    },
  });

  useEffect(() => {
    if (fetchedAsset) {
      const assetData = fetchedAsset as unknown as AssetWithRelations;
      setAsset({
        id: assetData.id,
        name: assetData.name,
        price: assetData.purchasePrice ? Number(assetData.purchasePrice) : 0,
        serialNumber: assetData.serialNumber ?? "",
        status: assetData.statusLabel?.name ?? "N/A",
        category: { name: assetData.model?.name ?? "N/A" },
        statusLabel: assetData.statusLabel ?? null,
        assignee: assetData.user ? { name: assetData.user.name } : undefined,
        co2Score: assetData.co2eRecords?.[0]
          ? {
              co2e: Number(assetData.co2eRecords[0].co2e),
              units: assetData.co2eRecords[0].units,
            }
          : undefined,
        model: assetData.model ?? null,
        location: assetData.departmentLocation ?? null,
        department: assetData.department ?? null,
        formTemplate: assetData.formTemplate
          ? {
              ...assetData.formTemplate,
              values: assetData.formTemplateValues?.map((v) => v.values) ?? [],
            }
          : null,
        AssetHistory: assetData.assetHistory ?? [],
        auditLogs: (assetData.auditLogs as any) ?? [],
        assigneeId: assetData.user?.id,
        createdAt: assetData.createdAt,
        updatedAt: assetData.updatedAt,
        usedBy: [],
      });
    }
  }, [fetchedAsset]);

  const handleSetMaintenance = async () => {
    if (!asset) return;
    try {
      await setMaintenanceStatus(asset.id);
      toast.success("Asset is now in maintenance.");
      refetch();
    } catch (e: any) {
      toast.error(`Failed to set maintenance status: ${e.message}`);
    }
  };

  const handleUnassign = async () => {
    if (!asset) return;
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, check it in!",
    });

    if (result.isConfirmed) {
      try {
        await checkinAsset(asset.id);
        toast.success("Asset checked in successfully");
        refetch();
      } catch (e: any) {
        toast.error(`Failed to check in asset: ${e.message}`);
      }
    }
  };

  const handleAction = (action: "archive" | "edit") => {
    if (action === "edit") navigate.push(`/assets/edit/${id}`);
    else toast.info("Action not implemented yet");
  };

  const handleOptimisticUpdate = (data: {
    userId: string;
    userName: string;
  }) => {
    setAsset((prev) =>
      prev
        ? {
            ...prev,
            assigneeId: data.userId,
            assignee: { name: data.userName },
          }
        : undefined,
    );
  };

  const handleAssignAction = async (data: AssignmentFormValues) => {
    const response = await checkoutAsset(data.itemId, data.userId);
    if (response.error) {
      throw new Error(response.error);
    }
    return response;
  };

  if (isLoading) {
    return <DetailViewSkeleton />;
  }

  if (error || !asset) {
    return <div>Error: {(error as Error)?.message || "Asset not found"}</div>;
  }

  const menuActions = [
    { label: "Edit", onClick: () => handleAction("edit"), icon: <FaEdit /> },
    {
      label: "Set to Maintenance",
      onClick: handleSetMaintenance,
      icon: <FaTools />,
    },
    {
      label: "Archive",
      onClick: () => handleAction("archive"),
      icon: <FaTrash />,
      isDestructive: true,
    },
  ];

  const detailViewActions = {
    onAssign: onAssignOpen,
    onUnassign: handleUnassign,
    onSetMaintenance: handleSetMaintenance,
    menu: menuActions,
    main: <GenerateCo2Button assetId={id} />,
  };

  return (
    <div>
      <AssetDetailView
        asset={asset}
        actions={detailViewActions}
        breadcrumbs={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/assets">Assets</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#">{asset.name}</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
      />
      <div className="mt-6">
        <ItemDetailsTabs
          itemId={id}
          itemType="asset"
          auditLogs={asset.auditLogs || []}
          usedBy={asset.usedBy || []}
          handleCheckIn={async () => {}}
          isCheckingIn={new Set()}
          isRefreshing={false}
        />
      </div>
      <DialogContainer
        open={isAssignOpen}
        onOpenChange={onAssignClose}
        title={`Assign ${asset.name}`}
        description="Assign this asset to a user to track ownership and responsibility."
        form={
          <AssignmentForm
            itemId={asset.id}
            type={"asset" as AssetType}
            onOptimisticUpdate={handleOptimisticUpdate}
            onSuccess={() => {
              toast.success("Asset assigned successfully");
              refetch();
              onAssignClose();
            }}
            onError={() => {
              toast.error("Failed to assign asset");
              refetch();
            }}
            assignAction={handleAssignAction}
          />
        }
      />
    </div>
  );
}
