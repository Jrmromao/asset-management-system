"use client";

import { useEffect, useState } from "react";
import { DetailView } from "@/components/shared/DetailView/DetailView";
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
import { assignLicense, findById } from "@/lib/actions/license.actions";
import { useAccessoryStore } from "@/lib/stores/accessoryStore";
import ItemDetailsTabs from "@/components/shared/DetailsTabs/ItemDetailsTabs";
import { useItemDetails } from "@/components/shared/DetailsTabs/useItemDetails";
import { BoxIcon } from "lucide-react";
import { sumSeatsAssigned } from "@/lib/utils";

interface AssetPageProps {
  params: {
    id: string;
  };
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
  useBy: {
    name: string;
  };
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

export default function View({ params }: AssetPageProps) {
  const [error, setError] = useState<string | null>(null);
  const { id } = params;
  const { isAssignOpen, onAssignOpen, onAssignClose } = useAccessoryStore();

  const [license, setLicense] = useState<EnhancedLicenseType | undefined>();
  const { relationships, attachments, isLoading } = useItemDetails({
    itemId: id,
    itemType: "license",
  });

  useEffect(() => {
    const fetchAsset = async () => {
      if (!id) return;

      try {
        const foundLicenseResponse = await findById(id);
        if (!foundLicenseResponse.error) {
          const foundLicense = foundLicenseResponse.data;

          setLicense({
            id: foundLicense?.id!,
            name: foundLicense?.name ?? "",
            co2Score: 23,
            statusLabel: {
              name: foundLicense?.statusLabel?.name ?? "",
              colorCode: foundLicense?.statusLabel?.colorCode ?? "#000000",
            },
            useBy: {
              name: "",
            },
            location: {
              name: foundLicense?.departmentLocation?.name ?? "",
            },
            department: {
              name: foundLicense?.department?.name ?? "",
            },
            // assigneeId: foundLicense?.assigneeId!,
            purchaseDate: foundLicense?.purchaseDate ?? new Date(),
            renewalDate: foundLicense?.renewalDate ?? new Date(),
            inventory: {
              name: foundLicense?.inventory?.name ?? "",
            },
            seats: foundLicense?.seats ?? 0,
            seatsAllocated: sumSeatsAssigned(foundLicense?.users ?? []),
            reorderPoint: foundLicense?.minSeatsAlert ?? 0,
            seatsAlert: foundLicense?.licensedEmail ?? "",
            supplier: {
              name: foundLicense?.supplier?.name ?? "",
            },
            poNumber: foundLicense?.poNumber ?? "",
          });
        }
      } catch (error) {
        console.error("Error fetching asset:", error);
        setError("Failed to fetch asset details");
      }
    };

    fetchAsset();
  }, [id]);

  const handleUnassign = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (!license?.id) return;

    const result = await UnassignModal();

    if (result.isConfirmed) {
      const previousState = { ...license };
      try {
        setLicense((prev) =>
          prev
            ? {
                ...prev,
                assigneeId: undefined,
                useBy: { name: "" },
              }
            : undefined,
        );

        toast.success("Asset unassigned successfully");
      } catch (error) {
        setLicense(previousState);
        toast.error("Failed to unassign asset");
      }
    }
  };

  if (!license) {
    return <div>Loading...</div>;
  }

  const detailViewProps: DetailViewProps = {
    title: license.name,
    isLoading: false,
    co2Score: license.co2Score,
    isAssigned: !!license.assigneeId,
    error,
    fields: [
      { label: "Name", value: license.name, type: "text" },
      // { label: 'Category', value: license.category.name, type: 'text' },
      // { label: 'Model', value: license.model.name, type: 'text' },
      { label: "Status", value: license.statusLabel.name, type: "text" },
      { label: "Location", value: license.location.name, type: "text" },
      { label: "Department", value: license.department.name, type: "text" },
      {
        label: "Purchase Date",
        value: new Date(license.purchaseDate).toLocaleDateString(),
        type: "text",
      },
      {
        label: "Renewal Date",
        value: new Date(license.renewalDate).toLocaleDateString(),
        type: "text",
      },
      { label: "Inventory", value: license.inventory.name, type: "text" },
      { label: "Reorder Point", value: license.reorderPoint, type: "text" },
      { label: "Alert Email", value: license.seatsAlert, type: "text" },
      { label: "Supplier", value: license.supplier.name, type: "text" },
      { label: "PO Number", value: license.poNumber, type: "text" },
      { label: "Seats", value: license.seats, type: "text" },
      { label: "Seats Allocated", value: license.seatsAllocated, type: "text" },
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
      onAssign: license.assigneeId ? undefined : () => onAssignOpen(),
      onUnassign: license.assigneeId ? handleUnassign : undefined,
      onDuplicate: () => handleAction("duplicate"),
      onEdit: () => handleAction("edit"),
      // onPrintLabel: () => handleAction('print')
    },
    sourceData: "license",
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
        description="Checkout this License to a user"
        open={isAssignOpen}
        onOpenChange={onAssignClose}
        title="Checkout License"
        form={
          <AssignmentForm
            itemId={license.id}
            type="license"
            seatsRequested={1}
            assignAction={assignLicense}
            onOptimisticUpdate={(userData) => {
              setLicense((prev) =>
                prev
                  ? {
                      ...prev,
                      seatsAllocated: prev.seatsAllocated + 1,
                    }
                  : undefined,
              );
            }}
            onSuccess={() => {
              toast.success("Asset assigned successfully");
              onAssignClose();
            }}
            onError={(previousData) => {
              if (previousData) {
                setLicense((prev) =>
                  prev
                    ? {
                        ...prev,
                        seatsAllocated: prev.seatsAllocated - 1,
                      }
                    : undefined,
                );
              }
              toast.error("Failed to checkout license seat");
            }}
          />
        }
      />

      <div className="mt-5 ">
        <ItemDetailsTabs
          itemId={id}
          itemType="license"
          relationships={relationships}
          attachments={attachments}
          customTabs={{
            inventory: {
              label: "Inventory",
              icon: <BoxIcon className="h-4 w-4" />,
              content: <div>{/* Custom inventory content */}</div>,
            },
          }}
        />
      </div>
    </>
  );
}
