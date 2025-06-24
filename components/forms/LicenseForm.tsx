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
import { useSupplierQuery } from "@/hooks/queries/useSupplierQuery";
import { useInventoryQuery } from "@/hooks/queries/useInventoryQuery";
import { useLocationUIStore } from "@/lib/stores/useLocationUIStore";
import { useLocationQuery } from "@/hooks/queries/useLocationQuery";

// UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { FormProgress } from "@/components/forms/FormProgress";
import {
  getRequiredFieldCount,
  getRequiredFieldsList,
} from "@/lib/schemas/schema-utils";
import { getStatusLocationSection } from "@/components/forms/formSections";
import { useSupplierUIStore } from "@/lib/stores/useSupplierUIStore";

type LicenseFormValues = z.infer<typeof licenseSchema>;

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
  const { onOpen: openStatus } = useStatusLabelUIStore();
  const { statusLabels } = useStatusLabelsQuery();
  const { createLicense } = useLicenseQuery();
  const { onOpen: openDepartment } = useDepartmentUIStore();
  const { departments } = useDepartmentQuery();
  const { suppliers } = useSupplierQuery();
  const { inventories } = useInventoryQuery();
  const { locations } = useLocationQuery();
  const { onOpen: openInventory } = useInventoryUIStore();
  const { onOpen: openLocation } = useLocationUIStore();
  const { onOpen: openSupplier } = useSupplierUIStore();

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

      alertRenewalDays: "",
      notes: "",
    },
  });

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

  // Submit handler
  async function onSubmit(data: LicenseFormValues) {
    startTransition(async () => {
      try {
        await createLicense(data, {
          onSuccess: () => {
            form.reset();
            router.push("/licenses");
          },
          onError: (error) => {
            console.error("Error creating a License:", error);
          },
        });
      } catch (error) {
        toast.error("An unexpected error occurred");
        console.error(error);
      }
    });
  }

  //
  const progressFormSection = [
    {
      name: "Basic Information",
      isValid: !!form.watch("licenseName"),
    },
    {
      name: "Status & Location",
      isValid: !!form.watch("statusLabelId") && !!form.watch("locationId"),
    },
    {
      name: "License Management",
      isValid: !!form.watch("seats") && !!form.watch("minSeatsAlert"),
    },
    {
      name: "Notifications",
      isValid:
        !!form.watch("licensedEmail") && !!form.watch("alertRenewalDays"),
    },
    {
      name: "Purchase Information",
      isValid: !!form.watch("purchaseDate") || !!form.watch("poNumber"),
    },
    {
      name: "Pricing Information",
      isValid: !!form.watch("purchasePrice") || !!form.watch("monthlyPrice") || !!form.watch("annualPrice"),
    },
    {
      name: "Cost Management",
      isValid: !!form.watch("costCenter") || !!form.watch("budgetCode"),
    },
    {
      name: "Attachments",
      isValid: !!file,
    },
  ];

  return (
    <FormContainer
      form={form}
      requiredFields={getRequiredFieldsList(licenseSchema)}
      requiredFieldsCount={getRequiredFieldCount(licenseSchema)}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="max-w-[1200px] mx-auto px-4 py-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Main Form Content */}
              {isPending ? (
                <MainFormSkeleton />
              ) : (
                <div className="col-span-12 lg:col-span-8 space-y-6">
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
                          <CustomInput
                            name="poNumber"
                            label="PO Number"
                            control={form.control}
                            placeholder="Enter purchase order number"
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
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select billing cycle" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="annual">Annual</SelectItem>
                                        <SelectItem value="one-time">One-time</SelectItem>
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
              )}
              {/* Right Sidebar - Form Progress */}
              {isPending ? (
                <FormProgressSkeleton />
              ) : (
                <FormProgress sections={progressFormSection} />
              )}
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
