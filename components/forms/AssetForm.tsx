import React, { useCallback, useEffect, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Components
import CustomInput from "@/components/CustomInput";
import { SelectWithButton } from "@/components/SelectWithButton";

// Schema and types
import { assetSchema } from "@/lib/schemas";
import type { z } from "zod";
import type { CustomField } from "@/types/form";

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
import { useInventoryUIStore } from "@/lib/stores/useInventoryUIStore";
import { useFormTemplateUIStore } from "@/lib/stores/useFormTemplateUIStore";
import { useStatusLabelUIStore } from "@/lib/stores/useStatusLabelUIStore";
import { useModelUIStore } from "@/lib/stores/useModelUIStore";
import { useDepartmentUIStore } from "@/lib/stores/useDepartmentUIStore";
import { FormContainer } from "@/components/forms/FormContainer";
import FormSection from "@/components/forms/FormSection";
import ActionFooter from "@/components/forms/ActionFooter";
import MainFormSkeleton from "@/components/forms/MainFormSkeleton";
import FormProgressSkeleton from "@/components/forms/FormProgressSkeleton";
import { FormProgress } from "@/components/forms/FormProgress";
import CustomSelect from "@/components/CustomSelect";

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
  const [specialFieldsValid, setSpecialFieldsValid] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(
    null,
  );
  const [formSections, setFormSections] = useState([
    {
      name: "Asset Category",
      isValid: false,
    },
    {
      name: "Asset Details",
      isValid: false,
    },
    {
      name: "Assignment & Location",
      isValid: false,
    },
    {
      name: "Category-Specific Fields",
      isValid: false,
    },
  ]);

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

  const handleTemplateChange = (formTemplateId: string) => {
    if (!formTemplateId) {
      form.setValue("formTemplateId", "");
      form.setValue("templateValues", {});
      setSelectedTemplate(null);
      setSpecialFieldsValid(false); // Add this line
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
    setSpecialFieldsValid(false); // Add this line
  };
  const renderCustomFields = () => {
    if (!selectedTemplate?.fields?.length) return null;

    return (
      <FormSection title={`${selectedTemplate.name} Details`}>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-full border border-blue-100">
            Additional fields specific to this category
          </span>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              specialFieldsValid
                ? "bg-green-50 text-green-600 border border-green-100"
                : "bg-red-50 text-red-600 border border-red-100"
            }`}
          ></span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {selectedTemplate.fields.map((field: CustomField) => {
            const fieldName = `templateValues.${field.name}`;
            const fieldValue = form.watch(`templateValues.${field.name}`);
            const isFieldValid = field.required
              ? field.type === "number"
                ? !isNaN(Number(fieldValue)) && fieldValue !== ""
                : !!fieldValue && fieldValue !== ""
              : true;

            return (
              <div key={field.name} className="relative">
                {field.type === "text" || field.type === "number" ? (
                  <CustomInput
                    name={fieldName}
                    label={String(field.label)}
                    control={form.control}
                    required={field.required}
                    type={field.type}
                    placeholder={
                      field.placeholder ||
                      `Enter ${String(field.label).toLowerCase()}`
                    }
                  />
                ) : field.type === "select" ? (
                  <CustomSelect
                    name={fieldName}
                    label={String(field.label)}
                    control={form.control}
                    required={field.required}
                    data={
                      field.options?.map((option) => ({
                        id: option,
                        name: option,
                      })) || []
                    }
                    placeholder={`Select ${String(field.label).toLowerCase()}`}
                  />
                ) : null}

                {field.required && (
                  <span
                    className={`absolute -top-1 right-0 text-xs ${
                      isFieldValid ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isFieldValid ? "✓" : "×"}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </FormSection>
    );
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

  const templateValues = useWatch({
    control: form.control,
    name: "templateValues",
  });

  const formValues = useWatch({
    control: form.control,
    name: [
      "formTemplateId",
      "name",
      "serialNumber",
      "modelId",
      "statusLabelId",
      "locationId",
      "departmentId",
      "inventoryId",
    ],
  });

  const validateTemplateFields = useCallback(() => {
    if (!selectedTemplate?.fields?.length) {
      setSpecialFieldsValid(false);
      return;
    }

    const isValid = selectedTemplate.fields.every((field: CustomField) => {
      const value = templateValues?.[field.name];

      if (!field.required) {
        return true;
      }

      switch (field.type) {
        case "text":
          return typeof value === "string" && value.trim() !== "";
        case "number":
          const numValue = Number(value);
          return !isNaN(numValue) && value !== "";
        case "select":
          return !!value && value !== "";
        default:
          return true;
      }
    });

    setSpecialFieldsValid(isValid);
  }, [selectedTemplate?.fields, templateValues]);

  useEffect(() => {
    validateTemplateFields();
  }, [validateTemplateFields, templateValues]);

  useEffect(() => {
    const newSections = [
      {
        name: "Asset Category",
        isValid: !!formValues[0], // formTemplateId
      },
      {
        name: "Asset Details",
        isValid:
          !!formValues[1] && // name
          !!formValues[2] && // serialNumber
          !!formValues[3], // modelId
      },
      {
        name: "Assignment & Location",
        isValid:
          !!formValues[4] && // statusLabelId
          !!formValues[5] && // locationId
          !!formValues[6] && // departmentId
          !!formValues[7], // inventoryId
      },
      {
        name: "Category-Specific Fields",
        isValid: selectedTemplate ? specialFieldsValid : false,
      },
    ];

    setFormSections(newSections);
  }, [formValues, selectedTemplate, specialFieldsValid]);

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
                    <Card className={"bg-white"}>
                      <CardContent className="divide-y divide-slate-100">
                        {/* Asset Category */}
                        <FormSection title="Asset Category">
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
                        </FormSection>

                        {/* Asset Details */}
                        <FormSection title="Asset Details">
                          <CustomInput
                            required
                            name="name"
                            label="Asset Title"
                            control={form.control}
                            placeholder="Enter asset name"
                          />

                          <CustomInput
                            required
                            name="serialNumber"
                            label="Serial Number"
                            control={form.control}
                            placeholder="Enter tag number"
                          />

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

                        {/* Assignment & Location */}
                        <FormSection title="Assignment & Location">
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

                        {/* Category-Specific Fields */}
                        {selectedTemplate && renderCustomFields()}
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}

              {isPending ? (
                <FormProgressSkeleton />
              ) : (
                <FormProgress sections={formSections} />
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
