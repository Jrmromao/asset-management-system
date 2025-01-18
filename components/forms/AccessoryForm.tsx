"use client";

import React, { useState, useTransition } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, InfoIcon } from "lucide-react";

// Imports from previous component
import { useCategoryUIStore } from "@/lib/stores/useCategoryUIStore";
import { useStatusLabelUIStore } from "@/lib/stores/useStatusLabelUIStore";
import { accessorySchema } from "@/lib/schemas";
import { useStatusLabelsQuery } from "@/hooks/queries/useStatusLabelsQuery";
import { useSupplierQuery } from "@/hooks/queries/useSupplierQuery";
import { useSupplierUIStore } from "@/lib/stores/useSupplierUIStore";
import { useInventoryUIStore } from "@/lib/stores/useInventoryUIStore";
import { useCategoryQuery } from "@/hooks/queries/useCategoryQuery";
import { useDepartmentQuery } from "@/hooks/queries/useDepartmentQuery";
import { useDepartmentUIStore } from "@/lib/stores/useDepartmentUIStore";
import { useLocationUIStore } from "@/lib/stores/useLocationUIStore";
import { useLocationQuery } from "@/hooks/queries/useLocationQuery";
import { useInventoryQuery } from "@/hooks/queries/useInventoryQuery";
import { useAccessoryQuery } from "@/hooks/queries/useAccessoryQuery";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { SelectWithButton } from "@/components/SelectWithButton";
import CustomInput from "@/components/CustomInput";
import CustomDatePicker from "@/components/CustomDatePicker";
import CustomPriceInput from "@/components/CustomPriceInput";
import { FormContainer } from "@/components/forms/FormContainer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ActionFooter from "@/components/forms/ActionFooter";

type AccessoryFormValues = z.infer<typeof accessorySchema>;

// Enhanced CollapsibleSection component
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

// Progress Indicator

