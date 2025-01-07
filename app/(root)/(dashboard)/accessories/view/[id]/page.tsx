"use client";

import { useEffect, useState } from "react";
import { DetailView } from "@/components/shared/DetailView/DetailView";
import QRCode from "react-qr-code";
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
import AssignmentForm from "@/components/forms/AssignmentForm";
import { DetailViewProps } from "@/components/shared/DetailView/types";
import { assign, findById } from "@/lib/actions/accessory.actions";
import { useAccessoryStore } from "@/lib/stores/accessoryStore";
import { useItemDetails } from "@/components/shared/DetailsTabs/useItemDetails";
import ItemDetailsTabs from "@/components/shared/DetailsTabs/ItemDetailsTabs";
import { sumUnitsAssigned } from "@/lib/utils";

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
  };
  statusLabel: {
    name: string;
    colorCode: string;
  };
  assignee?: {
    name: string;
  };
  co2Score?: number;
  modelNumber: string;
  location: {
    name: string;
  };
  department: {
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
  inventory: {
    name: string;
  };
  totalQuantity: number;
  reorderPoint: number;
  unitsAllocated: number;
  alertEmail: string;
  supplier: {
    name: string;
  };
  poNumber: string;
  auditLogs?: AuditLog[];
  usedBy?: UserAccessory[];
}

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

