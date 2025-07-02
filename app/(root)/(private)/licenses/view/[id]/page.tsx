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
import { checkin, checkout, findById } from "@/lib/actions/license.actions";
import { useAccessoryStore } from "@/lib/stores/accessoryStore";
import ItemDetailsTabs from "@/components/shared/DetailsTabs/ItemDetailsTabs";
import { sleep, sumSeatsAssigned } from "@/lib/utils";
import DetailViewSkeleton from "@/components/shared/DetailView/DetailViewSkeleton";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
  Users,
  AlertTriangle,
  Factory,
  Building2,
  Mail,
  Phone,
  Globe,
  FileText,
  FileImage,
  FileArchive,
  File,
} from "lucide-react";
import { LicenseHeader } from "@/components/LicenseHeader";
import EditLicenseDrawer from "@/components/forms/license/EditLicenseDrawer";

interface AssetPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Inline type for LicenseFile (from Prisma schema)
type LicenseFile = {
  id: string;
  licenseId: string;
  fileUrl: string;
  fileName: string;
  uploadedAt: string;
  uploadedBy?: string | null;
};

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
  supplier: any; // Accepts object or string fallback
  poNumber: string;
  auditLogs: AuditLog[];
  Manufacturer?: any; // Accepts object or undefined
  licenseFiles?: LicenseFile[];
}

interface LoadingStates {
  isInitialLoading: boolean;
  isCheckingIn: Set<string>;
  isAssigning: boolean;
  isRefreshing: boolean;
}

function getFileIcon(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return <FileText className="text-red-500 w-6 h-6" />;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      return <FileImage className="text-blue-500 w-6 h-6" />;
    case "zip":
    case "rar":
      return <FileArchive className="text-yellow-500 w-6 h-6" />;
    case "doc":
    case "docx":
    case "txt":
      return <FileText className="text-indigo-500 w-6 h-6" />;
    default:
      return <File className="text-gray-400 w-6 h-6" />;
  }
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
  const [isEditDrawerOpen, setEditDrawerOpen] = useState(false);

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

      if (!response.data) return;

      setLicense(response.data); // Use the server-shaped object directly
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

  const handleCheckOut = async (...args: any[]) => {
    // ... your checkout logic ...
    // After successful checkout:
    await fetcdData(true);
  };

  const handleAction = (action: "archive" | "duplicate" | "edit" | "print") => {
    const actions: Record<typeof action, () => void> = {
      archive: () => toast.error("Archive action not implemented"),
      duplicate: () => toast.error("Duplicate action not implemented"),
      edit: () => setEditDrawerOpen(true),
      print: () => toast.error("Print label action not implemented"),
    };

    actions[action]();
  };
  const detailViewProps: DetailViewProps = {
    title: (
      <LicenseHeader
        name={license?.name ?? "Untitled License"}
        seatsAllocated={license?.seatsAllocated ?? 0}
        seats={license?.seats ?? 0}
        belowReorder={
          !!license &&
          typeof license.reorderPoint === "number" &&
          license.reorderPoint > 0 &&
          (license.seats - license.seatsAllocated) < license.reorderPoint
        }
      />
    ),
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
      // Supplier details
      {
        label: "Supplier",
        value:
          typeof license?.supplier === "object" && license?.supplier?.name ? (
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-700" />
                {license.supplier.name}
              </span>
              {"contactName" in license.supplier &&
                license.supplier.contactName && (
                  <span className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-700" />
                    {license.supplier.contactName}
                  </span>
                )}
              {"email" in license.supplier && license.supplier.email && (
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-700" />
                  {license.supplier.email}
                </span>
              )}
              {"phoneNum" in license.supplier && license.supplier.phoneNum && (
                <span className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-700" />
                  {license.supplier.phoneNum}
                </span>
              )}
              {"url" in license.supplier && license.supplier.url && (
                <span className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-700" />
                  <a
                    href={license.supplier.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-700"
                  >
                    {license.supplier.url}
                  </a>
                </span>
              )}
            </div>
          ) : (
            ""
          ),
        type: "text",
      },
      // Manufacturer details
      {
        label: "Manufacturer",
        value: license?.Manufacturer?.name ? (
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-2">
              <Factory className="h-4 w-4 text-blue-700" />
              {license.Manufacturer.name}
            </span>
            {"url" in license.Manufacturer && license.Manufacturer.url && (
              <span className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-700" />
                <a
                  href={license.Manufacturer.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-700"
                >
                  {license.Manufacturer.url}
                </a>
              </span>
            )}
            {"supportUrl" in license.Manufacturer &&
              license.Manufacturer.supportUrl && (
                <span className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-700" />
                  <a
                    href={license.Manufacturer.supportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-700"
                  >
                    Support
                  </a>
                </span>
              )}
            {"supportPhone" in license.Manufacturer &&
              license.Manufacturer.supportPhone && (
                <span className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-700" />
                  {license.Manufacturer.supportPhone}
                </span>
              )}
            {"supportEmail" in license.Manufacturer &&
              license.Manufacturer.supportEmail && (
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-700" />
                  {license.Manufacturer.supportEmail}
                </span>
              )}
          </div>
        ) : (
          ""
        ),
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

  // if (license) {
  //   // Debug: Show licenseFiles in console
  //   console.log("licenseFiles", license.licenseFiles);
  // }
  return (
    <>
      {license ? (
        <>
          <DetailView {...detailViewProps} />
          <EditLicenseDrawer
            licenseId={license.id}
            open={isEditDrawerOpen}
            onClose={() => setEditDrawerOpen(false)}
            licenseName={license.name}
            licenseStatus={license.statusLabel?.name}
            licenseStatusColor={license.statusLabel?.colorCode}
          />
        </>
      ) : (
        <DetailViewSkeleton />
      )}

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
            assignAction={(data) => {
              if (data.type === "license") {
                return checkout({ ...(data as any), licenseId: data.itemId });
              }
              return checkout(data);
            }}
            availableSeats={
              license ? Math.max(license.seats - license.seatsAllocated, 0) : 0
            }
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
      {/* License Audit Log & UserItem Records */}
      <div className="mt-8">
        {license && (
          <ItemDetailsTabs
            itemId={license.id}
            itemType="license"
            auditLogs={license.auditLogs.map((log) => ({
              ...log,
              entityId: log.entityId ?? null,
              details: log.details ?? null,
              ipAddress: log.ipAddress ?? null,
              dataAccessed: log.dataAccessed ?? null,
              company: {
                ...log.company,
                name: log.company?.name ?? "",
              },
              user:
                typeof log.user === "object" && log.user !== null
                  ? {
                      id: (log.user as any).id ?? "",
                      name: (log.user as any).name ?? "",
                    }
                  : { id: "", name: "" },
            }))}
            usedBy={license.usedBy}
            handleCheckIn={handleCheckIn}
            isCheckingIn={loadingStates.isCheckingIn}
            isRefreshing={loadingStates.isRefreshing}
            attachments={license.licenseFiles || []}
          />
        )}
      </div>
    </>
  );
}
