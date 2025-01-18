"use client";

import React, { useState, useTransition } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, InfoIcon } from "lucide-react";

// Imports from previous component
import { licenseSchema } from "@/lib/schemas";
import { useStatusLabelUIStore } from "@/lib/stores/useStatusLabelUIStore";
import { useStatusLabelsQuery } from "@/hooks/queries/useStatusLabelsQuery";
import { useLicenseQuery } from "@/hooks/queries/useLicenseQuery";
import { useDepartmentUIStore } from "@/lib/stores/useDepartmentUIStore";
import { useDepartmentQuery } from "@/hooks/queries/useDepartmentQuery";
import { useInventoryUIStore } from "@/lib/stores/useInventoryUIStore";
import { useSupplierUIStore } from "@/lib/stores/useSupplierUIStore";
import { useSupplierQuery } from "@/hooks/queries/useSupplierQuery";
import { useInventoryQuery } from "@/hooks/queries/useInventoryQuery";
import { useLocationUIStore } from "@/lib/stores/useLocationUIStore";
import { useLocationQuery } from "@/hooks/queries/useLocationQuery";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SelectWithButton } from "@/components/SelectWithButton";
import CustomInput from "@/components/CustomInput";
import CustomDatePicker from "@/components/CustomDatePicker";
import CustomPriceInput from "@/components/CustomPriceInput";
import Dropzone from "@/components/Dropzone";
import { FormContainer } from "@/components/forms/FormContainer";
import ActionFooter from "@/components/forms/ActionFooter";

type LicenseFormValues = z.infer<typeof licenseSchema>;

