import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Components
import CustomInput from "@/components/CustomInput";
import CustomSelect from "@/components/CustomSelect";
import { SelectWithButton } from "@/components/SelectWithButton";

// Schema and types
import { assetSchema } from "@/lib/schemas";
import type { z } from "zod";
import type { CustomField, CustomFieldOption } from "@/types/form";

// Hooks and stores
import { useStatusLabelsQuery } from "@/hooks/queries/useStatusLabelsQuery";
import { useModelsQuery } from "@/hooks/queries/useModelsQuery";
import { useDepartmentQuery } from "@/hooks/queries/useDepartmentQuery";
import { useInventoryQuery } from "@/hooks/queries/useInventoryQuery";
import { useSupplierQuery } from "@/hooks/queries/useSupplierQuery";
import { useAssetQuery } from "@/hooks/queries/useAssetQuery";
import { useFormTemplatesQuery } from "@/hooks/queries/useFormTemplatesQuery";
import { useLocationQuery } from "@/hooks/queries/useLocationQuery";

import { useLocationStore } from "@/lib/stores/locationStore";
import { useSupplierUIStore } from "@/lib/stores/useSupplierUIStore";
import { useInventoryUIStore } from "@/lib/stores/useInventoryUIStore";
import { useFormTemplateUIStore } from "@/lib/stores/useFormTemplateUIStore";
import { useStatusLabelUIStore } from "@/lib/stores/useStatusLabelUIStore";
import { useModelUIStore } from "@/lib/stores/useModelUIStore";
import { useDepartmentUIStore } from "@/lib/stores/useDepartmentUIStore";
import CustomDatePicker from "@/components/CustomDatePicker";
import CustomPriceInput from "@/components/CustomPriceInput";
import { FormContainer } from "@/components/forms/FormContainer";
import FormSection from "@/components/forms/FormSection";
import ActionFooter from "@/components/forms/ActionFooter";
import MainFormSkeleton from "@/components/forms/MainFormSkeleton";
import FormProgressSkeleton from "@/components/forms/FormProgressSkeleton";
import { FormProgress } from "@/components/forms/FormProgress";

type FormTemplate = {
  id: string;
  name: string;
  fields: CustomField[];
};

type AssetFormValues = z.infer<typeof assetSchema>;

interface AssetFormProps {
  id?: string;
  isUpdate?: boolean;
}

