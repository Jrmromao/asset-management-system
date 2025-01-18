import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Components
import CustomInput from "@/components/CustomInput";
import CustomSelect from "@/components/CustomSelect";
import CustomDatePicker from "@/components/CustomDatePicker";
import CustomPriceInput from "@/components/CustomPriceInput";
import { SelectWithButton } from "@/components/SelectWithButton";
import { ModalManager } from "@/components/ModalManager";

// Schema and types
import { assetSchema } from "@/lib/schemas";
import type { z } from "zod";
import type { CustomField, CustomFieldOption } from "@/types/form";

// Hooks and stores
import { useFormModals } from "@/hooks/useFormModals";
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
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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

const FormSection = ({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`space-y-4 ${className}`}>
    <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
    <div className="space-y-6">{children}</div>
  </div>
);

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
  });

  const renderCustomFields = () => {
    if (!selectedTemplate?.fields?.length) return null;

    return (
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
    <div className="min-h-screen bg-slate-50">
      <ModalManager modals={useFormModals(form)} />
      <ProgressIndicator form={form} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="max-w-[1000px] mx-auto px-4 py-6 space-y-6">
            {/* Template Selection */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Asset Category
                </CardTitle>
                <CardDescription>
                  Select a category to determine additional fields
                </CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            {/* Main Form */}
            <Card className="bg-white shadow-sm divide-y divide-slate-100">
              <CardContent className="p-6">
                {/* Basic Information */}
                <FormSection title="Basic Information">
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
                  <SelectWithButton
                    name="modelId"
                    form={form}
                    label="Model"
                    data={models}
                    onNew={openModel}
                    placeholder="Select model"
                    required
                  />
                </FormSection>

                {/* Status & Location */}
                <FormSection title="Status & Location" className="pt-8">
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
                </FormSection>

                {/* Purchase Information */}
                <FormSection title="Purchase Information" className="pt-8">
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
                </FormSection>

                {/* Technical Details */}
                <FormSection title="Technical Details" className="pt-8">
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
                </FormSection>
              </CardContent>
            </Card>

            {/* Template Fields */}
            {selectedTemplate && (
              <Card className="bg-white shadow-sm">
                <CardHeader className="border-b">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl font-semibold">
                      {selectedTemplate.name}
                    </CardTitle>
                    <span className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-full">
                      Category Fields
                    </span>
                  </div>
                  <CardDescription>
                    Additional fields specific to{" "}
                    {selectedTemplate.name.toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {renderCustomFields()}
                </CardContent>
              </Card>
            )}
          </div>
          <div className="sticky bottom-0 right-0 bg-white border-t">
            <div className="max-w-[1000px] mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {form.formState.isDirty && (
                    <span className="text-orange-500 text-sm">
                      • Unsaved changes
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (form.formState.isDirty) {
                        if (
                          window.confirm(
                            "You have unsaved changes. Are you sure you want to leave?",
                          )
                        ) {
                          router.back();
                        }
                      } else {
                        router.back();
                      }
                    }}
                    className="h-9"
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending} className="h-9">
                    {isPending ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{isUpdate ? "Updating..." : "Creating..."}</span>
                      </div>
                    ) : (
                      <span>
                        {isUpdate ? "Update Asset" : "Create Asset"} →
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AssetForm;
