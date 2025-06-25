"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { useUser } from "@clerk/nextjs";

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

interface AssetPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function AssetPage({ params }: AssetPageProps) {
  const { id } = use(params);
  const [asset, setAsset] = useState<EnhancedAssetType | undefined>();
  const [showUnassignDialog, setShowUnassignDialog] = useState(false);
  const { isAssignOpen, onAssignOpen, onAssignClose } = useAssetStore();
  const navigate = useRouter();
  const queryClient = useQueryClient();
  const { user } = useUser();

  const {
    data: fetchedAsset,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["asset", id],
    queryFn: async () => {
      if (!user) return null;
      const response = await findAssetById(id);
      if (response.error) throw new Error(response.error);
      return Array.isArray(response.data) ? response.data[0] : undefined;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (fetchedAsset) {
      const assetData = fetchedAsset as unknown as AssetWithRelations;
      setAsset({
        id: assetData.id,
        name: assetData.name,
        assetTag: assetData.assetTag ?? "",
        status: assetData.statusLabel?.name ?? "N/A",
        purchaseDate: assetData.purchaseDate,
        warrantyEndDate: assetData.warrantyEndDate ?? undefined,
        notes: assetData.notes ?? undefined,
        supplier: assetData.supplier
          ? { name: assetData.supplier.name }
          : undefined,
        purchaseOrderNumber: assetData.purchaseOrder?.poNumber ?? undefined,
        purchaseCost: assetData.purchaseOrder?.totalAmount
          ? Number(assetData.purchaseOrder.totalAmount)
          : undefined,
        category: { name: assetData.model?.name ?? "N/A" },
        statusLabel: assetData.statusLabel,
        user: assetData.user ? { name: assetData.user.name } : undefined,
        co2Score:
          (assetData.co2eRecords as any)?.length > 0
            ? {
                co2e: Number(assetData.co2eRecords[0].co2e),
                units: assetData.co2eRecords[0].units,
              }
            : undefined,
        model: assetData.model,
        departmentLocation: assetData.departmentLocation,
        department: assetData.department,
        formTemplate:
          assetData.formTemplate && assetData.values
            ? {
                ...assetData.formTemplate,
                values: assetData.values?.map((v) => v.values) ?? [],
              }
            : null,
        assetHistory: assetData.assetHistory ?? [],
        auditLogs: (assetData.auditLogs as any) ?? [],
        userId: assetData.user?.id,
        createdAt: assetData.createdAt,
        updatedAt: assetData.updatedAt,
        co2eRecords: assetData.co2eRecords,
        energyConsumption: assetData.energyConsumption
          ? Number(assetData.energyConsumption)
          : undefined,
        expectedLifespan: assetData.expectedLifespan ?? undefined,
        endOfLifePlan: assetData.endOfLifePlan ?? undefined,
        price: 0,
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
    try {
      await checkinAsset(asset.id);
      toast.success("Asset checked in successfully");
      refetch();
      setShowUnassignDialog(false);
    } catch (e: any) {
      toast.error(`Failed to check in asset: ${e.message}`);
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
            userId: data.userId,
            user: { name: data.userName },
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

  const detailViewActions = {
    onAssign: onAssignOpen,
    onUnassign: () => setShowUnassignDialog(true),
    onSetMaintenance: handleSetMaintenance,
    onEdit: () => handleAction("edit"),
    menu: [
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
    ],
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

      <AlertDialog
        open={showUnassignDialog}
        onOpenChange={() => setShowUnassignDialog(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Unassignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to check in this asset?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnassign}>
              Check In
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
