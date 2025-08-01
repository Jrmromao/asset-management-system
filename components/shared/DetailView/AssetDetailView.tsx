"use client";

import React, {
  ReactNode,
  useState,
  useTransition,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ClipboardCopy,
  Calendar,
  Monitor,
  Tag,
  RefreshCcw,
  Laptop,
  User,
  MapPin,
  Building2,
  Coins,
  Briefcase,
  DollarSign,
  ShoppingCart,
  Clock,
  QrCode,
  ShieldCheck,
  Building,
  Leaf,
  Loader2,
  Plus,
  Save,
  Receipt,
  Truck,
  Zap,
  Recycle,
  Hourglass,
  Edit,
  Pocket,
  Pin,
  X,
  Calculator,
} from "lucide-react";
import QRCode from "react-qr-code";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { EnhancedAssetType } from "@/types/asset";
import { ActionButtons } from "./ActionButtons";
import CO2Dialog from "@/components/dialogs/CO2Dialog";
import { CO2CalculationResult } from "@/types/co2";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/tables/DataTable/data-table";
import { auditLogColumns } from "@/components/tables/AuditLogColumns";
import { assetHistoryColumns } from "@/components/tables/AsetHistoryColumns";
import { updateAssetNotes, updateAsset } from "@/lib/actions/assets.actions";
import { ColumnDef } from "@tanstack/react-table";
import EditAssetDrawer from "@/components/forms/asset/EditAssetDrawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStatusLabelsQuery } from "@/hooks/queries/useStatusLabelsQuery";
import { useUserQuery } from "@/hooks/queries/useUserQuery";
import { useQueryClient } from "@tanstack/react-query";
import { DepreciationCalculator } from "@/components/depreciation/DepreciationCalculator";
import { updateAssetDepreciation } from "@/lib/actions/depreciation.actions";
import { toast } from "react-hot-toast";

// Helper component for individual detail items to reduce repetition
const DetailItem: React.FC<{
  icon: ReactNode;
  label: string;
  value?: string | number | null | ReactNode;
}> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="text-muted-foreground mt-1">{icon}</div>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="text-sm font-medium">{value || "—"}</div>
    </div>
  </div>
);

