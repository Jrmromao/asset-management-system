import React, { useCallback, useEffect, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { Asset } from "@prisma/client";
import { useAssetQuery, type ActionResponse, type CreateAssetInput } from "@/hooks/queries/useAssetQuery";
import type { CustomField } from "@/types/form";

// Components
import CustomInput from "@/components/CustomInput";
import { SelectWithButton } from "@/components/SelectWithButton";

// Schema and types
import { assetSchema } from "@/lib/schemas";

// Hooks and stores
import { useStatusLabelsQuery } from "@/hooks/queries/useStatusLabelsQuery";
import { useModelsQuery } from "@/hooks/queries/useModelsQuery";
import { useDepartmentQuery } from "@/hooks/queries/useDepartmentQuery";
import { useInventoryQuery } from "@/hooks/queries/useInventoryQuery";
import { useSupplierQuery } from "@/hooks/queries/useSupplierQuery";
import { useFormTemplatesQuery } from "@/hooks/queries/useFormTemplatesQuery";
import { useLocationQuery } from "@/hooks/queries/useLocationQuery";
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
import {
  getRequiredFieldCount,
  getRequiredFieldsList,
} from "@/lib/schemas/schema-utils";
import { getStatusLocationSection } from "@/components/forms/formSections";
import { useLocationUIStore } from "@/lib/stores/useLocationUIStore";
import CustomSwitch from "@/components/CustomSwitch";

type FormTemplate = {
  id: string;
  name: string;
  fields: CustomField[];
};

type AssetFormValues = z.infer<typeof assetSchema> & {
  templateValues: Record<string, any>;
};

interface FormTemplateValue {
  values: Record<string, any>;
}

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
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Queries
  const { statusLabels, isLoading: isLoadingStatusLabels } =
    useStatusLabelsQuery();
  const { departments } = useDepartmentQuery();
  const { inventories } = useInventoryQuery();
  const { suppliers } = useSupplierQuery();
  const { createAsset, updateAsset, findItemById, isUpdating } = useAssetQuery();
  const { models } = useModelsQuery();
  const { formTemplates } = useFormTemplatesQuery();
  const { locations } = useLocationQuery();

  // Store actions
  const { onOpen: openStatus } = useStatusLabelUIStore();
  const { onOpen: openModel } = useModelUIStore();
  const { onOpen: openDepartment } = useDepartmentUIStore();
  const { onOpen: openLocation } = useLocationUIStore();
  const { onOpen: openInventory } = useInventoryUIStore();
  const { onOpen: openTemplate } = useFormTemplateUIStore();

  const form = useForm<AssetFormValues>({
    resolver: async (data, context, options) => {
      // Skip unique validation for name and serialNumber when updating
      if (isUpdate) {
        // Create a modified schema without unique checks
        const updateSchema = z.object({
          serialNumber: z.string().min(1, "Serial Number is required"),
          name: z.string().min(1, "Asset name is required"),
          modelId: z.string().min(1, "Model is required"),
          statusLabelId: z.string().min(1, "Status is required"),
          departmentId: z.string().min(1, "Department is required"),
          inventoryId: z.string().min(1, "Inventory is required"),
          locationId: z.string().min(1, "Location is required"),
          formTemplateId: z.string(),
          templateValues: z.record(z.any()).optional(),
          customFields: z.array(z.any()).optional(),
        });
        return zodResolver(updateSchema)(data, context, options);
      }
      // Use original schema with unique checks for create
      return zodResolver(assetSchema)(data, context, options);
    },
    defaultValues: {
      name: "",
      serialNumber: "",
      modelId: "",
      statusLabelId: "",
      departmentId: "",
      inventoryId: "",
      locationId: "",
      formTemplateId: "",
      templateValues: {},
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  // Load existing asset data for updates
  useEffect(() => {
    if (!isUpdate || !id || isDataLoaded || !findItemById) return;

    const loadAssetData = async () => {
      try {
        const asset = await findItemById(id);
        
        if (asset) {
          // Combine all template values into a single object
          const combinedTemplateValues = asset.formTemplateValues?.reduce((acc, curr) => {
            return { ...acc, ...curr.values };
          }, {});

          // Set form values
          form.reset({
            name: asset.name || "",
            serialNumber: asset.serialNumber || "",
            modelId: asset.modelId || "",
            statusLabelId: asset.statusLabelId || "",
            departmentId: asset.departmentId || "",
            inventoryId: asset.inventoryId || "",
            locationId: asset.locationId || "",
            formTemplateId: asset.formTemplate?.id || "",
            templateValues: combinedTemplateValues || {},
          });

          // Set selected template if exists and validate fields
          if (asset.formTemplate?.id && formTemplates) {
            const template = formTemplates.find(t => t.id === asset.formTemplate?.id);
            if (template) {
              setSelectedTemplate(template);
              // Validate the fields after setting the template
              setTimeout(() => {
                validateTemplateFields();
              }, 0);
            }
          }
          setIsDataLoaded(true);
        }
      } catch (error) {
        console.error("Error loading asset data:", error);
        toast.error("Failed to load asset data");
      }
    };

    loadAssetData();
  }, [isUpdate, id, isDataLoaded, findItemById, form, formTemplates]);

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
    isLoading: isLoadingStatusLabels,
  });

  const handleTemplateChange = (formTemplateId: string) => {
    if (!formTemplateId) {
      form.setValue("formTemplateId", "");
      form.setValue("templateValues", {});
      setSelectedTemplate(null);
      setSpecialFieldsValid(false);
      return;
    }

    const template = formTemplates.find((t) => t.id === formTemplateId);
    if (!template?.fields) {
      toast.error("Template not found or invalid");
      return;
    }

    form.setValue("formTemplateId", formTemplateId);
    setSelectedTemplate(template);

    // Initialize template values with default values based on field type
    const initialValues = template.fields.reduce<Record<string, any>>((acc, field) => {
      // Keep existing value if it exists and the field type hasn't changed
      const existingValue = form.getValues(`templateValues.${field.name}`);
      const shouldKeepValue = existingValue !== undefined && 
        ((typeof existingValue === 'number' && field.type === 'number') ||
         (typeof existingValue === 'boolean' && (field.type === 'boolean' || field.type === 'checkbox')) ||
         (typeof existingValue === 'string' && (field.type === 'text' || field.type === 'select' || field.type === 'date')));

      if (shouldKeepValue) {
        acc[field.name] = existingValue;
        return acc;
      }

      // Otherwise set default value based on type
      let defaultValue;
      switch (field.type) {
        case 'number':
          defaultValue = '';
          break;
        case 'boolean':
          defaultValue = false;
          break;
        case 'select':
          defaultValue = field.options?.[0] || '';
          break;
        case 'date':
          defaultValue = '';
          break;
        case 'checkbox':
          defaultValue = false;
          break;
        default:
          defaultValue = '';
      }
      acc[field.name] = defaultValue;
      return acc;
    }, {});

    // Set the template values and trigger form validation
    form.setValue("templateValues", initialValues, { shouldValidate: true, shouldDirty: true });
    
    // Validate fields after a short delay to ensure the form has updated
    setTimeout(() => {
      validateTemplateFields();
    }, 0);
  };

  const renderCustomFields = () => {
    if (!selectedTemplate?.fields?.length) return null;

    return (
      <FormSection title={`${selectedTemplate.name} Details`}>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-full border border-blue-100">
            Additional fields specific to this category
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {selectedTemplate.fields.map((field: CustomField) => {
            // Check if field should be shown based on conditions
            const shouldShowField =
              !field.showIf ||
              Object.entries(field.showIf).every(
                ([dependentField, allowedValues]) => {
                  const dependentValue = form.watch(`templateValues.${dependentField}` as const);
                  return Array.isArray(allowedValues) && allowedValues.includes(dependentValue);
                },
              );

            if (!shouldShowField) return null;

            const fieldName = `templateValues.${field.name}` as const;

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
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
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
                ) : field.type === "boolean" ? (
                  <CustomSwitch
                    name={fieldName}
                    label={String(field.label)}
                    control={form.control}
                    required={field.required}
                  />
                ) : null}
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
        const assetData: CreateAssetInput = {
          name: data.name,
          serialNumber: data.serialNumber,
          modelId: data.modelId,
          statusLabelId: data.statusLabelId,
          departmentId: data.departmentId,
          inventoryId: data.inventoryId,
          locationId: data.locationId,
          formTemplateId: data.formTemplateId,
          templateValues: data.templateValues || {}
        };

        const result = isUpdate && id 
          ? await updateAsset(id, assetData)
          : await createAsset(assetData);

        if (result?.success) {
          router.push("/assets");
        } else {
          // Handle validation errors from server
          if (result?.error?.includes("already exists")) {
            toast.error(result.error);
          } else {
            toast.error(isUpdate ? "Failed to update asset" : "Failed to create asset");
          }
        }
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
    <FormContainer
      form={form}
      requiredFields={getRequiredFieldsList(assetSchema)}
      requiredFieldsCount={getRequiredFieldCount(assetSchema)}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="max-w-[1200px] mx-auto px-4 py-6">
            <div className="grid grid-cols-12 gap-6">
              {isPending || isUpdating ? (
                <MainFormSkeleton />
              ) : (
                <>
                  <div className="col-span-12 lg:col-span-8 space-y-6">
                    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <CardContent className="divide-y divide-slate-100 dark:divide-gray-700">
                        {/* Asset Category */}
                        <FormSection title="Asset Category">
                          <SelectWithButton
                            name="formTemplateId"
                            label="Category Template"
                            data={formTemplates}
                            onNew={openTemplate}
                            placeholder="Select a template"
                            form={form}
                            isPending={isPending || isUpdating}
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
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                          />

                          <CustomInput
                            required
                            name="serialNumber"
                            label="Serial Number"
                            control={form.control}
                            placeholder="Enter tag number"
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
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
                            {statusLocationSection.map((section, index) => (
                              <SelectWithButton key={index} {...section} />
                            ))}
                          </div>
                        </FormSection>

                        {/* Category-Specific Fields */}
                        {selectedTemplate && renderCustomFields()}
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}

              {isPending || isUpdating ? (
                <FormProgressSkeleton />
              ) : (
                <FormProgress sections={formSections} />
              )}
            </div>
          </div>

          {/* Footer */}
          <ActionFooter form={form} isPending={isPending || isUpdating} router={router} />
        </form>
      </Form>
    </FormContainer>
  );
};

export default AssetForm;