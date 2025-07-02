"use client";

import React, {
  useState,
  useTransition,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, InfoIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Imports from previous component
import { licenseSchema } from "@/lib/schemas";
import { useStatusLabelUIStore } from "@/lib/stores/useStatusLabelUIStore";
import { useStatusLabelsQuery } from "@/hooks/queries/useStatusLabelsQuery";
import { useLicenseQuery } from "@/hooks/queries/useLicenseQuery";
import { useDepartmentUIStore } from "@/lib/stores/useDepartmentUIStore";
import { useDepartmentQuery } from "@/hooks/queries/useDepartmentQuery";
import { useInventoryUIStore } from "@/lib/stores/useInventoryUIStore";
import { useSupplierQuery } from "@/hooks/queries/useSupplierQuery";
import { useInventoryQuery } from "@/hooks/queries/useInventoryQuery";
import { useLocationUIStore } from "@/lib/stores/useLocationUIStore";
import { useLocationQuery } from "@/hooks/queries/useLocationQuery";

// UI Components
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectWithButton } from "@/components/SelectWithButton";
import CustomInput from "@/components/CustomInput";
import CustomPriceInput from "@/components/CustomPriceInput";
import CustomDatePicker from "@/components/CustomDatePicker";
import CustomCurrencySelect from "@/components/CustomCurrencySelect";
import Dropzone from "@/components/Dropzone";
import { FormContainer } from "@/components/forms/FormContainer";
import ActionFooter from "@/components/forms/ActionFooter";
import FormSection from "@/components/forms/FormSection";
import MainFormSkeleton from "@/components/forms/MainFormSkeleton";
import FormProgressSkeleton from "@/components/forms/FormProgressSkeleton";
import {
  FormProgress,
  type SectionStatus,
} from "@/components/forms/FormProgress";
import {
  getRequiredFieldCount,
  getRequiredFieldsList,
} from "@/lib/schemas/schema-utils";
import { getStatusLocationSection } from "@/components/forms/formSections";
import { useSupplierUIStore } from "@/lib/stores/useSupplierUIStore";
import { usePurchaseOrderUIStore } from "@/lib/stores/usePurchaseOrderUIStore";
import { usePurchaseOrderQuery } from "@/hooks/queries/usePurchaseOrderQuery";
import { PurchaseOrderDialog } from "../dialogs/PurchaseOrderDialog";
import { findById as findLicenseById } from "@/lib/actions/license.actions";

type LicenseFormValues = z.infer<typeof licenseSchema>;

// Inline type for LicenseFile (from Prisma schema)
type LicenseFile = {
  id: string;
  licenseId: string;
  fileUrl: string;
  fileName: string;
  uploadedAt: string;
  uploadedBy?: string | null;
};

