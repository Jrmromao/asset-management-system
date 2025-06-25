import React, { useCallback, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { useAssetQuery } from "@/hooks/queries/useAssetQuery";
import type { CustomField } from "@/types/form";
import { Asset, AssetWithRelations } from "@/types/asset";
import { FormTemplateValue } from "@prisma/client";
import { CreateAssetInput } from "@/lib/actions/assets.actions";
import { debounce } from "lodash";

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
import { getPurchaseOrders } from "@/lib/actions/purchaseOrder.actions";
import { PurchaseOrder } from "@prisma/client";
import { usePurchaseOrderUIStore } from "@/lib/stores/usePurchaseOrderUIStore";
import { PurchaseOrderDialog } from "../dialogs/PurchaseOrderDialog";
import { auth, User } from "@clerk/nextjs/server";
import { useUser } from "@clerk/nextjs";
import { EOLPlan, eolPlanOptions } from "@/constants";
import CustomDatePicker from "../CustomDatePicker";
import { usePurchaseOrderQuery } from "@/hooks/queries/usePurchaseOrderQuery";

type UserWithCompany = User & {
  companyId: string;
};

type FormTemplate = {
  id: string;
  name: string;
  fields: CustomField[];
};

const assetFormSchema = z.object({
  name: z.string().min(2, "Asset name must be at least 2 characters."),
  assetTag: z.string().min(1, "Asset Tag is required."),
  modelId: z.string().min(1, "Model is required."),
  statusLabelId: z.string().min(1, "Status is required."),
  departmentId: z.string().min(1, "Department is required."),
  inventoryId: z.string().min(1, "Inventory is required."),
  locationId: z.string().min(1, "Location is required."),
  formTemplateId: z.string().min(1, "Form template is required."),
  templateValues: z.record(z.string(), z.any()).optional(),
  purchaseOrderId: z.string().optional(),
  notes: z.string().optional(),
  energyConsumption: z.coerce.number().optional(),
  expectedLifespan: z.coerce.number().optional(),
  endOfLifePlan: z.nativeEnum(EOLPlan).optional(),
  supplierId: z.string().optional(),
  warrantyEndDate: z.date().optional(),
});

type AssetFormValues = z.infer<typeof assetFormSchema>;

interface AssetFormProps {
  id?: string;
  isUpdate?: boolean;
}

const useImprovedAssetValidation = (
  type: "assetName" | "assetTag",
  value: string,
  excludeId?: string,
) => {
  const [validationState, setValidationState] = useState<{
    isValidating: boolean;
    isValid: boolean | null;
    error: string | null;
  }>({
    isValidating: false,
    isValid: null,
    error: null,
  });

  const [lastValidatedValue, setLastValidatedValue] = useState<string>("");

  const validate = useCallback(
    debounce(async (inputValue: string) => {
      if (!inputValue.trim() || inputValue.trim().length < 2) {
        setValidationState({
          isValidating: false,
          isValid: null,
          error: null,
        });
        return;
      }

      if (lastValidatedValue === inputValue.trim()) {
        return;
      }

      setValidationState((prev) => ({ ...prev, isValidating: true }));

      try {
        const params = new URLSearchParams({
          type,
          [type === "assetTag" ? "assetTag" : "assetName"]: inputValue.trim(),
        });

        if (excludeId) {
          params.append("excludeId", excludeId);
        }

        const response = await fetch(`/api/validate/assets?${params}`);

        if (!response.ok) {
          throw new Error("Validation failed");
        }

        const result = await response.json();

        setValidationState({
          isValidating: false,
          isValid: result.available,
          error: result.exists ? result.message : null,
        });

        setLastValidatedValue(inputValue.trim());
      } catch (error) {
        setValidationState({
          isValidating: false,
          isValid: null,
          error: "Validation error occurred",
        });
      }
    }, 800),
    [type, excludeId, lastValidatedValue],
  );

  useEffect(() => {
    validate(value);
  }, [value, validate]);

  return validationState;
};

const AssetForm = ({ id, isUpdate = false }: AssetFormProps) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
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
  const { suppliers } = useSupplierQuery();
  const { models } = useModelsQuery();
  const { statusLabels, isLoading: isLoadingStatusLabels } =
    useStatusLabelsQuery();

  const {
    items: assets,
    isLoading,
    createItem: createAsset,
    updateItem: updateAsset,
    findItemById,
    isCreating,
    isUpdating,
  } = useAssetQuery()();

  const { items: purchaseOrders } = usePurchaseOrderQuery()();

  const { formTemplates } = useFormTemplatesQuery();
  const { locations } = useLocationQuery();
  const { departments } = useDepartmentQuery();
  const { inventories } = useInventoryQuery();

  // Store actions
  const { onOpen: openStatus } = useStatusLabelUIStore();
  const { onOpen: openModel } = useModelUIStore();
  const { onOpen: openDepartment } = useDepartmentUIStore();
  const { onOpen: openLocation } = useLocationUIStore();
  const { onOpen: openInventory } = useInventoryUIStore();
  const { onOpen: openTemplate } = useFormTemplateUIStore();
  const { onOpen: openPurchaseOrder } = usePurchaseOrderUIStore();
  const { user } = useUser();

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      name: "",
      assetTag: "",
      modelId: "",
      statusLabelId: "",
      departmentId: "",
      inventoryId: "",
      locationId: "",
      formTemplateId: "",
      templateValues: {},
      purchaseOrderId: "",
      notes: "",
      energyConsumption: undefined,
      expectedLifespan: undefined,
      endOfLifePlan: undefined,
      supplierId: "",
      warrantyEndDate: undefined,
    },
    mode: "onSubmit",
  });

  const assetNameValidation = useImprovedAssetValidation(
    "assetName",
    form.watch("name"),
    isUpdate ? id : undefined,
  );

  const assetTagValidation = useImprovedAssetValidation(
    "assetTag",
    form.watch("assetTag"),
    isUpdate ? id : undefined,
  );

  // Load existing asset data for updates
  useEffect(() => {
    if (!isUpdate || !id || isDataLoaded) return;

    const loadAssetData = async () => {
      try {
        // Use findItemById to get full asset details
        const asset = await findItemById(id);

        if (asset) {
          // Set form values
          form.reset({
            name: asset.name || "",
            assetTag: asset.assetTag || "",
            modelId: asset.modelId || "",
            statusLabelId: asset.statusLabelId || "",
            departmentId: asset.departmentId || "",
            inventoryId: asset.inventoryId || "",
            locationId: asset.departmentLocation?.id || "",
            formTemplateId: asset.formTemplateId || "",
            purchaseOrderId: asset.purchaseOrderId || "",
            templateValues:
              (asset.values?.[0]?.values as Record<string, any>) || {},
            notes: asset.notes || "",
            energyConsumption: asset.energyConsumption
              ? Number(asset.energyConsumption)
              : undefined,
            expectedLifespan: asset.expectedLifespan || undefined,
            endOfLifePlan: (asset.endOfLifePlan as EOLPlan) || undefined,
            supplierId: asset.supplierId || "",
            warrantyEndDate: asset.warrantyEndDate || undefined,
          });

          // Set selected template if exists and validate fields
          if (asset.formTemplateId && formTemplates) {
            const template = formTemplates.find(
              (t) => t.id === asset.formTemplateId,
            );
            if (template) {
              setSelectedTemplate(template as any);
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
  }, [isUpdate, id, isDataLoaded, form, formTemplates, findItemById]);

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
    setSelectedTemplate(template as any);

    // Initialize template values with default values based on field type
    const initialValues = template.fields.reduce<Record<string, any>>(
      (acc, field) => {
        // Keep existing value if it exists and the field type hasn't changed
        const existingValue = form.getValues(`templateValues.${field.name}`);
        const shouldKeepValue =
          existingValue !== undefined &&
          ((typeof existingValue === "number" && field.type === "number") ||
            (typeof existingValue === "boolean" &&
              (field.type === "boolean" || field.type === "checkbox")) ||
            (typeof existingValue === "string" &&
              (field.type === "text" ||
                field.type === "select" ||
                field.type === "date")));

        if (shouldKeepValue) {
          acc[field.name] = existingValue;
          return acc;
        }

        // Otherwise set default value based on type
        let defaultValue;
        switch (field.type) {
          case "number":
            defaultValue = "";
            break;
          case "boolean":
            defaultValue = false;
            break;
          case "select":
            defaultValue = field.options?.[0] || "";
            break;
          case "date":
            defaultValue = "";
            break;
          case "checkbox":
            defaultValue = false;
            break;
          default:
            defaultValue = "";
        }
        acc[field.name] = defaultValue;
        return acc;
      },
      {},
    );

    // Set the template values and trigger form validation
    form.setValue("templateValues", initialValues, {
      shouldValidate: true,
      shouldDirty: true,
    });

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
                  const dependentValue = form.watch(
                    `templateValues.${dependentField}` as const,
                  );
                  return (
                    Array.isArray(allowedValues) &&
                    allowedValues.includes(dependentValue)
                  );
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

  const onSubmit = async (data: AssetFormValues) => {
    try {
      setSubmitting(true);
      toast.loading(id ? "Updating asset..." : "Creating asset...");
      console.log("[FORM_SUBMIT] Initial form data:", data);

      // Validate all required fields
      const requiredFields = [
        "name",
        "assetTag",
        "modelId",
        "statusLabelId",
        "departmentId",
        "inventoryId",
        "locationId",
        "formTemplateId",
      ] as const;

      const missingFields = requiredFields.filter(
        (field) => !data[field as keyof AssetFormValues],
      );

      if (missingFields.length > 0) {
        console.log("[FORM_SUBMIT] Missing fields:", missingFields);
        toast.error(
          `Please fill in all required fields: ${missingFields.join(", ")}`,
        );
        return;
      }

      // Create the asset data object that matches CreateAssetInput type exactly
      const assetData: CreateAssetInput = {
        name: data.name,
        assetTag: data.assetTag,
        modelId: data.modelId,
        statusLabelId: data.statusLabelId,
        departmentId: data.departmentId,
        inventoryId: data.inventoryId,
        locationId: data.locationId,
        formTemplateId: data.formTemplateId,
        templateValues: data.templateValues || {},
        notes: data.notes || "",
        energyConsumption: data.energyConsumption || undefined,
        expectedLifespan: data.expectedLifespan || undefined,
        endOfLifePlan: data.endOfLifePlan || undefined,
        purchaseOrderId: data.purchaseOrderId || undefined,
      };

      console.log("[FORM_SUBMIT] Submitting asset data:", assetData);

      if (id) {
        console.log("[FORM_SUBMIT] Updating asset:", id);
        await updateAsset(id, assetData);
        toast.success("Asset updated successfully!");
      } else {
        console.log("[FORM_SUBMIT] Creating new asset");
        await createAsset(assetData);
        toast.success("Asset created successfully!");
      }

      router.push("/assets");
    } catch (error) {
      console.error("[FORM_SUBMIT] Error:", error);
      toast.dismiss(); // Dismiss loading toast
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(
          (err) => `${err.path.join(".")}: ${err.message}`,
        );
        console.error("[FORM_SUBMIT] Validation errors:", errors);
        toast.error(`Validation errors: ${errors.join(", ")}`);
      } else {
        toast.error("Failed to save asset");
      }
    } finally {
      setSubmitting(false);
    }
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
      "assetTag",
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
          !!formValues[2] && // assetTag
          !!formValues[3] && // modelId
          assetNameValidation.isValid !== false &&
          assetTagValidation.isValid !== false,
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
  }, [
    formValues,
    selectedTemplate,
    specialFieldsValid,
    assetNameValidation.isValid,
    assetTagValidation.isValid,
  ]);

  return (
    <FormContainer
      form={form}
      requiredFields={getRequiredFieldsList(assetFormSchema)}
      requiredFieldsCount={getRequiredFieldCount(assetFormSchema)}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="max-w-[1200px] mx-auto px-4 py-6">
            <PurchaseOrderDialog />
            <div className="grid grid-cols-12 gap-6">
              {isUpdating ? (
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
                            data={formTemplates as any}
                            onNew={openTemplate}
                            placeholder="Select a template"
                            form={form}
                            isPending={isUpdating}
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
                            error={assetNameValidation.error || undefined}
                            isLoading={assetNameValidation.isValidating}
                          />

                          <CustomInput
                            required
                            name="assetTag"
                            label="Asset Tag"
                            control={form.control}
                            placeholder="Enter asset tag"
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                            error={assetTagValidation.error || undefined}
                            isLoading={assetTagValidation.isValidating}
                          />

                          <SelectWithButton
                            name="modelId"
                            form={form}
                            label="Model"
                            data={models as any}
                            onNew={openModel}
                            placeholder="Select model"
                            required
                          />

                          <SelectWithButton
                            name="supplierId"
                            form={form}
                            label="Supplier"
                            data={suppliers as any}
                            onNew={() => {
                              /* open supplier modal */
                            }}
                            placeholder="Select a supplier"
                          />

                          <CustomDatePicker
                            name="warrantyEndDate"
                            label="Warranty End Date"
                            form={form}
                          />

                          <SelectWithButton
                            name="purchaseOrderId"
                            form={form}
                            label="Purchase Order"
                            data={purchaseOrders.map((po) => ({
                              id: po.id,
                              name: po.poNumber,
                            }))}
                            onNew={openPurchaseOrder}
                            placeholder="Select a PO"
                          />
                        </FormSection>

                        {/* Environmental & Lifecycle */}
                        <FormSection title="Environmental & Lifecycle">
                          {/* User guidance message for CO2 accuracy */}
                          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded text-sm">
                            <strong>Tip:</strong> The more technical details you provide (like energy consumption, lifespan, or end-of-life plan), the more accurate your CO2 calculation will be. If any information is missing, we'll use typical values for your asset type/model.
                          </div>
                          <CustomInput
                            name="energyConsumption"
                            label="Energy Consumption (Watts)"
                            control={form.control}
                            type="number"
                            placeholder="e.g. 85"
                          />
                          <CustomInput
                            name="expectedLifespan"
                            label="Expected Lifespan (Years)"
                            control={form.control}
                            type="number"
                            placeholder="e.g. 5"
                          />
                          <CustomSelect
                            name="endOfLifePlan"
                            label="End-of-Life Plan"
                            control={form.control}
                            placeholder="Select a plan"
                            data={eolPlanOptions}
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

              {isUpdating ? (
                <FormProgressSkeleton />
              ) : (
                <FormProgress sections={formSections} />
              )}
            </div>
          </div>

          {/* Footer */}
          <ActionFooter form={form} isPending={submitting} router={router} />
        </form>
      </Form>
    </FormContainer>
  );
};

export default AssetForm;
