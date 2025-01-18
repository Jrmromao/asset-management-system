"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Form } from "@/components/ui/form";
import { ModalManager } from "@/components/ModalManager";
import { useFormModals } from "@/hooks/useFormModals";

// Components
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { FormProgress } from "@/components/FormProgress";
import { ActionBar } from "@/components/ActionBar";
import { ProgressHeader } from "@/components/ProgressHeader";
import CustomInput from "@/components/CustomInput";
import CustomSelect from "@/components/CustomSelect";
import CustomDatePicker from "@/components/CustomDatePicker";
import CustomPriceInput from "@/components/CustomPriceInput";
import { SelectWithButton } from "@/components/SelectWithButton";

// Queries
import { useStatusLabelsQuery } from "@/hooks/queries/useStatusLabelsQuery";
import { useDepartmentQuery } from "@/hooks/queries/useDepartmentQuery";
import { useInventoryQuery } from "@/hooks/queries/useInventoryQuery";
import { useSupplierQuery } from "@/hooks/queries/useSupplierQuery";
import { useAssetQuery } from "@/hooks/queries/useAssetQuery";
import { useModelsQuery } from "@/hooks/queries/useModelsQuery";
import { useFormTemplatesQuery } from "@/hooks/queries/useFormTemplatesQuery";
import { useLocationQuery } from "@/hooks/queries/useLocationQuery";

// Store Hooks
import { useLocationStore } from "@/lib/stores/locationStore";
import { useSupplierUIStore } from "@/lib/stores/useSupplierUIStore";
import { useInventoryUIStore } from "@/lib/stores/useInventoryUIStore";
import { useFormTemplateUIStore } from "@/lib/stores/useFormTemplateUIStore";
import { useStatusLabelUIStore } from "@/lib/stores/useStatusLabelUIStore";
import { useModelUIStore } from "@/lib/stores/useModelUIStore";
import { useDepartmentUIStore } from "@/lib/stores/useDepartmentUIStore";

// Types
import type { AssetFormProps } from "@/types/form";

// Custom Hook
import { useAssetForm } from "@/hooks/useAssetForm";