// Collapsible Section Component
const CollapsibleSection = ({
  title,
  description,
  children,
  isExpanded,
  onToggle,
  isComplete = false,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  isComplete?: boolean;
}) => (
  <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-2 h-2 rounded-full ${
            isComplete ? "bg-green-500" : "bg-slate-200"
          }`}
        />
        <div>
          <h2 className="text-base font-medium">{title}</h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <div
        className={`transform transition-transform duration-200 ${
          isExpanded ? "rotate-180" : ""
        }`}
      >
        <ChevronDown className="h-5 w-5 text-slate-400" />
      </div>
    </button>

    <div
      className={`transition-all duration-300 ${
        isExpanded
          ? "max-h-[2000px] opacity-100"
          : "max-h-0 opacity-0 overflow-hidden"
      }`}
    >
      <div className="p-6 border-t">{children}</div>
    </div>
  </div>
);

interface LicenseFormProps {
  id?: string;
  isUpdate?: boolean;
  onSuccess?: () => void;
}

const LicenseForm: React.FC<LicenseFormProps> = ({
  id,
  isUpdate = false,
  onSuccess,
}) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<LicenseFile[]>([]);
  const [uploading, setUploading] = useState(false);

  // State for collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    statusLocation: false,
    licenseManagement: false,
    purchaseInfo: false,
    notifications: false,
    attachments: false,
  });

  const params = useParams();
  const licenseId = id || (params?.id as string | undefined);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createdLicenseId, setCreatedLicenseId] = useState<string | undefined>(
    licenseId,
  );
  const [loading, setLoading] = useState(false);
  const [licenseData, setLicenseData] = useState<any>(null);

  // Queries and UI stores
  const { onOpen: openStatus } = useStatusLabelUIStore();
  const { statusLabels } = useStatusLabelsQuery();
  const { createLicense, updateLicense, refresh } = useLicenseQuery();
  const { onOpen: openDepartment } = useDepartmentUIStore();
  const { departments } = useDepartmentQuery();
  const { suppliers } = useSupplierQuery();
  const { inventories } = useInventoryQuery();
  const { locations } = useLocationQuery();
  const { onOpen: openInventory } = useInventoryUIStore();
  const { onOpen: openLocation } = useLocationUIStore();
  const { onOpen: openSupplier } = useSupplierUIStore();
  const { onOpen: openPurchaseOrder } = usePurchaseOrderUIStore();
  const { items: purchaseOrders } = usePurchaseOrderQuery()();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Helper to get the correct license ID
  const idToUse = createdLicenseId || licenseId;

  // Enhanced Dropzone handler for multiple files
  const handleDrop = (acceptedFiles: File[]) => {
    setSelectedFiles((prev) => [...prev, ...acceptedFiles]);
  };

  // Batch upload handler
  async function handleBatchUpload() {
    if (!idToUse || selectedFiles.length === 0) return;
    setUploading(true);
    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("licenseId", idToUse);
      await fetch("/api/licenses/files/upload", {
        method: "POST",
        body: formData,
      });
    }
    setUploading(false);
    setSelectedFiles([]);
    fetchFiles();
    toast.success("Files uploaded!");
  }

  // Section toggle handler
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Form setup
  const form = useForm<LicenseFormValues>({
    resolver: zodResolver(licenseSchema),
    defaultValues: {
      licenseName: "",
      licensedEmail: "",
      statusLabelId: "",
      locationId: "",
      inventoryId: "",
      minSeatsAlert: "",
      seats: "",
      alertRenewalDays: "",
      notes: "",
    },
  });

  // Debug: log form errors
  useEffect(() => {
    console.log("formState.errors", form.formState.errors);
  }, [form.formState.errors]);

  const statusLocationSection = getStatusLocationSection({
    form,
    statusLabels,
    locations,
    departments,
    inventories,
    openStatus,
    openLocation,
    openDepartment,
    openInventory,
    isLoading: false,
  });

  async function fetchFiles() {
    if (!idToUse) return;
    const res = await fetch(`/api/licenses/files/list?licenseId=${idToUse}`);
    const { data } = await res.json();
    setUploadedFiles(data);
  }

  async function handleDownload(fileId: string) {
    const res = await fetch(
      `/api/licenses/files/download-url?fileId=${fileId}`,
    );
    const { data: url } = await res.json();
    window.open(url, "_blank");
  }

  async function handleDelete(fileId: string) {
    await fetch(`/api/licenses/files/delete`, {
      method: "POST",
      body: JSON.stringify({ fileId }),
      headers: { "Content-Type": "application/json" },
    });
    fetchFiles();
    toast.success("File deleted");
  }

  useEffect(() => {
    if (idToUse) fetchFiles();
  }, [idToUse]);

  // Load license data for update
  useEffect(() => {
    if (isUpdate && licenseId) {
      setLoading(true);
      findLicenseById(licenseId)
        .then((res) => {
          if (res && res.data) {
            setLicenseData(res.data);
            // Set form values
            form.reset({
              licenseName: res.data.name || "",
              licensedEmail: res.data.licensedEmail || "",
              statusLabelId: res.data.statusLabelId || "",
              locationId: res.data.locationId || "",
              inventoryId: res.data.inventoryId || "",
              minSeatsAlert: res.data.minSeatsAlert?.toString() || "",
              seats: res.data.seats?.toString() || "",
              alertRenewalDays: res.data.alertRenewalDays?.toString() || "",
              notes: res.data.purchaseNotes || "",
              purchaseDate: res.data.purchaseDate
                ? new Date(res.data.purchaseDate)
                : undefined,
              renewalDate: res.data.renewalDate
                ? new Date(res.data.renewalDate)
                : undefined,
              poNumber: res.data.poNumber || "",
              supplierId: res.data.supplierId || "",
              purchasePrice: res.data.purchasePrice?.toString() || "",
              renewalPrice: res.data.renewalPrice?.toString() || "",
              monthlyPrice: res.data.monthlyPrice?.toString() || "",
              annualPrice: res.data.annualPrice?.toString() || "",
              pricePerSeat: res.data.pricePerSeat?.toString() || "",
              currency: res.data.currency || "",
              billingCycle: res.data.billingCycle || "",
              discountPercent: res.data.discountPercent?.toString() || "",
              taxRate: res.data.taxRate?.toString() || "",
              lastUsageAudit: res.data.lastUsageAudit
                ? new Date(res.data.lastUsageAudit)
                : undefined,
              utilizationRate: res.data.utilizationRate?.toString() || "",
              costCenter: res.data.costCenter || "",
              budgetCode: res.data.budgetCode || "",
              departmentId:
                res.data.departmentId ||
                (departments && departments.length > 0
                  ? departments[0].id
                  : ""),
            });
          }
        })
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUpdate, licenseId, departments]);

  // Submit handler
  async function onSubmit(data: LicenseFormValues) {
    console.log("SUBMIT HANDLER CALLED", data);
    if (isUpdate && licenseId) {
      // Update mode
      console.log("Calling updateLicense", { licenseId, data });
      await updateLicense(licenseId, data, {
        onSuccess: () => {
          refresh();
          if (onSuccess) onSuccess();
          toast.dismiss();
          toast.success("License updated successfully!");
        },
        onError: (error: Error) => {
          toast.dismiss();
          toast.error("Failed to update license");
          console.error("Error updating license:", error);
        },
      });
    } else {
      // Create mode
      startTransition(async () => {
        try {
          await createLicense(data, {
            onSuccess: (createdLicense: any) => {
              refresh();
              const newId = createdLicense?.data?.id;
              if (newId) {
                setCreatedLicenseId(newId);
                setDialogOpen(true);
              }
              toast.dismiss();
              toast.success("License created! You can now upload files.");
            },
            onError: (error: Error) => {
              toast.dismiss();
              toast.error("Failed to create license");
              console.error("Error creating a License:", error);
            },
          });
        } catch (error) {
          toast.dismiss();
          toast.error("An unexpected error occurred");
          console.error(error);
        }
      });
    }
  }

  // Watch form values for progress tracking
  const watchedValues = useWatch({
    control: form.control,
    name: [
      "licenseName",
      "statusLabelId",
      "locationId",
      "seats",
      "minSeatsAlert",
      "licensedEmail",
      "alertRenewalDays",
      "purchaseDate",
      "poNumber",
      "purchasePrice",
      "monthlyPrice",
      "annualPrice",
      "costCenter",
      "budgetCode",
      "departmentId",
      "inventoryId",
    ],
  });

  const [
    licenseName,
    statusLabelId,
    locationId,
    seats,
    minSeatsAlert,
    licensedEmail,
    alertRenewalDays,
    purchaseDate,
    poNumber,
    purchasePrice,
    monthlyPrice,
    annualPrice,
    costCenter,
    budgetCode,
    departmentId,
    inventoryId,
  ] = watchedValues;

  const progressFormSection = [
    {
      name: "Basic Information",
      status: (licenseName ? "complete" : "incomplete") as SectionStatus,
    },
    {
      name: "Status & Location",
      status: (statusLabelId && locationId
        ? "complete"
        : "incomplete") as SectionStatus,
    },

    {
      name: "Department & Inventory",
      status: (departmentId && inventoryId
        ? "complete"
        : "incomplete") as SectionStatus,
    },
    {
      name: "License Management",
      status: (seats && minSeatsAlert
        ? "complete"
        : "incomplete") as SectionStatus,
    },
    {
      name: "Notifications",
      status: (licensedEmail && alertRenewalDays
        ? "complete"
        : "incomplete") as SectionStatus,
    },
    {
      name: "Purchase Information",
      status: (purchaseDate || poNumber
        ? "complete"
        : "incomplete") as SectionStatus,
    },
    {
      name: "Pricing Information",
      status: (purchasePrice || monthlyPrice || annualPrice
        ? "complete"
        : "incomplete") as SectionStatus,
    },
    {
      name: "Cost Management",
      status: (costCenter || budgetCode
        ? "complete"
        : "incomplete") as SectionStatus,
    },
    {
      name: "Attachments",
      status: (file ? "complete" : "incomplete") as SectionStatus,
    },
  ];

  return (
    <FormContainer
      form={form}
      requiredFields={isUpdate ? [] : [
        "licenseName",
        "seats", 
        "minSeatsAlert",
        "licensedEmail",
        "statusLabelId",
        "alertRenewalDays",
        "departmentId",
        "inventoryId", 
        "locationId"
      ]}
      requiredFieldsCount={isUpdate ? 0 : 9}
      hideProgress={isUpdate}
    >
      <Form {...form}>
        <form id="license-form" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="max-w-[1200px] mx-auto px-4 py-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Main Form Content */}
              {isPending || (isUpdate && loading) ? (
                isUpdate ? (
                  <div className="col-span-12 mt-6">
                    <MainFormSkeleton />
                  </div>
                ) : (
                  <MainFormSkeleton />
                )
              ) : (
                <div
                  className={
                    isUpdate
                      ? "col-span-12"
                      : "col-span-12 lg:col-span-8 space-y-6"
                  }
                >
                  <PurchaseOrderDialog />
                  {/* License Information - Always Visible */}
                  <Card className={"bg-white"}>
                    <CardContent className="divide-y divide-slate-100">
                      <FormSection title="Basic Information">
                        <CustomInput
                          name="licenseName"
                          label="License Name"
                          control={form.control}
                          placeholder="e.g. Adobe Creative Cloud"
                          required
                        />
                      </FormSection>

                      {/* Status & Location */}
                      <FormSection title="Status & Location">
                        <div className="space-y-6">
                          {statusLocationSection.map((section, index) => (
                            <SelectWithButton key={index} {...section} />
                          ))}
                        </div>
                      </FormSection>

                      {/* License Management */}
                      <FormSection title="License Management">
                        <div className="grid grid-cols-2 gap-6">
                          <CustomInput
                            name="seats"
                            label="Total Seats"
                            control={form.control}
                            type="number"
                            placeholder="Enter total licenses"
                            required
                          />
                          <CustomInput
                            name="minSeatsAlert"
                            label="Minimum License Alert"
                            control={form.control}
                            type="number"
                            placeholder="Enter minimum threshold"
                            required
                          />
                        </div>
                      </FormSection>
                      {/* Notifications */}
                      <FormSection title="Notifications">
                        <div className="grid grid-cols-2 gap-6">
                          <CustomInput
                            name="licensedEmail"
                            label="Licensed Email"
                            control={form.control}
                            type="email"
                            placeholder="Enter email for notifications"
                            required
                          />
                          <CustomInput
                            name="alertRenewalDays"
                            label="Alert Days Before Renewal"
                            control={form.control}
                            type="number"
                            placeholder="e.g. 30"
                            required
                          />
                        </div>
                      </FormSection>

                      {/* Purchase Information */}
                      <FormSection title="Purchase Information">
                        <div className="grid grid-cols-2 gap-6">
                          <CustomDatePicker
                            name="purchaseDate"
                            form={form}
                            label="Purchase Date"
                            placeholder="Select purchase date"
                          />
                          <CustomDatePicker
                            name="renewalDate"
                            form={form}
                            label="Renewal Date"
                            placeholder="Select renewal date"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <SelectWithButton
                            name="poNumber"
                            form={form}
                            label="Purchase Order"
                            data={purchaseOrders.map((po) => ({
                              id: po.poNumber,
                              name: po.poNumber,
                            }))}
                            onNew={openPurchaseOrder}
                            placeholder="Select a PO"
                            isPending={isPending}
                          />
                          <SelectWithButton
                            name="supplierId"
                            label="Supplier"
                            form={form}
                            onNew={openSupplier}
                            data={suppliers}
                            placeholder="Select supplier"
                            isPending={isPending}
                          />
                        </div>
                      </FormSection>

                      {/* Pricing Information */}
                      <FormSection title="Pricing Information">
                        <div className="grid grid-cols-3 gap-6">
                          <CustomPriceInput
                            name="purchasePrice"
                            label="Purchase Price"
                            control={form.control}
                            placeholder="0.00"
                          />
                          <CustomPriceInput
                            name="renewalPrice"
                            label="Renewal Price"
                            control={form.control}
                            placeholder="0.00"
                          />
                          <CustomCurrencySelect
                            name="currency"
                            label="Currency"
                            form={form}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                          <CustomPriceInput
                            name="monthlyPrice"
                            label="Monthly Price"
                            control={form.control}
                            placeholder="0.00"
                          />
                          <CustomPriceInput
                            name="annualPrice"
                            label="Annual Price"
                            control={form.control}
                            placeholder="0.00"
                          />
                          <CustomPriceInput
                            name="pricePerSeat"
                            label="Price Per Seat"
                            control={form.control}
                            placeholder="0.00"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <FormField
                              control={form.control}
                              name="billingCycle"
                              render={({ field }) => (
                                <div>
                                  <FormLabel>Billing Cycle</FormLabel>
                                  <FormControl>
                                    <Select
                                      onValueChange={field.onChange}
                                      value={field.value}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select billing cycle" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="monthly">
                                          Monthly
                                        </SelectItem>
                                        <SelectItem value="annual">
                                          Annual
                                        </SelectItem>
                                        <SelectItem value="one-time">
                                          One-time
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </div>
                              )}
                            />
                          </div>
                          <CustomInput
                            name="discountPercent"
                            label="Discount (%)"
                            control={form.control}
                            type="number"
                            placeholder="0"
                          />
                          <CustomInput
                            name="taxRate"
                            label="Tax Rate (%)"
                            control={form.control}
                            type="number"
                            placeholder="0"
                          />
                        </div>
                      </FormSection>

                      {/* Cost Management */}
                      <FormSection title="Cost Management">
                        <div className="grid grid-cols-3 gap-6">
                          <CustomInput
                            name="costCenter"
                            label="Cost Center"
                            control={form.control}
                            placeholder="Enter cost center"
                          />
                          <CustomInput
                            name="budgetCode"
                            label="Budget Code"
                            control={form.control}
                            placeholder="Enter budget code"
                          />
                          <CustomDatePicker
                            name="lastUsageAudit"
                            form={form}
                            label="Last Usage Audit"
                            placeholder="Select audit date"
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                          <CustomInput
                            name="utilizationRate"
                            label="Utilization Rate (0-1)"
                            control={form.control}
                            type="number"
                            placeholder="0.75"
                          />
                        </div>
                      </FormSection>
                    </CardContent>
                  </Card>

                  {/* Attachments */}
                  {createdLicenseId && (
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogContent>
                        <DialogTitle>Upload License Files</DialogTitle>
                        <Dropzone
                          onDrop={handleDrop}
                          accept={{
                            "application/pdf": [".pdf"],
                            "application/msword": [".doc"],
                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                              [".docx"],
                            "image/png": [".png"],
                            "image/jpeg": [".jpg", ".jpeg"],
                          }}
                          multiple={true}
                        />
                        <div className="mt-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Selected files:</span>
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm">
                              {selectedFiles.length}
                            </span>
                          </div>
                          {selectedFiles.length > 0 && (
                            <ul className="mt-2 space-y-1">
                              {selectedFiles.map((file, idx) => (
                                <li
                                  key={file.name + idx}
                                  className="flex items-center gap-2 text-sm"
                                >
                                  <span>{file.name}</span>
                                  <button
                                    type="button"
                                    className="text-red-500 hover:underline"
                                    onClick={() =>
                                      setSelectedFiles(
                                        selectedFiles.filter(
                                          (_, i) => i !== idx,
                                        ),
                                      )
                                    }
                                  >
                                    Remove
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div className="mt-6">
                          <div className="font-medium mb-2">
                            Uploaded Files:
                          </div>
                          <ul>
                            {uploadedFiles.map((file) => (
                              <li
                                key={file.id ?? file.fileName}
                                className="flex items-center gap-2"
                              >
                                <span>{file.fileName ?? "Unnamed file"}</span>
                                {file.id && (
                                  <button
                                    type="button"
                                    onClick={() => handleDownload(file.id)}
                                  >
                                    Download
                                  </button>
                                )}
                                {file.id && (
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(file.id)}
                                  >
                                    Delete
                                  </button>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex justify-end mt-6">
                          <Button
                            onClick={async () => {
                              if (selectedFiles.length > 0) {
                                await handleBatchUpload();
                              }
                              setDialogOpen(false);
                            }}
                            disabled={uploading}
                          >
                            {uploading ? "Uploading..." : "Done"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              )}
              {/* Right Sidebar - Form Progress */}
              {!isUpdate &&
                (isPending || (isUpdate && loading) ? (
                  <FormProgressSkeleton />
                ) : (
                  <FormProgress sections={progressFormSection} />
                ))}
            </div>
          </div>

          {/* Action Footer */}
          {isUpdate ? (
            <div className="max-w-[1200px] mx-auto px-4 py-6">
              <div className="flex justify-end gap-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="min-w-[120px]"
                >
                  {isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          ) : (
            <ActionFooter form={form} isPending={isPending} router={router} />
          )}
        </form>
      </Form>
    </FormContainer>
  );
};

export default LicenseForm;