// Progress Indicator Component
const ProgressIndicator = ({ form }: { form: any }) => {
  const totalFields = Object.keys(form.getValues()).length;
  const completedFields = Object.keys(form.formState.dirtyFields).length;
  const percentage = (completedFields / totalFields) * 100;

  return (
    <div className="bg-white border-b">
      <div className="max-w-[1000px] mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span
              className={`text-sm font-medium ${form.formState.isValid ? "text-green-600" : "text-yellow-600"}`}
            >
              {form.formState.isValid ? "Ready to submit" : "Form incomplete"}
            </span>
            <span className="text-sm text-slate-500">
              {completedFields} of {totalFields} fields completed
            </span>
          </div>
          <span className="text-sm font-medium text-slate-700">
            {Math.round(percentage)}%
          </span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
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

const LicenseForm = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);

  // State for collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    statusLocation: false,
    licenseManagement: false,
    purchaseInfo: false,
    notifications: false,
    attachments: false,
  });

  // Queries and UI stores
  const { onOpen: openStatusLabel } = useStatusLabelUIStore();
  const { statusLabels } = useStatusLabelsQuery();
  const { createLicense } = useLicenseQuery();
  const { onOpen: openDepartment } = useDepartmentUIStore();
  const { departments } = useDepartmentQuery();
  const { suppliers } = useSupplierQuery();
  const { inventories } = useInventoryQuery();
  const { locations } = useLocationQuery();
  const { onOpen: openInventory } = useInventoryUIStore();
  const { onOpen: openSupplier } = useSupplierUIStore();
  const { onOpen: openLocation } = useLocationUIStore();

  // File drop handler
  const handleDrop = (acceptedFiles: File[]) => {
    const csvFile = acceptedFiles[0];
    setFile(csvFile);
  };

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
      supplierId: "",
      poNumber: "",
      purchasePrice: "",
      alertRenewalDays: "",
      notes: "",
    },
  });

  // Submit handler
  async function onSubmit(data: LicenseFormValues) {
    startTransition(async () => {
      try {
        await createLicense(data, {
          onSuccess: () => {
            form.reset();
            toast.success("License created successfully");
            router.push("/licenses");
          },
          onError: (error) => {
            toast.error("Failed to create license");
            console.error("Error creating a License:", error);
          },
        });
      } catch (error) {
        toast.error("An unexpected error occurred");
        console.error(error);
      }
    });
  }

  return (
    <FormContainer form={form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="max-w-[1200px] mx-auto px-4 py-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Main Form Content */}
              <div className="col-span-12 lg:col-span-8 space-y-6">
                {/* License Information - Always Visible */}
                <Card className="p-6 bg-white">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-800">
                        License Information
                      </h3>
                      <CustomInput
                        name="licenseName"
                        label="License Name"
                        control={form.control}
                        placeholder="e.g. Adobe Creative Cloud"
                        required
                      />
                    </div>
                  </div>
                </Card>

                {/* Status & Location */}
                <CollapsibleSection
                  title="Status & Location"
                  description="Define the current status and location of the license"
                  isExpanded={expandedSections.statusLocation}
                  onToggle={() => toggleSection("statusLocation")}
                  isComplete={
                    !!form.watch("statusLabelId") && !!form.watch("locationId")
                  }
                >
                  <div className="space-y-6">
                    <SelectWithButton
                      name="statusLabelId"
                      form={form}
                      label="Status Label"
                      data={statusLabels}
                      onNew={openStatusLabel}
                      placeholder="Select status"
                      required
                      isPending={isPending}
                    />
                    <SelectWithButton
                      form={form}
                      name="departmentId"
                      label="Department"
                      data={departments}
                      onNew={openDepartment}
                      placeholder="Select department"
                      required
                      isPending={isPending}
                    />
                    <SelectWithButton
                      form={form}
                      name="locationId"
                      label="Location"
                      data={locations}
                      onNew={openLocation}
                      placeholder="Select location"
                      required
                      isPending={isPending}
                    />
                  </div>
                </CollapsibleSection>

                {/* License Management */}
                <CollapsibleSection
                  title="License Management"
                  description="Configure license seats and alerts"
                  isExpanded={expandedSections.licenseManagement}
                  onToggle={() => toggleSection("licenseManagement")}
                  isComplete={
                    !!form.watch("seats") && !!form.watch("minSeatsAlert")
                  }
                >
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
                </CollapsibleSection>

                {/* Purchase Information */}
                <CollapsibleSection
                  title="Purchase Information"
                  description="Details about the license purchase"
                  isExpanded={expandedSections.purchaseInfo}
                  onToggle={() => toggleSection("purchaseInfo")}
                  isComplete={
                    !!form.watch("purchasePrice") && !!form.watch("supplierId")
                  }
                >
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <CustomInput
                        name="poNumber"
                        label="PO Number"
                        control={form.control}
                        placeholder="Enter PO number"
                      />
                      <CustomPriceInput
                        name="purchasePrice"
                        label="Unit Price"
                        control={form.control}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <CustomDatePicker
                        name="purchaseDate"
                        form={form}
                        label="Purchase Date"
                        placeholder="Select date"
                      />
                      <CustomDatePicker
                        name="renewalDate"
                        form={form}
                        label="Renewal Date"
                        placeholder="Select date"
                      />
                    </div>
                    <SelectWithButton
                      name="supplierId"
                      label="Supplier"
                      data={suppliers}
                      onNew={openSupplier}
                      placeholder="Select supplier"
                      required
                      form={form}
                      isPending={isPending}
                    />
                    <SelectWithButton
                      form={form}
                      name="inventoryId"
                      label="Inventory"
                      data={inventories}
                      onNew={openInventory}
                      placeholder="Select an inventory"
                      required
                      isPending={isPending}
                    />
                  </div>
                </CollapsibleSection>

                {/* Notifications */}
                <CollapsibleSection
                  title="Notification Settings"
                  description="Configure email alerts and renewal notifications"
                  isExpanded={expandedSections.notifications}
                  onToggle={() => toggleSection("notifications")}
                  isComplete={
                    !!form.watch("licensedEmail") &&
                    !!form.watch("alertRenewalDays")
                  }
                >
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
                </CollapsibleSection>

                {/* Attachments */}
                <CollapsibleSection
                  title="Attachments"
                  description="Upload license documentation"
                  isExpanded={expandedSections.attachments}
                  onToggle={() => toggleSection("attachments")}
                  isComplete={!!file}
                >
                  <div className="grid grid-cols-2 gap-6">
                    <Dropzone
                      onDrop={handleDrop}
                      accept={{
                        "text/pdf": [".pdf"],
                      }}
                    />
                    <Alert>
                      <InfoIcon className="h-4 w-4" />
                      <AlertTitle>Note</AlertTitle>
                      <AlertDescription>
                        Upload license documentation, terms, or related files
                        (PDF only, max 10 files)
                      </AlertDescription>
                    </Alert>
                  </div>
                </CollapsibleSection>
              </div>

              {/* Right Sidebar - Form Progress */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                <div className="sticky top-[104px]">
                  <Card className="bg-white">
                    <CardHeader className="border-b">
                      <CardTitle className="text-base font-medium">
                        Form Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {[
                          {
                            name: "License Information",
                            isValid: !!form.watch("licenseName"),
                          },
                          {
                            name: "Status & Location",
                            isValid:
                              !!form.watch("statusLabelId") &&
                              !!form.watch("locationId"),
                          },
                          {
                            name: "License Management",
                            isValid:
                              !!form.watch("seats") &&
                              !!form.watch("minSeatsAlert"),
                          },
                          {
                            name: "Purchase Information",
                            isValid:
                              !!form.watch("purchasePrice") &&
                              !!form.watch("supplierId"),
                          },
                          {
                            name: "Notifications",
                            isValid:
                              !!form.watch("licensedEmail") &&
                              !!form.watch("alertRenewalDays"),
                          },
                          {
                            name: "Attachments",
                            isValid: !!file,
                          },
                        ].map((section) => (
                          <div
                            key={section.name}
                            className="flex items-center justify-between py-2 px-3 rounded hover:bg-slate-50"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-1.5 h-1.5 rounded-full ${
                                  section.isValid
                                    ? "bg-green-500"
                                    : "bg-slate-200"
                                }`}
                              />
                              <span className="text-sm text-slate-600">
                                {section.name}
                              </span>
                            </div>
                            {section.isValid && (
                              <div className="h-5 w-5 rounded-full bg-green-50 flex items-center justify-center">
                                <svg
                                  className="h-3 w-3 text-green-500"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <ActionFooter form={form} isPending={isPending} router={router} />
        </form>
      </Form>
    </FormContainer>
  );
};

export default LicenseForm;