const AssetForm = ({ id, isUpdate = false }: AssetFormProps) => {
  const router = useRouter();

  // Queries
  const { statusLabels, isLoading: isLoadingStatusLabels } =
    useStatusLabelsQuery();
  const { departments } = useDepartmentQuery();
  const { inventories } = useInventoryQuery();
  const { suppliers } = useSupplierQuery();
  const { createAsset } = useAssetQuery();
  const { models } = useModelsQuery();
  const { formTemplates } = useFormTemplatesQuery();
  const { locations } = useLocationQuery();

  // UI Store Actions
  const { onOpen: openStatus } = useStatusLabelUIStore();
  const { onOpen: openModel } = useModelUIStore();
  const { onOpen: openDepartment } = useDepartmentUIStore();
  const { onOpen: openLocation } = useLocationStore();
  const { onOpen: openInventory } = useInventoryUIStore();
  const { onOpen: openSupplier } = useSupplierUIStore();
  const { onOpen: openTemplate } = useFormTemplateUIStore();

  // Form Hook
  const {
    form,
    isPending,
    selectedTemplate,
    expandedSections,
    toggleSection,
    handleTemplateChange,
    onSubmit,
    isSectionComplete,
  } = useAssetForm(isUpdate);

  // Custom Fields Rendering
  const renderCustomFields = () => {
    if (!selectedTemplate) return null;

    return selectedTemplate.fields.map((field) => {
      const fieldName = `templateValues.${field.name}`;

      switch (field.type) {
        case "text":
        case "number":
          return (
            <div key={field.name}>
              <CustomInput
                name={fieldName}
                label={field.label}
                control={form.control}
                required={field.required}
                type={field.type}
                placeholder={
                  field.placeholder || `Enter ${field.label.toLowerCase()}`
                }
              />
            </div>
          );
        case "select":
          const formattedOptions =
            field.options?.map((option: string) => ({
              id: option,
              name: option,
            })) || [];
          return (
            <div key={field.name}>
              <CustomSelect
                name={fieldName}
                label={field.label}
                control={form.control}
                required={field.required}
                data={formattedOptions}
                placeholder={`Select ${field.label.toLowerCase()}`}
              />
            </div>
          );
        default:
          return null;
      }
    });
  };

  const formSections = [
    {
      id: "basic",
      label: "Basic Information",
      description: "Core details about your asset",
      isComplete: isSectionComplete("basic"),
    },
    {
      id: "status",
      label: "Status & Location",
      description: "Current status and placement details",
      isComplete: isSectionComplete("status"),
    },
    {
      id: "purchase",
      label: "Purchase Information",
      description: "Purchase and supplier details",
      isComplete: isSectionComplete("purchase"),
    },
    {
      id: "physical",
      label: "Physical Properties",
      description: "Physical characteristics of the asset",
      isComplete: isSectionComplete("physical"),
    },
    {
      id: "energy",
      label: "Energy Consumption",
      description: "Energy usage details",
      isComplete: isSectionComplete("energy"),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <ModalManager modals={useFormModals(form)} />
      <ProgressHeader form={form} />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit(createAsset))}
          className="max-w-[1200px] mx-auto px-4 py-6 mb-6"
        >
          <div className="grid grid-cols-12 gap-6">
            {/* Main Form Content */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              {/* Basic Information */}
              <CollapsibleSection
                title="Basic Information"
                description="Core details about your asset"
                isExpanded={true}
                onToggle={() => {}}
                isComplete={isSectionComplete("basic")}
              >
                <div className="space-y-6">
                  <SelectWithButton
                    name="formTemplateId"
                    label="Category"
                    data={formTemplates}
                    onNew={openTemplate}
                    placeholder="Select a category template"
                    form={form}
                    isPending={isPending}
                    onChange={(id) => handleTemplateChange(id, formTemplates)}
                    required
                  />

                  <div className="grid grid-cols-2 gap-6">
                    <CustomInput
                      required
                      name="name"
                      label="Asset Name"
                      control={form.control}
                      type="text"
                      placeholder="Enter asset name"
                    />
                    <CustomInput
                      required
                      name="serialNumber"
                      label="Tag Number"
                      control={form.control}
                      type="text"
                      placeholder="Enter tag number"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SelectWithButton
                      name="modelId"
                      form={form}
                      isPending={isPending}
                      label="Model"
                      data={models}
                      onNew={openModel}
                      placeholder="Select model"
                      required
                    />
                    <CustomInput
                      name="licenseId"
                      label="License ID"
                      control={form.control}
                      type="text"
                      placeholder="Enter license ID"
                    />
                  </div>
                </div>
              </CollapsibleSection>

              {/* Status & Location */}
              <CollapsibleSection
                title="Status & Location"
                description="Current status and placement details"
                isExpanded={expandedSections.includes("status")}
                onToggle={(e) => toggleSection(e, "status")}
                isComplete={isSectionComplete("status")}
              >
                <div className="space-y-6">
                  <SelectWithButton
                    name="statusLabelId"
                    form={form}
                    isPending={isLoadingStatusLabels}
                    label="Status Label"
                    data={statusLabels}
                    onNew={openStatus}
                    placeholder="Select status"
                    required
                  />
                  <SelectWithButton
                    form={form}
                    isPending={isPending}
                    name="departmentId"
                    label="Department"
                    data={departments}
                    onNew={openDepartment}
                    placeholder="Select department"
                    required
                  />
                  <SelectWithButton
                    isPending={isPending}
                    form={form}
                    name="locationId"
                    label="Location"
                    data={locations}
                    onNew={openLocation}
                    placeholder="Select location"
                    required
                  />
                </div>
              </CollapsibleSection>

              {/* Purchase Information */}
              <CollapsibleSection
                title="Purchase Information"
                description="Purchase and supplier details"
                isExpanded={expandedSections.includes("purchase")}
                onToggle={(e) => toggleSection(e, "purchase")}
                isComplete={isSectionComplete("purchase")}
              >
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CustomInput
                      name="poNumber"
                      label="PO Number"
                      control={form.control}
                      placeholder="Enter PO number"
                    />
                    <CustomPriceInput
                      name="price"
                      label="Unit Price"
                      control={form.control}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CustomDatePicker
                      name="purchaseDate"
                      form={form}
                      tooltip="Select purchase date"
                      label="Purchase Date"
                      placeholder="Select date"
                    />
                    <CustomDatePicker
                      label="End of Life"
                      name="endOfLife"
                      form={form}
                      placeholder="Select end of life"
                      required
                      tooltip="Select the date your asset will no longer be used"
                      minDate={new Date(2001, 0, 1)}
                      maxDate={new Date(2100, 0, 1)}
                      formatString="dd/MM/yyyy"
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
                    isPending={isPending}
                    name="inventoryId"
                    label="Inventory"
                    data={inventories}
                    onNew={openInventory}
                    placeholder="Select an inventory"
                    required
                  />
                </div>
              </CollapsibleSection>

              {/* Physical Properties */}
              <CollapsibleSection
                title="Physical Properties"
                description="Physical characteristics of the asset"
                isExpanded={expandedSections.includes("physical")}
                onToggle={(e) => toggleSection(e, "physical")}
                isComplete={isSectionComplete("physical")}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CustomInput
                    name="material"
                    label="Material"
                    control={form.control}
                    placeholder="Enter material"
                  />
                  <CustomInput
                    name="weight"
                    label="Weight (kg)"
                    control={form.control}
                    type="text"
                    placeholder="Enter weight"
                  />
                </div>
              </CollapsibleSection>

              {/* Energy Consumption */}
              <CollapsibleSection
                title="Energy Consumption"
                description="Energy usage details"
                isExpanded={expandedSections.includes("energy")}
                onToggle={(e) => toggleSection(e, "energy")}
                isComplete={isSectionComplete("energy")}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CustomInput
                    name="energyRating"
                    label="Energy Rating (kW)"
                    control={form.control}
                    placeholder="Enter energy rating"
                  />
                  <CustomInput
                    name="dailyOperatingHours"
                    label="Operating Hours (per day)"
                    control={form.control}
                    type="number"
                    placeholder="Enter operating hours"
                  />
                </div>
              </CollapsibleSection>

              {/* Custom Template Fields */}
              {selectedTemplate && (
                <CollapsibleSection
                  title="Additional Category Fields"
                  description={`Fields specific to ${selectedTemplate.name}`}
                  isExpanded={expandedSections.includes("template")}
                  onToggle={(e) => toggleSection(e, "template")}
                  isComplete={
                    Object.keys(form.watch("templateValues") || {}).length > 0
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderCustomFields()}
                  </div>
                </CollapsibleSection>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="col-span-12 lg:col-span-4">
              <div className="sticky top-24">
                <FormProgress
                  sections={formSections}
                  expandedSections={expandedSections}
                  toggleSection={toggleSection}
                />
              </div>
            </div>
          </div>
          <ActionBar
            form={form}
            isPending={isPending}
            isUpdate={isUpdate}
            onCancel={() => router.back()}
          />
        </form>
      </Form>
    </div>
  );
};

export default AssetForm;