export default function AssetPage({ params }: AssetPageProps) {
  const [error, setError] = useState<string | null>(null);
  const { id } = params;
  const { isAssignOpen, onAssignOpen, onAssignClose } = useAccessoryStore();

  const [accessory, setAccessory] = useState<
    EnhancedAccessoryType | undefined
  >();
  const { relationships, attachments, isLoading } = useItemDetails({
    itemId: id,
    itemType: "accessory",
  });
  useEffect(() => {
    const fetchAsset = async () => {
      if (!id) return;

      try {
        const foundAccessoryResponse = await findById(id);
        if (!foundAccessoryResponse.error) {
          const foundAccessory = foundAccessoryResponse.data;
          console.log("foundAccessory: ", foundAccessoryResponse);

          setAccessory({
            id: foundAccessory?.id ?? "-",
            name: foundAccessory?.name ?? "-",
            co2Score: 0,
            category: {
              name: foundAccessory?.category?.name ?? "-",
            },
            modelNumber: foundAccessory?.modelNumber ?? "-",
            statusLabel: {
              name: foundAccessory?.statusLabel?.name ?? "-",
              colorCode: foundAccessory?.statusLabel?.colorCode ?? "#000000",
            },
            location: {
              name: foundAccessory?.departmentLocation?.name ?? "-",
            },
            department: {
              name: foundAccessory?.department?.name ?? "-",
            },
            unitsAllocated: sumUnitsAssigned(
              foundAccessory?.userAccessories ?? [],
            ),
            createdAt: foundAccessory?.createdAt ?? new Date(),
            updatedAt: foundAccessory?.updatedAt ?? new Date(),
            alertEmail: foundAccessory?.alertEmail ?? "-",
            inventory: {
              name: foundAccessory?.inventory?.name ?? "-",
            },
            poNumber: foundAccessory?.poNumber ?? "-",
            reorderPoint: foundAccessory?.reorderPoint ?? 0,
            supplier: { name: foundAccessory?.supplier?.name ?? "-" },
            totalQuantity: foundAccessory?.totalQuantityCount ?? 0,
            auditLogs: foundAccessory?.auditLogs ?? [],
            usedBy: foundAccessory?.userAccessories ?? [],
          });
        }
      } catch (error) {
        console.error("Error fetching asset:", error);
        // Handle error appropriately - maybe set an error state
      }
    };

    fetchAsset();
  }, [id]);
  useEffect(() => {
    console.log("ACCESSORY", accessory);
  }, []);
  const handleUnassign = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (!accessory?.id) return;

    const result = await UnassignModal();

    if (result.isConfirmed) {
      const previousState = { ...accessory };
      try {
        setAccessory((prev) =>
          prev
            ? {
                ...prev,
                assigneeId: undefined,
                assignee: undefined,
              }
            : undefined,
        );

        // await unassign(asset.id);
        const freshData = await findById(accessory.id);
        if (!freshData.error && freshData.data) {
          setAccessory((prev) => {
            if (!prev) return undefined;

            return {
              ...prev,
              auditLogs: freshData.data?.auditLogs ?? [],
              usedBy: freshData.data?.userAccessories ?? [],
              unitsAllocated: sumUnitsAssigned(
                freshData.data?.userAccessories ?? [],
              ),
              assigneeId: undefined,
              assignee: undefined,
            };
          });
        }
        toast.success("Asset unassigned successfully");
      } catch (error) {
        setAccessory(previousState);
        toast.error("Failed to unassign asset");
      }
    }
  };

  const printQRCode = (imageUrl: string) => {
    try {
      // Create print window
      const printWindow = window.open("", "_blank", "width=800,height=600");
      if (!printWindow) {
        throw new Error("Popup blocked");
      }

      // Write HTML content
      printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Print Image</title>
                    <style>
                        @media print {
                            @page {
                                margin: 0;
                                size: auto;
                            }
                            body {
                                margin: 0;
                                padding: 0;
                            }
                            img {
                                width: 100%;
                                height: auto;
                                page-break-inside: avoid;
                            }
                        }
                        body {
                            margin: 0;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 100vh;
                        }
                        img {
                            max-width: 100%;
                            height: auto;
                        }
                    </style>
                </head>
                <body>
                    <img 
                        src="${imageUrl}" 
                        alt="Print preview"
                        onload="setTimeout(() => { window.print(); window.close(); }, 200);"
                        onerror="window.close(); alert('Failed to load image');"
                    />
                </body>
            </html>
        `);

      printWindow.document.close();
    } catch (error) {
      console.error("Print error:", error);
      alert("Failed to print image. Please allow popups for this feature.");
    }
  };

  if (!accessory) {
    return <div>Loading...</div>;
  }

  const detailViewProps: DetailViewProps = {
    title: accessory.name,
    isLoading: false,
    co2Score: accessory.co2Score,
    error,
    fields: [
      { label: "Name", value: accessory.name, type: "text" },
      { label: "Category", value: accessory.category.name, type: "text" },
      { label: "Model Number", value: accessory.modelNumber, type: "text" },
      { label: "Status", value: accessory.statusLabel.name, type: "text" },
      { label: "Location", value: accessory.location?.name, type: "text" },
      { label: "Department", value: accessory.department?.name, type: "text" },
      {
        label: "Created At",
        value: accessory?.createdAt?.toString(),
        type: "date",
      },
      {
        label: "Last Updated",
        value: accessory.updatedAt?.toString(),
        type: "date",
      },
      { label: "Quantity", value: accessory.totalQuantity, type: "text" },
      { label: "Reorder Point", value: accessory.reorderPoint, type: "text" },
      { label: "Alert Email", value: accessory.alertEmail, type: "text" },
      { label: "Supplier", value: accessory.supplier.name, type: "text" },
      { label: "Units", value: accessory.totalQuantity, type: "text" },
      {
        label: "Units Allocated",
        value: accessory.unitsAllocated,
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
        <QRCode value={`/qr-code/sample.png`} size={140} />
        {/*<Scan className="w-6 h-6 text-gray-500" />*/}
      </div>
    ),
    actions: {
      onArchive: () => handleAction("archive"),
      onAssign: () => onAssignOpen(),
      onUnassign: handleUnassign,
      onDuplicate: () => handleAction("duplicate"),
      onEdit: () => handleAction("edit"),
      onPrintLabel: () => printQRCode("/qr-code/sample.png"),
    },
    sourceData: "accessory",
    checkoutDisabled: accessory.unitsAllocated === accessory.totalQuantity,
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

  return (
    <>
      <DetailView {...detailViewProps} />
      <DialogContainer
        description="Assign this asset to a user"
        open={isAssignOpen}
        onOpenChange={onAssignClose}
        title="Assign Asset"
        form={
          <AssignmentForm
            itemId={id}
            type="accessory"
            assignAction={assign}
            onOptimisticUpdate={(userData) => {
              // Immediately update the UI for units allocated
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

              // Fetch fresh data to update audit logs
              try {
                const freshData = await findById(id);
                if (!freshData.error && freshData.data) {
                  setAccessory((prev) => {
                    if (!prev) return undefined;

                    return {
                      ...prev,
                      auditLogs: freshData.data?.auditLogs ?? [],
                      usedBy: freshData.data?.userAccessories ?? [],
                      unitsAllocated: sumUnitsAssigned(
                        freshData.data?.userAccessories ?? [],
                      ),
                    };
                  });
                }
              } catch (error) {
                console.error("Error refreshing accessory data:", error);
              }
            }}
            onError={(previousData) => {
              if (previousData) {
                setAccessory((prev) =>
                  prev
                    ? {
                        ...prev,
                        unitsAllocated: prev.unitsAllocated - 1,
                      }
                    : undefined,
                );
              }
              toast.error("Failed to assign asset");
            }}
          />
        }
      />

      <div className="mt-5 ">
        <ItemDetailsTabs
          auditLogs={accessory?.auditLogs}
          itemId={id}
          usedBy={accessory?.usedBy}
          itemType="license"
          relationships={relationships}
          attachments={attachments}
        />
      </div>
    </>
  );
}