const AssetForm = ({ id, isUpdate = false }: AssetFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(
    null,
  );

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

  // Store actions
  const { onOpen: openStatus } = useStatusLabelUIStore();
  const { onOpen: openModel } = useModelUIStore();
  const { onOpen: openDepartment } = useDepartmentUIStore();
  const { onOpen: openLocation } = useLocationStore();
  const { onOpen: openInventory } = useInventoryUIStore();
  const { onOpen: openSupplier } = useSupplierUIStore();
  const { onOpen: openTemplate } = useFormTemplateUIStore();

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: "",
      serialNumber: "",
      modelId: "",
      price: 0,
      statusLabelId: "",
      departmentId: "",
      inventoryId: "",
      locationId: "",
      supplierId: "",
      poNumber: "",
      weight: 0,
      material: "",
      energyRating: "",
      licenseId: "",
      dailyOperatingHours: "",
      formTemplateId: "",
      templateValues: {},
    },
    mode: "onChange",
  });

  const renderCustomFields = () => {
    if (!selectedTemplate?.fields?.length) return null;

    return (
      <FormSection title={selectedTemplate.name}>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-full border border-blue-100">
            Custom Category Fields
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {selectedTemplate.fields.map((field: CustomField) => {
            const fieldName = `templateValues.${field.name}`;

            switch (field.type) {
              case "text":
              case "number":
                return (
                  <CustomInput
                    key={field.name}
                    name={fieldName}
                    label={field.label}
                    control={form.control}
                    required={field.required}
                    type={field.type}
                    placeholder={
                      field.placeholder || `Enter ${field.label.toLowerCase()}`
                    }
                  />
                );
              case "select":
                const options: CustomFieldOption[] =
                  field.options?.map((option) => ({
                    id: option,
                    name: option,
                  })) || [];
                return (
                  <CustomSelect
                    key={field.name}
                    name={fieldName}
                    label={field.label}
                    control={form.control}
                    required={field.required}
                    data={options}
                    placeholder={`Select ${field.label.toLowerCase()}`}
                  />
                );
              default:
                return null;
            }
          })}
        </div>
      </FormSection>
    );
  };

  const handleTemplateChange = (formTemplateId: string) => {
    if (!formTemplateId) {
      form.setValue("formTemplateId", "");
      form.setValue("templateValues", {});
      setSelectedTemplate(null);
      return;
    }

    const template = formTemplates.find((t) => t.id === formTemplateId);
    if (!template?.fields) {
      toast.error("Template not found or invalid");
      return;
    }

    form.setValue("formTemplateId", formTemplateId);
    setSelectedTemplate(template);

    const emptyValues = template.fields.reduce(
      (acc, field) => ({
        ...acc,
        [field.name]: "",
      }),
      {},
    );

    form.setValue("templateValues", emptyValues);
  };

  const onSubmit = (data: AssetFormValues) => {
    startTransition(async () => {
      try {
        await createAsset(
          {
            ...data,
            purchaseDate: data.purchaseDate,
            endOfLife: data.endOfLife,
            weight: data.weight,
            ...(data.formTemplateId
              ? {
                  formTemplateId: data.formTemplateId,
                  templateValues: data.templateValues,
                }
              : {}),
          },
          {
            onSuccess: () => {
              toast.success("Asset created successfully");
              router.push("/assets");
            },
            onError: (error) => {
              toast.error("Failed to create asset: " + error);
            },
          },
        );
      } catch (error) {
        toast.error("An unexpected error occurred");
        console.error(error);
      }
    });
  };

  return (
    <FormContainer form={form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="max-w-[1200px] mx-auto px-4 py-6">
            <div className="grid grid-cols-12 gap-6">
              {isPending ? (
                <MainFormSkeleton />
              ) : (
                <>
                  <div className="col-span-12 lg:col-span-8 space-y-6">
                    {/* Main Form Card */}
                    <Card className={"bg-white"}>
                      <CardContent className="divide-y divide-slate-100">
                        {/* Basic Information */}
                        <FormSection title="Basic Information">
                          <SelectWithButton
                            name="formTemplateId"
                            label="Category Template"
                            data={formTemplates}
                            onNew={openTemplate}
                            placeholder="Select a template"
                            form={form}
                            isPending={isPending}
                            onChange={handleTemplateChange}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <CustomInput
                              required
                              name="name"
                              label="Asset Name"
                              control={form.control}
                              placeholder="Enter asset name"
                            />
                            <CustomInput
                              required
                              name="serialNumber"
                              label="Tag Number"
                              control={form.control}
                              placeholder="Enter tag number"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SelectWithButton
                              name="modelId"
                              form={form}
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
                              placeholder="Enter license ID"
                            />
                          </div>
                        </FormSection>

                        {/* Status & Location */}

                        <FormSection title="Status & Location">
                          <div className="space-y-6">
                            <SelectWithButton
                              name="statusLabelId"
                              form={form}
                              isPending={isLoadingStatusLabels}
                              label="Status"
                              data={statusLabels}
                              onNew={openStatus}
                              placeholder="Select status"
                              required
                            />
                            <SelectWithButton
                              form={form}
                              name="departmentId"
                              label="Department"
                              data={departments}
                              onNew={openDepartment}
                              placeholder="Select department"
                              required
                            />
                            <SelectWithButton
                              form={form}
                              name="locationId"
                              label="Location"
                              data={locations}
                              onNew={openLocation}
                              placeholder="Select location"
                              required
                            />
                          </div>
                        </FormSection>

                        {/* Purchase Information */}

                        <FormSection title="Purchase Information">
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
                                label="Purchase Date"
                                placeholder="Select date"
                                required
                              />
                              <CustomDatePicker
                                name="endOfLife"
                                form={form}
                                label="End of Life"
                                placeholder="Select end of life"
                                required
                                tooltip="Expected end of life date"
                                minDate={new Date(2001, 0, 1)}
                                maxDate={new Date(2100, 0, 1)}
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
                            />
                            <SelectWithButton
                              form={form}
                              name="inventoryId"
                              label="Inventory"
                              data={inventories}
                              onNew={openInventory}
                              placeholder="Select inventory"
                              required
                            />
                          </div>
                        </FormSection>

                        {/* Technical Details - Combined Physical & Energy */}
                        <FormSection title="Technical Details">
                          <div className="space-y-6">
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
                                type="number"
                                placeholder="Enter weight"
                              />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <CustomInput
                                name="energyRating"
                                label="Energy Rating (kW)"
                                control={form.control}
                                placeholder="Enter energy rating"
                              />
                              <CustomInput
                                name="dailyOperatingHours"
                                label="Operating Hours"
                                control={form.control}
                                type="number"
                                placeholder="Hours per day"
                              />
                            </div>
                          </div>
                        </FormSection>
                        {selectedTemplate && <> {renderCustomFields()}</>}
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}

              {isPending ? (
                <FormProgressSkeleton />
              ) : (
                <FormProgress
                  sections={[
                    {
                      name: "Basic Information",
                      isValid:
                        !!form.watch("name") &&
                        !!form.watch("serialNumber") &&
                        !!form.watch("modelId") &&
                        !!form.watch("formTemplateId"),
                    },
                    {
                      name: "Status & Location",
                      isValid:
                        !!form.watch("statusLabelId") &&
                        !!form.watch("locationId") &&
                        !!form.watch("departmentId"),
                    },
                    {
                      name: "Purchase Information",
                      isValid: !!form.watch("price"),
                    },
                    {
                      name: "Technical Details",
                      isValid:
                        !!form.watch("energyRating") &&
                        !!form.watch("dailyOperatingHours") &&
                        !!form.watch("weight") &&
                        !!form.watch("material"),
                    },
                  ]}
                />
              )}
            </div>
          </div>

          {/* Footer */}
          <ActionFooter form={form} isPending={isPending} router={router} />
        </form>
      </Form>
    </FormContainer>
  );
};

export default AssetForm;
