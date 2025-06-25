"use client";

import React, {
  ReactNode,
  useState,
  useTransition,
  useMemo,
  useEffect,
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
import {
  calculateAssetCO2Action,
  saveAssetCO2Action,
  getCO2DataFromStore,
} from "@/lib/actions/co2.actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/tables/DataTable/data-table";
import { auditLogColumns } from "@/components/tables/AuditLogColumns";
import { assetHistoryColumns } from "@/components/tables/AsetHistoryColumns";

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
      <p className="text-sm font-medium">{value || "—"}</p>
    </div>
  </div>
);

// Notes component
const NotesSection: React.FC<{
  assetId: string;
  currentNotes?: string;
}> = ({ assetId, currentNotes }) => {
  const [notes, setNotes] = useState(currentNotes || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement save notes action
      // await saveAssetNotes(assetId, notes);
      toast({
        title: "Notes saved",
        description: "Asset notes have been updated successfully.",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

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
              <Plus className="h-4 w-4 mr-2" />
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
}> = ({ asset, actions, breadcrumbs }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isCo2DialogOpen, setCo2DialogOpen] = useState(false);
  const [co2Result, setCo2Result] = useState<CO2CalculationResult | null>(null);
  const [isNewCo2Calculation, setIsNewCo2Calculation] = useState(false);

  // Memoize columns to prevent unnecessary re-renders
  const auditLogColumnsMemo = useMemo(() => auditLogColumns(), []);
  const assetHistoryColumnsMemo = useMemo(() => assetHistoryColumns(), []);

  // Sort records to ensure we always have the latest one.
  const latestCo2Record = asset.co2eRecords?.sort(
    (a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0];

  const handleCalculateCo2 = () => {
    startTransition(async () => {
      // Test with API route instead of server action
      const response = await fetch(`/api/co2/calculate?t=${Date.now()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId: asset.id }),
      });
      const result = await response.json();

      if (result.success && "data" in result && result.data) {
        setCo2Result(result.data as CO2CalculationResult);
        setIsNewCo2Calculation(true);
        setCo2DialogOpen(true);
      } else {
        toast({
          title: "CO2 Calculation Failed",
          description: result.error || "An unknown error occurred.",
          variant: "destructive",
        });
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
      toast({
        title: "Could not parse CO2 details",
        description:
          "There was an error loading the CO2 data. Please try recalculating.",
        variant: "destructive",
      });
    }
  };

  const hardwareDetails = (
    <>
      <DetailItem
        icon={<Laptop className="h-4 w-4" />}
        label="Category"
        value={asset.category?.name}
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
        value={asset.user?.name}
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
        value={
          asset.purchaseDate
            ? new Date(asset.purchaseDate).toLocaleDateString()
            : "—"
        }
      />
      <DetailItem
        icon={<ShieldCheck className="h-4 w-4" />}
        label="Warranty End"
        value={
          asset.warrantyEndDate
            ? new Date(asset.warrantyEndDate).toLocaleDateString()
            : "—"
        }
      />
      <DetailItem
        icon={<Truck className="h-4 w-4" />}
        label="Supplier"
        value={asset.supplier?.name}
      />
      <DetailItem
        icon={<Receipt className="h-4 w-4" />}
        label="PO Number"
        value={asset.purchaseOrderNumber}
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

  return (
    <>
      <Card className="h-full mx-2 border-0 shadow-none">
        <CardHeader>
          {breadcrumbs && <div className="mb-4">{breadcrumbs}</div>}
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl font-semibold">
                  {asset.name}
                </CardTitle>
                {asset.statusLabel && (
                  <Badge
                    style={{
                      backgroundColor: asset.statusLabel.colorCode,
                    }}
                    className="text-white"
                  >
                    {asset.statusLabel.name}
                  </Badge>
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
            <div className="flex-shrink-0">
              <ActionButtons
                actions={actions}
                isAssigned={!!asset.user}
                isActive={[
                  "maintenance",
                  "archived",
                  "inactive",
                  "out of order",
                ].includes(asset.status.toLowerCase())}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="details">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
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
                      <QRCode value={window.location.href} size={128} />
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
                        value={new Date(asset.createdAt).toLocaleString()}
                      />
                      <DetailItem
                        icon={<RefreshCcw className="h-4 w-4" />}
                        label="Last Updated"
                        value={new Date(asset.updatedAt).toLocaleString()}
                      />
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Leaf className="h-4 w-4 text-green-600" />
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
            <TabsContent value="history">
              {/* CO2 Calculation History */}
              {asset.co2eRecords && asset.co2eRecords.length > 1 && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-md font-semibold flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-green-600" />
                      CO2 Calculation History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm border">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="px-3 py-2 text-left">Date</th>
                            <th className="px-3 py-2 text-left">Total CO2e</th>
                            <th className="px-3 py-2 text-left">Units</th>
                            <th className="px-3 py-2 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {asset.co2eRecords
                            .slice()
                            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                            .map((record, idx) => (
                              <tr key={record.id} className={idx === 0 ? "font-semibold bg-green-50" : ""}>
                                <td className="px-3 py-2">
                                  {new Date(record.createdAt).toLocaleString()}
                                </td>
                                <td className="px-3 py-2">
                                  {Number(record.co2e).toFixed(2)}
                                </td>
                                <td className="px-3 py-2">{record.units}</td>
                                <td className="px-3 py-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      try {
                                        const details = typeof record.details === 'string' ? JSON.parse(record.details) : record.details;
                                        setCo2Result(details);
                                        setIsNewCo2Calculation(false);
                                        setCo2DialogOpen(true);
                                      } catch (e) {
                                        toast({
                                          title: "Could not load CO2 details",
                                          description: "There was an error loading this calculation.",
                                          variant: "destructive",
                                        });
                                      }
                                    }}
                                  >
                                    View Details
                                  </Button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
              <div className="space-y-6">
                {/* Asset History */}
                <Card>
                  <CardHeader>
                    <CardTitle>Asset History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {asset.assetHistory && asset.assetHistory.length > 0 ? (
                      <DataTable
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
            <TabsContent value="notes">
              <NotesSection assetId={asset.id} currentNotes={asset.notes} />
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
            router.refresh();
          }}
        />
      )}
    </>
  );
};
