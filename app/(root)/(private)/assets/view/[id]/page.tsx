"use client";

import { useEffect, useState } from "react";
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
  updateAssetNotes,
} from "@/lib/actions/assets.actions";
import { useRouter, useParams } from "next/navigation";
import { AssetWithRelations, EnhancedAssetType } from "@/types/asset";
import { FaTrash, FaTools } from "react-icons/fa";
import { GenerateCo2Button } from "@/components/actions/GenerateCo2Button";
import { AssetDetailView } from "@/components/shared/DetailView/AssetDetailView";
import * as z from "zod";
import { assignmentSchema } from "@/lib/schemas";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import FullscreenLoader from "@/components/FullscreenLoader";
import { ScheduleMaintenanceDialog } from "@/components/dialogs/ScheduleMaintenanceDialog";

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

interface EnhancedAssetTypeWithFormValues extends EnhancedAssetType {
  formValues?: any[];
}

export default function AssetPage() {
  const params = useParams();
  const id = params.id as string;
  const { isLoaded, user } = useUser();
  const [asset, setAsset] = useState<EnhancedAssetTypeWithFormValues | undefined>();
  const [showUnassignDialog, setShowUnassignDialog] = useState(false);
  const { isAssignOpen, onAssignOpen, onAssignClose } = useAssetStore();
  const navigate = useRouter();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [isMaintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);


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
      return Array.isArray(response.data) ? response.data[0] : response.data;
    },
    enabled: isLoaded && !!user && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
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
        category: { name: assetData.formValues?.[0]?.formTemplate?.category?.name ?? "N/A" },
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
        price: assetData.purchaseOrder?.totalAmount
          ? Number(assetData.purchaseOrder.totalAmount)
          : 0,
        formValues: assetData.formValues,
      });
    }
  }, [fetchedAsset]);

  const handleSetMaintenance = async () => {
    if (!asset) return;
    try {
      await setMaintenanceStatus(asset.id);
      toast.success("Asset is now in maintenance.");
      // Invalidate and refetch only when necessary
      queryClient.invalidateQueries({ queryKey: ["asset", id] });
    } catch (e: any) {
      toast.error(`Failed to set maintenance status: ${e.message}`);
    }
  };

  const handleUnassign = async () => {
    if (!asset) return;
    try {
      await checkinAsset(asset.id);
      toast.success("Asset checked in successfully");
      setShowUnassignDialog(false);
      // Invalidate and refetch only when necessary
      queryClient.invalidateQueries({ queryKey: ["asset", id] });
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

  const handleNotesUpdate = async (notes: string) => {
    try {
      const response = await updateAssetNotes(id, notes);
      if (response.success) {
        toast.success("Notes updated successfully");
        // Update the local state instead of refetching
        setAsset(prev => prev ? { ...prev, notes } : undefined);
        // Invalidate the query cache for future fetches
        queryClient.invalidateQueries({ queryKey: ["asset", id] });
      } else {
        toast.error(response.error || "Failed to update notes");
      }
    } catch (error) {
      toast.error("Failed to update notes");
    }
  };

  if (isLoading) {
    return <FullscreenLoader />;
  }

  if (error || !asset) {
    return <div>Error: {(error as Error)?.message || "Asset not found"}</div>;
  }

  const detailViewActions = {
    onAssign: onAssignOpen,
    onUnassign: () => setShowUnassignDialog(true),
    assetId: asset.id,
    onMaintenanceScheduled: () => {
      toast.success("Maintenance scheduled!");
      queryClient.invalidateQueries({ queryKey: ["asset", id] });
      setMaintenanceDialogOpen(false);
    },
    onOpenMaintenanceDialog: () => setMaintenanceDialogOpen(true),
    onEdit: () => setEditOpen(true),
    menu: [
      {
        label: "Set to Maintenance",
        onClick: () => setMaintenanceDialogOpen(true),
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
        categoryName={asset?.category?.name}
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
        onNotesUpdate={handleNotesUpdate}
        setEditOpen={setEditOpen}
        editOpen={editOpen}
      />

      <ScheduleMaintenanceDialog
        preselectedAssetId={asset.id}
        onSuccess={detailViewActions.onMaintenanceScheduled}
        open={isMaintenanceDialogOpen}
        onOpenChange={setMaintenanceDialogOpen}
      />

      <DialogContainer
        open={isAssignOpen}
        onOpenChange={onAssignClose}
        title={`Assign ${asset.name}`}
        description="Assign this asset to a user to track ownership and responsibility."
        form={null}
        body={
          <AssignmentForm
            itemId={asset.id}
            type={"asset" as AssetType}
            onOptimisticUpdate={handleOptimisticUpdate}
            onSuccess={() => {
              toast.success("Asset assigned successfully");
              queryClient.invalidateQueries({ queryKey: ["asset", id] });
              onAssignClose();
            }}
            onError={() => {
              toast.error("Failed to assign asset");
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