// Notes component
const NotesSection: React.FC<{
  assetId: string;
  currentNotes?: string;
  onNotesUpdate?: (notes: string) => void;
}> = ({ assetId, currentNotes, onNotesUpdate }) => {
  const [notes, setNotes] = useState(currentNotes || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await updateAssetNotes(assetId, notes);
      if (response.success) {
        toast.success("Asset notes have been updated successfully.");
        setIsEditing(false);
        onNotesUpdate?.(notes);
      } else {
        toast.error(response.error || "Failed to update notes.");
      }
    } catch (error) {
      toast.error("An error occurred while saving notes.");
    } finally {
      setIsSaving(false);
    }
  };

  // Update local state when currentNotes prop changes
  useEffect(() => {
    setNotes(currentNotes || "");
  }, [currentNotes]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Asset Notes</CardTitle>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setNotes(currentNotes || "");
                  setIsEditing(false);
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              {notes ? "Edit" : "Add"} Notes
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter notes about this asset..."
            className="min-h-[200px]"
          />
        ) : (
          <div className="min-h-[200px] p-4 border rounded-lg bg-muted/50">
            {notes ? (
              <p className="whitespace-pre-wrap text-sm">{notes}</p>
            ) : (
              <p className="text-muted-foreground text-sm">
                No notes added yet. Click &quot;Add Notes&quot; to add
                information about this asset.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const AssetDetailView: React.FC<{
  asset: EnhancedAssetType;
  actions: any; // Using `any` to match original props, should be refined
  breadcrumbs?: React.ReactNode;
  onNotesUpdate?: (notes: string) => void;
  setEditOpen?: (open: boolean) => void;
  editOpen?: boolean;
  categoryName?: string;
}> = ({
  asset,
  actions,
  breadcrumbs,
  onNotesUpdate,
  setEditOpen: setEditOpenProp,
  editOpen: editOpenProp,
  categoryName,
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const [isCo2DialogOpen, setCo2DialogOpen] = useState(false);
  const [co2Result, setCo2Result] = useState<CO2CalculationResult | null>(null);
  const [isNewCo2Calculation, setIsNewCo2Calculation] = useState(false);
  const [internalEditOpen, setInternalEditOpen] = useState(false);
  const editOpen = editOpenProp !== undefined ? editOpenProp : internalEditOpen;
  const setEditOpen = setEditOpenProp || setInternalEditOpen;
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(asset.statusLabel?.id);
  const { statusLabels, isLoading: isLoadingStatusLabels } =
    useStatusLabelsQuery();
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(asset.userId || "");
  const { users: allUsers, isLoading: isLoadingUsers } = useUserQuery();
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [isCalculatingDepreciation, setIsCalculatingDepreciation] =
    useState(false);

  // Memoize columns to prevent unnecessary re-renders
  const auditLogColumnsMemo = useMemo(() => auditLogColumns(), []);
  const assetHistoryColumnsMemo = useMemo(() => assetHistoryColumns(), []);

  // Sort records to ensure we always have the latest one.
  const latestCo2Record = Array.isArray(asset.co2eRecords)
    ? asset.co2eRecords
        .slice()
        .sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )[0]
    : undefined;

  console.log("\n\nCO2 History Data:", asset.co2eRecords);

  // CO2 History columns (moved here for access to state)
  const co2HistoryColumnsMemo = useMemo(
    () => [
      {
        id: "date",
        header: "Date",
        accessorFn: (row: any) => row.createdAt,
        cell: ({ getValue }: any) => {
          const rawDate = getValue();
          let date: Date | null = null;
          if (rawDate instanceof Date) {
            date = rawDate;
          } else if (
            typeof rawDate === "string" &&
            !isNaN(Date.parse(rawDate))
          ) {
            date = new Date(rawDate);
          }
          return (
            <span>
              {date && !isNaN(date.getTime()) ? date.toLocaleString() : "—"}
            </span>
          );
        },
        enableSorting: true,
      },
      {
        id: "co2e",
        header: "Total CO2e",
        accessorKey: "co2e",
        cell: ({ getValue }: any) => (
          <span>{Number(getValue() as number).toFixed(2)}</span>
        ),
        enableSorting: true,
      },
      {
        id: "units",
        header: "Units",
        accessorKey: "units",
        cell: ({ getValue }: any) => <span>{getValue() as string}</span>,
      },
      {
        id: "current",
        header: "Current",
        cell: ({ row }: any) =>
          row.original.id === latestCo2Record?.id ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs font-semibold">
              Current
            </span>
          ) : null,
        enableSorting: false,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }: any) => (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              try {
                const details =
                  typeof row.original.details === "string"
                    ? JSON.parse(row.original.details)
                    : row.original.details;
                setCo2Result(details);
                setIsNewCo2Calculation(false);
                setCo2DialogOpen(true);
              } catch (e) {
                toast.error("Could not load CO2 details");
              }
            }}
          >
            View Details
          </Button>
        ),
      },
    ],
    [toast, latestCo2Record],
  );

  const handleCalculateCo2 = () => {
    if (!asset.model || !asset.model.manufacturer) {
      toast.error(
        <span>
          <b>Missing Model or Manufacturer</b>
          <br />
          Please assign both a model and a manufacturer to this asset before
          calculating CO2.
        </span>,
      );
      return;
    }
    startTransition(async () => {
      try {
        const response = await fetch(`/api/co2/calculate?t=${Date.now()}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assetId: asset.id }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && "data" in result && result.data) {
          setCo2Result(result.data as CO2CalculationResult);
          setIsNewCo2Calculation(true);
          setCo2DialogOpen(true);
        } else {
          toast.error(result.error || "CO2 Calculation Failed");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "An unknown error occurred.",
        );
      }
    });
  };

  const handleViewCo2 = () => {
    if (!latestCo2Record?.details) return;

    try {
      const details = JSON.parse(latestCo2Record.details as string);

      // Convert any Decimal fields to numbers to avoid serialization issues
      if (
        details.emissionFactor &&
        typeof details.emissionFactor === "object"
      ) {
        details.emissionFactor = Number(details.emissionFactor);
      }

      // Ensure all numeric fields in scope breakdown are numbers
      if (details.scopeBreakdown) {
        if (
          details.scopeBreakdown.scope1?.total &&
          typeof details.scopeBreakdown.scope1.total === "object"
        ) {
          details.scopeBreakdown.scope1.total = Number(
            details.scopeBreakdown.scope1.total,
          );
        }
        if (
          details.scopeBreakdown.scope2?.total &&
          typeof details.scopeBreakdown.scope2.total === "object"
        ) {
          details.scopeBreakdown.scope2.total = Number(
            details.scopeBreakdown.scope2.total,
          );
        }
        if (
          details.scopeBreakdown.scope3?.total &&
          typeof details.scopeBreakdown.scope3.total === "object"
        ) {
          details.scopeBreakdown.scope3.total = Number(
            details.scopeBreakdown.scope3.total,
          );
        }
      }

      // Ensure all required properties exist with defaults if missing
      const completeDetails = {
        ...details,
        lifecycleBreakdown: details.lifecycleBreakdown || {},
        sources: details.sources || [],
        emissionFactors: details.emissionFactors || [],
      };

      setCo2Result(completeDetails as CO2CalculationResult);
      setIsNewCo2Calculation(false);
      setCo2DialogOpen(true);
    } catch (error) {
      console.error("Error parsing CO2 details:", error);
      toast.error("Could not parse CO2 details");
    }
  };

  const handleQuickDepreciationCalculation = async () => {
    setIsCalculatingDepreciation(true);
    try {
      const result = await updateAssetDepreciation(asset.id);
      if (result.success) {
        toast.success("Asset depreciation has been recalculated successfully.");
        queryClient.invalidateQueries({ queryKey: ["asset", asset.id] });
      } else {
        toast.error(result.error || "Failed to calculate depreciation.");
      }
    } catch (error) {
      toast.error("Failed to calculate depreciation.");
    } finally {
      setIsCalculatingDepreciation(false);
    }
  };

  // Memoized formatted dates to avoid SSR/CSR mismatch
  const [createdAtString, setCreatedAtString] = useState("");
  const [updatedAtString, setUpdatedAtString] = useState("");
  const [purchaseDateString, setPurchaseDateString] = useState("");
  const [warrantyEndDateString, setWarrantyEndDateString] = useState("");

  useEffect(() => {
    if (asset.createdAt)
      setCreatedAtString(new Date(asset.createdAt).toLocaleString());
    if (asset.updatedAt)
      setUpdatedAtString(new Date(asset.updatedAt).toLocaleString());
    if (asset.purchaseDate)
      setPurchaseDateString(new Date(asset.purchaseDate).toLocaleDateString());
    if (asset.warrantyEndDate)
      setWarrantyEndDateString(
        new Date(asset.warrantyEndDate).toLocaleDateString(),
      );
  }, [
    asset.createdAt,
    asset.updatedAt,
    asset.purchaseDate,
    asset.warrantyEndDate,
  ]);

  const hardwareDetails = (
    <>
      <DetailItem
        icon={<Laptop className="h-4 w-4" />}
        label="Category"
        value={categoryName || asset.formTemplate?.name || asset.category?.name}
      />
      <DetailItem
        icon={<Briefcase className="h-4 w-4" />}
        label="Model"
        value={asset.model?.name}
      />
      <DetailItem
        icon={<Building className="h-4 w-4" />}
        label="Manufacturer"
        value={asset.model?.manufacturer?.name}
      />
    </>
  );

  const assignmentDetails = (
    <>
      <DetailItem
        icon={<User className="h-4 w-4" />}
        label="Assigned To"
        value={
          isEditingUser ? (
            <div className="flex items-center gap-2">
              <Select
                value={selectedUser}
                onValueChange={setSelectedUser}
                disabled={isSavingUser || isLoadingUsers}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {allUsers?.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name || u.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                className="btn btn-primary px-2 py-1 rounded text-sm font-medium"
                disabled={isSavingUser}
                onClick={async () => {
                  setIsSavingUser(true);
                  try {
                    const res = await updateAsset(asset.id, {
                      name: asset.name,
                      assetTag: asset.assetTag,
                      notes: asset.notes ?? undefined,
                      departmentId: asset.department?.id ?? undefined,
                      userId: selectedUser ?? undefined,
                      modelId: asset.model?.id ?? undefined,
                      statusLabelId: asset.statusLabel?.id ?? undefined,
                      locationId: asset.departmentLocation?.id ?? undefined,
                      formTemplateId: asset.formTemplate?.id ?? undefined,
                      templateValues: asset.formValues?.[0]?.values ?? {},
                      purchaseOrderId: asset.purchaseOrder?.id ?? undefined,
                      energyConsumption: asset.energyConsumption ?? undefined,
                      expectedLifespan: asset.expectedLifespan ?? undefined,
                      endOfLifePlan: asset.endOfLifePlan ?? undefined,
                      supplierId: undefined,
                      warrantyEndDate: asset.warrantyEndDate ?? undefined,
                    });
                    if (res.success) {
                      toast.success(
                        "Asset assigned user updated successfully.",
                      );
                      setIsEditingUser(false);
                      queryClient.invalidateQueries({
                        queryKey: ["asset", asset.id],
                      });
                    } else {
                      toast.error(res.error || "Failed to update assignment.");
                    }
                  } catch (e) {
                    toast.error("Failed to update assignment.");
                  } finally {
                    setIsSavingUser(false);
                  }
                }}
              >
                {isSavingUser ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </button>
              <button
                className="btn btn-outline px-2 py-1 rounded text-sm font-medium"
                disabled={isSavingUser}
                onClick={() => {
                  setIsEditingUser(false);
                  setSelectedUser(asset.userId || "");
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {asset.user?.name || "Unassigned"}
              <button
                className="ml-1 p-1 rounded hover:bg-muted transition"
                aria-label="Edit assignment"
                onClick={() => setIsEditingUser(true)}
              >
                <Edit className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          )
        }
      />
      <DetailItem
        icon={<Building2 className="h-4 w-4" />}
        label="Department"
        value={asset.department?.name}
      />
      <DetailItem
        icon={<MapPin className="h-4 w-4" />}
        label="Location"
        value={asset.departmentLocation?.name}
      />
    </>
  );

  const financialDetails = (
    <>
      <DetailItem
        icon={<DollarSign className="h-4 w-4" />}
        label="Price"
        value={`$${Number(asset.price || 0).toFixed(2)}`}
      />
      <DetailItem
        icon={<ShoppingCart className="h-4 w-4" />}
        label="Purchase Date"
        value={purchaseDateString || "—"}
      />
      <DetailItem
        icon={<ShieldCheck className="h-4 w-4" />}
        label="Warranty End"
        value={warrantyEndDateString || "—"}
      />
      <DetailItem
        icon={<Truck className="h-4 w-4" />}
        label="Supplier"
        value={asset.supplier?.name}
      />
      <DetailItem
        icon={<Receipt className="h-4 w-4" />}
        label="PO Number"
        value={asset.purchaseOrder?.poNumber}
      />
    </>
  );

  const environmentalAndLifecycleDetails = (
    <>
      <DetailItem
        icon={<Zap className="h-4 w-4" />}
        label="Energy Consumption (Watts)"
        value={asset.energyConsumption ? `${asset.energyConsumption} W` : "—"}
      />
      <DetailItem
        icon={<Hourglass className="h-4 w-4" />}
        label="Expected Lifespan (Years)"
        value={asset.expectedLifespan ? `${asset.expectedLifespan} years` : "—"}
      />
      <DetailItem
        icon={<Recycle className="h-4 w-4" />}
        label="End-of-Life Plan"
        value={asset.endOfLifePlan || "—"}
      />
    </>
  );

  const handleEditDrawerClose = useCallback(() => {
    setEditOpen(false);
  }, [setEditOpen]);

  return (
    <>
      <EditAssetDrawer
        assetId={asset.id}
        open={editOpen}
        onClose={handleEditDrawerClose}
      />
      <Card className="h-full mx-2 border-0 shadow-none">
        <CardHeader>
          {breadcrumbs && <div className="mb-4">{breadcrumbs}</div>}
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl font-semibold">
                  {asset.name}
                </CardTitle>
                {isEditingStatus ? (
                  <div className="flex items-center gap-2">
                    <Select
                      value={selectedStatus}
                      onValueChange={(value) => setSelectedStatus(value)}
                      disabled={isSavingStatus || isLoadingStatusLabels}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusLabels?.map((label) => (
                          <SelectItem key={label.id} value={label.id}>
                            <span className="flex items-center gap-2">
                              <span
                                className="inline-block w-3 h-3 rounded-full"
                                style={{ backgroundColor: label.colorCode }}
                              />
                              {label.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <button
                      className="btn btn-primary px-2 py-1 rounded text-sm font-medium"
                      disabled={
                        isSavingStatus ||
                        selectedStatus === asset.statusLabel?.id
                      }
                      onClick={async () => {
                        setIsSavingStatus(true);
                        try {
                          const hasTemplate = !!(
                            asset.formTemplate &&
                            asset.formTemplate.id &&
                            asset.formValues?.[0]?.values &&
                            Object.keys(asset.formValues?.[0]?.values || {})
                              .length > 0
                          );
                          const updatePayload = {
                            name: asset.name,
                            assetTag: asset.assetTag,
                            notes: asset.notes ?? undefined,
                            departmentId: asset.department?.id ?? undefined,
                            userId: asset.userId ?? undefined,
                            modelId: asset.model?.id ?? undefined,
                            statusLabelId: selectedStatus,
                            locationId:
                              asset.departmentLocation?.id ?? undefined,
                            formTemplateId: hasTemplate
                              ? asset.formTemplate!.id
                              : undefined,
                            templateValues: hasTemplate
                              ? asset.formValues?.[0]?.values
                              : undefined,
                            purchaseOrderId:
                              asset.purchaseOrder?.id ?? undefined,
                            energyConsumption:
                              asset.energyConsumption ?? undefined,
                            expectedLifespan:
                              asset.expectedLifespan ?? undefined,
                            endOfLifePlan: asset.endOfLifePlan ?? undefined,
                            supplierId: undefined,
                            warrantyEndDate: asset.warrantyEndDate ?? undefined,
                          };
                          const res = await updateAsset(
                            asset.id,
                            updatePayload,
                          );
                          if (res.success) {
                            toast.success(
                              "Asset status was updated successfully.",
                            );
                            setIsEditingStatus(false);
                            queryClient.invalidateQueries({
                              queryKey: ["asset", asset.id],
                            });
                          } else {
                            toast.error(
                              res.error || "Failed to update status.",
                            );
                          }
                        } catch (e) {
                          toast.error("Failed to update status.");
                        } finally {
                          setIsSavingStatus(false);
                        }
                      }}
                    >
                      {isSavingStatus ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Save"
                      )}
                    </button>
                    <button
                      className="btn btn-outline px-2 py-1 rounded text-sm font-medium"
                      disabled={isSavingStatus}
                      onClick={() => {
                        setIsEditingStatus(false);
                        setSelectedStatus(asset.statusLabel?.id);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge
                      style={{ backgroundColor: asset.statusLabel?.colorCode }}
                      className="text-white"
                    >
                      {asset.statusLabel?.name}
                    </Badge>
                    <button
                      className="ml-1 p-1 rounded hover:bg-muted transition"
                      aria-label="Edit status"
                      onClick={() => setIsEditingStatus(true)}
                    >
                      <Edit className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                )}
              </div>
              {asset.assetTag && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  Tag: {asset.assetTag}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() =>
                            navigator.clipboard.writeText(
                              String(asset.assetTag),
                            )
                          }
                        >
                          <ClipboardCopy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy Tag Number</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </p>
              )}
            </div>
            <div className="flex-shrink-0 flex gap-2">
              <ActionButtons
                actions={actions}
                isAssigned={!!asset.user}
                isActive={[
                  "maintenance",
                  "archived",
                  "inactive",
                  "out of order",
                ].includes((asset.status ?? "").toLowerCase())}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="details">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="depreciation">Depreciation</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="co2-history">CO₂ History</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">
                        Hardware Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {hardwareDetails}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">
                        Assignment & Location
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {assignmentDetails}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">
                        Financial Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {financialDetails}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">
                        Environmental & Lifecycle
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {environmentalAndLifecycleDetails}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">
                        Custom Fields
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {asset.formValues &&
                        asset.formValues.length > 0 &&
                        asset.formValues.map(
                          (fv: any, idx: number) =>
                            fv.values &&
                            Object.entries(fv.values).map(([key, value]) => (
                              <DetailItem
                                key={
                                  fv.id ? `${fv.id}-${key}` : `${idx}-${key}`
                                }
                                icon={
                                  <Pocket className="h-4 w-4 text-muted-foreground" />
                                }
                                label={
                                  key.length <= 3
                                    ? key.toUpperCase()
                                    : key.charAt(0).toUpperCase() + key.slice(1)
                                }
                                value={
                                  typeof value === "string" && value.length > 0
                                    ? value.charAt(0).toUpperCase() +
                                      value.slice(1)
                                    : String(value)
                                }
                              />
                            )),
                        )}
                    </CardContent>
                  </Card>
                </div>
                <div className="lg:col-span-1 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <QrCode className="h-4 w-4" />
                        Asset QR Code
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center p-4">
                      <QRCode
                        value={
                          typeof window !== "undefined"
                            ? window.location.href
                            : ""
                        }
                        size={128}
                      />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Timestamps
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <DetailItem
                        icon={<Calendar className="h-4 w-4" />}
                        label="Created At"
                        value={createdAtString}
                      />
                      <DetailItem
                        icon={<RefreshCcw className="h-4 w-4" />}
                        label="Last Updated"
                        value={updatedAtString}
                      />
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                          CO2 Footprint
                        </CardTitle>
                        {latestCo2Record && (
                          <Badge
                            variant={
                              Number(latestCo2Record.co2e) <= 500
                                ? "default"
                                : Number(latestCo2Record.co2e) <= 1000
                                  ? "secondary"
                                  : "destructive"
                            }
                            className="text-xs"
                          >
                            {Number(latestCo2Record.co2e) <= 500
                              ? "Low Impact"
                              : Number(latestCo2Record.co2e) <= 1000
                                ? "Medium Impact"
                                : "High Impact"}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div
                          className={`text-3xl font-bold transition-colors ${
                            latestCo2Record
                              ? "text-green-700 hover:text-green-800 cursor-pointer"
                              : "text-muted-foreground"
                          }`}
                          onClick={latestCo2Record ? handleViewCo2 : undefined}
                          title={
                            latestCo2Record
                              ? "Click to view detailed breakdown"
                              : undefined
                          }
                        >
                          {latestCo2Record
                            ? `${Number(latestCo2Record.co2e).toFixed(2)} ${latestCo2Record.units}`
                            : "N/A"}
                        </div>

                        {latestCo2Record && (
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Calculated on{" "}
                              {new Date(
                                latestCo2Record.createdAt,
                              ).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <RefreshCcw className="h-3 w-3" />
                              Click value for detailed scope breakdown
                            </div>
                          </div>
                        )}

                        {!latestCo2Record && (
                          <p className="text-xs text-muted-foreground">
                            Environmental impact not yet calculated
                          </p>
                        )}
                      </div>

                      <Button
                        size="sm"
                        className="w-full mt-4"
                        onClick={handleCalculateCo2}
                        disabled={isPending}
                        variant={latestCo2Record ? "outline" : "default"}
                      >
                        {isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Leaf className="h-4 w-4 mr-2" />
                        )}
                        {latestCo2Record ? "Recalculate CO2" : "Calculate CO2"}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="depreciation">
              <DepreciationCalculator
                asset={asset as any}
                onUpdate={() => {
                  // Refresh asset data after depreciation calculation
                  queryClient.invalidateQueries({
                    queryKey: ["asset", asset.id],
                  });
                }}
              />
            </TabsContent>
            <TabsContent value="history">
              <div className="space-y-6">
                {/* Asset History */}
                <Card>
                  <CardHeader>
                    <CardTitle>Asset History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {asset.assetHistory && asset.assetHistory.length > 0 ? (
                      <DataTable
                        pageIndex={0}
                        pageSize={10}
                        total={asset.assetHistory.length}
                        onPaginationChange={() => {}}
                        columns={assetHistoryColumnsMemo}
                        data={asset.assetHistory as any}
                      />
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium">No Asset History</p>
                        <p className="text-sm">
                          No history records have been found for this asset.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                {/* Audit Logs */}
                <Card>
                  <CardHeader>
                    <CardTitle>Audit Logs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {asset.auditLogs && asset.auditLogs.length > 0 ? (
                      <DataTable
                        pageIndex={0}
                        pageSize={10}
                        total={asset.auditLogs.length}
                        onPaginationChange={() => {}}
                        columns={auditLogColumnsMemo}
                        data={asset.auditLogs}
                      />
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium">No Audit Logs</p>
                        <p className="text-sm">
                          No audit activities have been recorded for this asset.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="co2-history">
              {/* CO2 Calculation History (show if at least one record) */}
              {asset.co2eRecords && asset.co2eRecords.length > 0 ? (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>CO2 Calculation History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DataTable
                      pageIndex={0}
                      pageSize={10}
                      total={asset.co2eRecords.length}
                      onPaginationChange={() => {}}
                      columns={co2HistoryColumnsMemo}
                      data={asset.co2eRecords}
                    />
                  </CardContent>
                </Card>
              ) : (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>CO2 Calculation History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-gray-500">
                      <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-medium">
                        No CO2 Calculation History
                      </p>
                      <p className="text-sm">
                        No CO2 calculations have been recorded for this asset.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            <TabsContent value="notes">
              <NotesSection
                assetId={asset.id}
                currentNotes={asset.notes}
                onNotesUpdate={onNotesUpdate}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      {co2Result && (
        <CO2Dialog
          isOpen={isCo2DialogOpen}
          onClose={() => setCo2DialogOpen(false)}
          assetId={asset.id}
          assetName={asset.name}
          initialResult={co2Result}
          isNewCalculation={isNewCo2Calculation}
          onSave={() => {
            setCo2DialogOpen(false);
            // Invalidate React Query cache to refetch updated asset data
            queryClient.invalidateQueries({ queryKey: ["asset", asset.id] });
            router.refresh();
          }}
        />
      )}
    </>
  );
};