const AccessoryForm = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // State for collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    basicInfo: true,
    statusLocation: false,
    purchaseInfo: false,
    inventoryManagement: false,
    notes: false,
  });

  // Queries and UI stores (kept from original implementation)
  const { statusLabels, isLoading: isLoadingStatusLabels } =
    useStatusLabelsQuery();
  const { createAccessory } = useAccessoryQuery();
  const { suppliers } = useSupplierQuery();
  const { inventories } = useInventoryQuery();
  const { categories } = useCategoryQuery();
  const { departments } = useDepartmentQuery();
  const { locations } = useLocationQuery();

  // UI Store Actions
  const { onOpen: openSupplier } = useSupplierUIStore();
  const { onOpen: openInventory } = useInventoryUIStore();
  const { onOpen: openCategory } = useCategoryUIStore();
  const { onOpen: openDepartment } = useDepartmentUIStore();
  const { onOpen: openStatus } = useStatusLabelUIStore();
  const { onOpen: openLocation } = useLocationUIStore();

  // Form setup
  const form = useForm<AccessoryFormValues>({
    resolver: zodResolver(accessorySchema),
    defaultValues: {
      name: "",
      serialNumber: "",
      supplierId: "",
      modelNumber: "",
      locationId: "",
      inventoryId: "",
      poNumber: "",
      alertEmail: "",
      material: "",
      statusLabelId: "",
      notes: "",
      categoryId: "",
    },
  });

  // Section toggle handler
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Submit handler
  const onSubmit = async (data: AccessoryFormValues) => {
    startTransition(async () => {
      try {
        await createAccessory(data, {
          onSuccess: () => {
            form.reset();
            toast.success("Accessory created successfully");
            router.push("/accessories");
          },
          onError: (error) => {
            toast.error("Something went wrong");
            console.error(error);
          },
        });
      } catch (error) {
        toast.error("Something went wrong");
        console.error(error);
      }
    });
  };

  return (
    <FormContainer form={form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Progress Indicator */}
          <div className="max-w-[1200px] mx-auto px-4 py-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Main Form Content */}
              <div className="col-span-12 lg:col-span-8 space-y-6">
                {/* Category Selection */}
                <CollapsibleSection
                  title="Category"
                  description="Select the category for your accessory"
                  isExpanded={expandedSections.category}
                  onToggle={() => toggleSection("category")}
                  isComplete={!!form.watch("categoryId")}
                >
                  <SelectWithButton
                    name="categoryId"
                    label="Category"
                    form={form}
                    required
                    onNew={openCategory}
                    data={categories}
                    placeholder="Select category"
                    isPending={isPending}
                  />
                </CollapsibleSection>

                {/* Basic Information */}
                <CollapsibleSection
                  title="Basic Information"
                  description="Enter fundamental details about the accessory"
                  isExpanded={expandedSections.basicInfo}
                  onToggle={() => toggleSection("basicInfo")}
                  isComplete={
                    !!form.watch("name") && !!form.watch("serialNumber")
                  }
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <CustomInput
                      required
                      name="name"
                      label="Name"
                      control={form.control}
                      type="text"
                    />
                    <CustomInput
                      required
                      name="serialNumber"
                      label="Serial Number"
                      control={form.control}
                      type="text"
                    />
                    <CustomInput
                      name="modelNumber"
                      label="Model Number"
                      control={form.control}
                      type="text"
                      className="md:col-span-2"
                      required
                    />
                  </div>
                </CollapsibleSection>

                {/* More sections in a similar collapsible pattern */}
                <CollapsibleSection
                  title="Status & Location"
                  description="Define the current status and location of the accessory"
                  isExpanded={expandedSections.statusLocation}
                  onToggle={() => toggleSection("statusLocation")}
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-4">
                      <SelectWithButton
                        name="statusLabelId"
                        label="Status"
                        form={form}
                        required
                        onNew={openStatus}
                        data={statusLabels}
                        placeholder="Select status"
                        isPending={isPending}
                      />
                      <SelectWithButton
                        name="departmentId"
                        label="Department"
                        form={form}
                        required
                        onNew={openDepartment}
                        data={departments}
                        placeholder="Select department"
                        isPending={isPending}
                      />
                      <SelectWithButton
                        name="locationId"
                        label="Location"
                        form={form}
                        required
                        onNew={openLocation}
                        data={locations}
                        placeholder="Select location"
                        isPending={isPending}
                      />
                    </div>
                    <div>
                      <CustomInput
                        name="material"
                        label="Material"
                        control={form.control}
                      />
                      <CustomInput
                        name="weight"
                        label="Weight (kg)"
                        control={form.control}
                        type="number"
                        required
                      />
                    </div>
                  </div>
                </CollapsibleSection>

                {/* Purchase Information */}
                <CollapsibleSection
                  title="Purchase Information"
                  description="Details about the accessory's purchase"
                  isExpanded={expandedSections.purchaseInfo}
                  onToggle={() => toggleSection("purchaseInfo")}
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <CustomInput
                      name="poNumber"
                      label="PO Number"
                      control={form.control}
                    />
                    <CustomPriceInput
                      name="price"
                      label="Unit Price"
                      control={form.control}
                      required
                    />
                    <CustomDatePicker
                      name="purchaseDate"
                      form={form}
                      label="Purchase Date"
                    />
                    <CustomDatePicker
                      name="endOfLife"
                      form={form}
                      label="End of Life"
                    />
                    <div className="md:col-span-2">
                      {/*<SelectWithButton*/}
                      {/*    name="supplierId"*/}
                      {/*    label="Supplier"*/}
                      {/*    form={form}*/}
                      {/*    on*/}
                    </div>
                  </div>
                </CollapsibleSection>

                <CollapsibleSection
                  title="Inventory Management"
                  description="Track and manage inventory details"
                  isExpanded={expandedSections.inventoryManagement}
                  onToggle={() => toggleSection("inventoryManagement")}
                >
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <SelectWithButton
                        name="inventoryId"
                        label="Inventory"
                        form={form}
                        required
                        onNew={openInventory}
                        data={inventories}
                        placeholder="Select inventory"
                        isPending={isPending}
                      />
                      <CustomInput
                        name="totalQuantityCount"
                        label="Total Quantity"
                        control={form.control}
                        type="number"
                        required
                      />
                      <CustomInput
                        name="reorderPoint"
                        label="Reorder Point"
                        control={form.control}
                        type="number"
                        required
                      />
                      <CustomInput
                        name="alertEmail"
                        label="Alert Email"
                        control={form.control}
                        type="email"
                        required
                      />
                    </div>
                    <Alert className="h-fit">
                      <InfoIcon className="h-4 w-4" />
                      <AlertTitle>Inventory Alert Settings</AlertTitle>
                      <AlertDescription>
                        System will notify when inventory reaches minimum
                        quantity or reorder point.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CollapsibleSection>

                {/* Notes */}
                <CollapsibleSection
                  title="Additional Information"
                  description="Add any extra notes or comments"
                  isExpanded={expandedSections.notes}
                  onToggle={() => toggleSection("notes")}
                >
                  <CustomInput
                    name="notes"
                    control={form.control}
                    type="textarea"
                    placeholder="Add any additional notes..."
                  />
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
                            name: "Category",
                            isValid: !!form.watch("categoryId"),
                          },
                          {
                            name: "Basic Information",
                            isValid:
                              !!form.watch("name") &&
                              !!form.watch("serialNumber"),
                          },
                          {
                            name: "Status & Location",
                            isValid:
                              !!form.watch("statusLabelId") &&
                              !!form.watch("locationId"),
                          },
                          {
                            name: "Purchase Information",
                            isValid: !!form.watch("price"),
                          },
                          {
                            name: "Inventory Management",
                            isValid: !!form.watch("inventoryId"),
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

          <ActionFooter form={form} isPending={isPending} router={router} />
        </form>
      </Form>
    </FormContainer>
  );
};

export default AccessoryForm;
