import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { useAssetQuery } from "@/hooks/queries/useAssetQuery";
import type { CustomField } from "@/types/form";
import { CreateAssetInput } from "@/lib/actions/assets.actions";
import { debounce } from "lodash";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tag, Briefcase, Building, User, MapPin, Layers, ClipboardEdit, Info, Star, Lock } from "lucide-react";

// Components
import CustomInput from "@/components/CustomInput";
import { ModalManager } from "@/components/ModalManager";
import { useFormModals } from "@/hooks/useFormModals";

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
import { useUser } from "@clerk/nextjs";
import { EOLPlan, eolPlanOptions } from "@/constants";
import CustomDatePicker from "../CustomDatePicker";
import { usePurchaseOrderQuery } from "@/hooks/queries/usePurchaseOrderQuery";
import type { SectionStatus } from "@/components/forms/FormProgress";
import { SelectWithButton } from "../SelectWithButton";

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
  modelId: z.string().optional(),
  statusLabelId: z.string().optional(),
  departmentId: z.string().optional(),
  inventoryId: z.string().optional(),
  locationId: z.string().optional(),
  formTemplateId: z.string().optional(),
  templateValues: z.record(z.string(), z.any()).optional(),
  purchaseOrderId: z.string().optional(),
  notes: z.string().optional(),
  energyConsumption: z.coerce.number().optional(),
  expectedLifespan: z.coerce.number().optional(),
  endOfLifePlan: z.nativeEnum(EOLPlan).optional(),
  supplierId: z.string().optional(),
  warrantyEndDate: z.date().optional(),
  purchaseDate: z.date().optional(),
  purchasePrice: z.coerce.number().optional(),
  depreciationRate: z.coerce.number().optional(),
  currentValue: z.coerce.number().optional(),
  reorderPoint: z.coerce.number().optional(),
  licenseId: z.string().optional(),
  userId: z.string().optional(),
});

type AssetFormValues = z.infer<typeof assetFormSchema>;

interface AssetFormProps {
  id?: string;
  isUpdate?: boolean;
  onSuccess?: () => void;
  onError?: (err: string) => void;
  setLoading?: (loading: boolean) => void;
  setSaving?: (saving: boolean) => void;
  disableRedirect?: boolean;
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

      // No need to check lastValidatedValue here as it's handled by the useEffect dependency
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

        setLastValidatedValue(inputValue.trim()); // Update last validated value on successful validation
      } catch (error) {
        setValidationState({
          isValidating: false,
          isValid: null,
          error: "Validation error occurred",
        });
      }
    }, 800),
    [type, excludeId], // lastValidatedValue is NOT a dependency here, to prevent infinite re-debounces
  );

  useEffect(() => {
    // Only validate if the value has actually changed from the last validated one
    // or if it's the initial empty state that needs to be cleared.
    if (value !== lastValidatedValue) {
      validate(value);
    }
  }, [value, validate, lastValidatedValue]); // Include lastValidatedValue to ensure re-validation on actual value change

  return validationState;
};

const AssetForm = ({ id, isUpdate = false, onSuccess, onError, setLoading, setSaving, disableRedirect = false }: AssetFormProps) => {

  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(
    null,
  );
  const [formSections, setFormSections] = useState<
    { name: string; status: SectionStatus }[]
  >([
    { name: "Asset Category", status: "incomplete" },
    { name: "Asset Details", status: "incomplete" },
    { name: "Assignment & Location", status: "incomplete" },
    { name: "Environmental & Lifecycle", status: "incomplete" },
    { name: "Category-Specific Fields", status: "incomplete" },
  ]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Queries
  const { suppliers } = useSupplierQuery();
  const { models } = useModelsQuery();
  const { statusLabels, isLoading: isLoadingStatusLabels } =
    useStatusLabelsQuery();

  const {
    items: assets,
    createItem: createAsset,
    updateItem: updateAsset,
    findItemById,
    isCreating,
    isUpdating, // This is a specific updating flag from useAssetQuery
  } = useAssetQuery()();

  const { items: purchaseOrders } = usePurchaseOrderQuery()();

  const { formTemplates } = useFormTemplatesQuery(); // Ensure this hook returns a stable array reference
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
      purchaseDate: undefined,
      purchasePrice: undefined,
      depreciationRate: undefined,
      currentValue: undefined,
      reorderPoint: undefined,
      licenseId: "",
      userId: "",
    },
    mode: "onSubmit",
  });

  // Watch form values for validation and progress tracking
  const watchedAssetName = useWatch({
    control: form.control,
    name: "name",
  });

  const watchedAssetTag = useWatch({
    control: form.control,
    name: "assetTag",
  });

  // Watch environmental fields individually for progress tracking
  const watchedEnergyConsumption = useWatch({
    control: form.control,
    name: "energyConsumption",
  });

  const watchedExpectedLifespan = useWatch({
    control: form.control,
    name: "expectedLifespan",
  });

  const watchedEndOfLifePlan = useWatch({
    control: form.control,
    name: "endOfLifePlan",
  });

  const assetNameValidation = useImprovedAssetValidation(
    "assetName",
    watchedAssetName,
    isUpdate ? id : undefined,
  );

  const assetTagValidation = useImprovedAssetValidation(
    "assetTag",
    watchedAssetTag,
    isUpdate ? id : undefined,
  );

  // Load existing asset data for updates
  const [assetDataForUpdate, setAssetDataForUpdate] = useState<any>(null);
  useEffect(() => {
    if (!isUpdate || !id || isDataLoaded) {
      return;
    }

    const loadAssetData = async () => {
      try {
        setLoading?.(true);
        // Use server action instead of direct API call to avoid auth issues
        const asset = await findItemById(id);
        console.log('[AssetForm][Update] Full asset object:', asset);
        // Save asset data in a ref so we can use it after formTemplates load
        setAssetDataForUpdate(asset);
      } catch (error) {
        console.error("Error loading asset data:", error);
        toast.error("Failed to load asset data");
        onError?.("Failed to load asset data");
      } finally {
        setLoading?.(false);
      }
    };
    loadAssetData();
  }, [isUpdate, id, isDataLoaded]);

  // New: Wait for both asset data and formTemplates, then set form state and selectedTemplate
  useEffect(() => {
    if (!isUpdate || !assetDataForUpdate || !formTemplates || formTemplates.length === 0 || isDataLoaded) return;
    const asset = assetDataForUpdate;
    // Prefer nested formTemplate.id, fallback to flat formTemplateId, then formValues[0].templateId
    const formTemplateId =
      asset.formTemplate?.id ||
      asset.formTemplateId ||
      (asset.formValues?.[0]?.templateId ?? "");
    console.log('[AssetForm][Update] asset.formTemplateId (resolved):', formTemplateId);
    console.log('[AssetForm][Update] formTemplates:', formTemplates.map(t => t.id));
    form.reset({
      name: asset.name || "",
      assetTag: asset.assetTag || "",
      modelId: asset.modelId || "",
      statusLabelId: asset.statusLabelId || "",
      departmentId: asset.departmentId || "",
      inventoryId: asset.inventoryId || "",
      locationId: asset.departmentLocation?.id || "",
      formTemplateId: formTemplateId,
      purchaseOrderId: asset.purchaseOrderId || "",
      templateValues: (asset.formValues?.[0]?.values as Record<string, any>) || {},
      notes: asset.notes || "",
      energyConsumption: asset.energyConsumption ? Number(asset.energyConsumption) : undefined,
      expectedLifespan: asset.expectedLifespan || undefined,
      endOfLifePlan: (asset.endOfLifePlan as EOLPlan) || undefined,
      supplierId: asset.supplierId || "",
      warrantyEndDate: asset.warrantyEndDate ? new Date(asset.warrantyEndDate) : undefined,
      purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate) : undefined,
      purchasePrice: asset.purchasePrice !== null && asset.purchasePrice !== undefined ? Number(asset.purchasePrice) : undefined,
      depreciationRate: asset.depreciationRate !== null && asset.depreciationRate !== undefined ? Number(asset.depreciationRate) : undefined,
      currentValue: asset.currentValue !== null && asset.currentValue !== undefined ? Number(asset.currentValue) : undefined,
      reorderPoint: asset.reorderPoint || undefined,
      licenseId: asset.licenseId || undefined,
      userId: asset.userId || undefined,
    });
    if (formTemplateId) {
      const template = formTemplates.find((t) => t.id === formTemplateId);
      console.log('[AssetForm][Update] selectedTemplate:', template);
      if (template) {
        setSelectedTemplate(template as FormTemplate);
        const assetTemplateValues = (asset.formValues?.[0]?.values as Record<string, any>) || {};
        const initialValues = template.fields.reduce<Record<string, any>>((acc, field) => {
          acc[field.name] = assetTemplateValues[field.name] ?? "";
          return acc;
        }, {});
        form.setValue("templateValues", initialValues);
      } else {
        setSelectedTemplate(null);
        form.setValue("templateValues", {});
      }
    } else {
      setSelectedTemplate(null);
      form.setValue("templateValues", {});
    }
    setIsDataLoaded(true);
  }, [isUpdate, assetDataForUpdate, formTemplates, isDataLoaded]);

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
      return;
    }

    const template = formTemplates.find((t) => t.id === formTemplateId);
    if (!template?.fields) {
      toast.error("Template not found or invalid");
      return;
    }

    form.setValue("formTemplateId", formTemplateId);
    setSelectedTemplate(template as FormTemplate);

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
              (field.type === "text" || field.type === "select")) ||
            (existingValue instanceof Date && field.type === "date"));

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
          case "checkbox": // Handle checkbox also as boolean
            defaultValue = false;
            break;
          case "select":
            defaultValue = field.options?.[0] || "";
            break;
          case "date":
            defaultValue = undefined; // Use undefined for date picker to clear the value
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
                  const dependentValue1 = form.watch('templateValues')?.[dependentField];
                  return (
                    Array.isArray(allowedValues) &&
                    allowedValues.includes(dependentValue1)
                  );
                },
              );

            if (!shouldShowField) return null;

            const fieldName = `templateValues.${field.name}` as const;

            return (
              <div key={field.name} className="relative">
                {/* Input component */}
                {field.type === "text" || field.type === "number" ? (
                  <CustomInput
                    name={fieldName}
                    label={field.label}
                    control={form.control}
                    type={field.type === "number" ? "number" : "text"}
                    required={field.required}
                    placeholder={field.placeholder || ""}
                  />
                ) : field.type === "select" ? (
                  <CustomSelect
                    name={fieldName}
                    label={field.label}
                    control={form.control}
                    data={(field.options || []).map(opt => ({ id: opt, name: opt }))}
                    required={field.required}
                    placeholder={field.placeholder || ""}
                  />
                ) : field.type === "date" ? (
                  <CustomDatePicker
                    name={fieldName}
                    label={field.label}
                    form={form}
                    required={field.required}
                    placeholder={field.placeholder || ""}
                  />
                ) : field.type === "boolean" || field.type === "checkbox" ? (
                  <CustomSwitch
                    name={fieldName}
                    label={field.label}
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
    console.log('[AssetForm] onSubmit called', data);
    setSaving?.(true);
    try {
      setSubmitting(true);
      console.log("[FORM_SUBMIT] Initial form data:", data);

      // Validate only required fields specified by the schema for base fields
      const requiredBaseFields = assetFormSchema.pick({
        name: true,
        assetTag: true,
      });

      try {
        requiredBaseFields.parse({
          name: data.name,
          assetTag: data.assetTag,
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          const missingFields = error.errors
            .map((err) => {
              if (err.path[0] === "name") return "Asset Title";
              if (err.path[0] === "assetTag") return "Asset Tag";
              return null;
            })
            .filter(Boolean);
          if (missingFields.length > 0) {
            console.log("[FORM_SUBMIT] Missing fields:", missingFields);
            toast.error(
              `Please fill in all required fields: ${missingFields.join(", ")}`,
            );
            return;
          }
        }
        throw error; // Re-throw if it's not a missing base field error
      }

      // Validate custom template fields if a template is selected
      if (selectedTemplate && selectedTemplate.fields.length > 0) {
        const customFieldsErrors: string[] = [];
        selectedTemplate.fields.forEach((field: CustomField) => {
          // Check if field should be shown based on conditions
          const shouldShowField =
            !field.showIf ||
            Object.entries(field.showIf).every(
              ([dependentField, allowedValues]) => {
                const dependentValue2 = form.watch('templateValues')?.[dependentField];
                return (
                  Array.isArray(allowedValues) &&
                  allowedValues.includes(dependentValue2)
                );
              },
            );

          if (!shouldShowField) return; // Skip validation if field is hidden

          if (field.required) {
            const value = data.templateValues?.[field.name];
            let isValid = false;
            switch (field.type) {
              case "text":
                isValid = typeof value === "string" && value.trim() !== "";
                break;
              case "number":
                const numValue = Number(value);
                isValid = !isNaN(numValue) && value !== "";
                break;
              case "select":
                isValid = !!value && value !== "";
                break;
              case "date":
                isValid = !!value && value instanceof Date;
                break;
              case "boolean":
              case "checkbox":
                isValid = typeof value === "boolean";
                break;
              default:
                isValid = true;
            }
            if (!isValid) {
              customFieldsErrors.push(String(field.label));
            }
          }
        });

        if (customFieldsErrors.length > 0) {
          toast.error(
            `Please fill in all required custom fields: ${customFieldsErrors.join(
              ", ",
            )}`,
          );
          return;
        }
      }

      // Create the asset data object that matches CreateAssetInput type exactly
      const assetData: CreateAssetInput = {
        name: data.name,
        assetTag: data.assetTag,
        modelId: data.modelId || undefined,
        statusLabelId: data.statusLabelId || undefined,
        departmentId: data.departmentId || undefined,
        inventoryId: data.inventoryId || undefined,
        locationId: data.locationId || undefined,
        formTemplateId: data.formTemplateId || undefined,
        templateValues: data.templateValues || {},
        notes: data.notes || "",
        energyConsumption: data.energyConsumption || undefined,
        expectedLifespan: data.expectedLifespan || undefined,
        endOfLifePlan: data.endOfLifePlan || undefined,
        purchaseOrderId: data.purchaseOrderId || undefined,
        supplierId: data.supplierId || undefined,
        warrantyEndDate: data.warrantyEndDate || undefined,
        purchaseDate: data.purchaseDate || undefined,
        purchasePrice: data.purchasePrice || undefined,
        depreciationRate: data.depreciationRate || undefined,
        currentValue: data.currentValue || undefined,
        reorderPoint: data.reorderPoint || undefined,
        licenseId: data.licenseId || undefined,
        userId: data.userId || undefined,
      };

      console.log("[FORM_SUBMIT] Submitting asset data:", assetData);

      if (id) {
        console.log("[FORM_SUBMIT] Updating asset:", id);
        await updateAsset(id, assetData);
        toast.success("Asset updated successfully!");
        onSuccess?.();
        if (!disableRedirect) router.push(`/assets/view/${id}`);
      } else {
        console.log("[FORM_SUBMIT] Creating new asset");
        const newAsset = await createAsset(assetData);
        toast.success("Asset created successfully!");
        onSuccess?.();
        const newId = Array.isArray(newAsset?.data) ? newAsset.data[0]?.id : undefined;
        if (!disableRedirect && newId) {
          router.push(`/assets/view/${newId}`);
        } else if (!disableRedirect) {
          router.push("/assets");
        }
      }
    } catch (error: any) {
      console.error("[FORM_SUBMIT] Error:", error);
      toast.dismiss(); // Dismiss loading toast
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(
          (err) => `${err.path.join(".")}: ${err.message}`,
        );
        console.error("[FORM_SUBMIT] Validation errors:", errors);
        toast.error(`Validation errors: ${errors.join(", ")}`);
      } else {
        toast.error(error.message || "Failed to save asset");
      }
      onError?.(error.message || "Failed to save asset");
    } finally {
      setSubmitting(false);
      setSaving?.(false);
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

  const specialFieldsValid = useMemo(() => {
    if (!selectedTemplate?.fields?.length) return true; // If no template or no fields, consider valid.

    return selectedTemplate.fields.every((field: CustomField) => {
      // Check if field should be shown based on conditions
      const shouldShowField =
        !field.showIf ||
        Object.entries(field.showIf).every(
          ([dependentField, allowedValues]) => {
            const dependentValue1 = form.watch('templateValues')?.[dependentField];
            return (
              Array.isArray(allowedValues) &&
              allowedValues.includes(dependentValue1)
            );
          },
        );

      if (!shouldShowField) return true; // If hidden, it doesn't need to be validated for completion

      const value = form.watch('templateValues')?.[field.name];
      if (!field.required) return true;

      switch (field.type) {
        case "text":
          return typeof value === "string" && value.trim() !== "";
        case "number":
          const numValue = Number(value);
          return !isNaN(numValue) && value !== "";
        case "select":
          return !!value && value !== "";
        case "date":
          return !!value && value instanceof Date; // Ensure it's a Date object
        case "boolean":
        case "checkbox":
          return typeof value === "boolean";
        default:
          return true;
      }
    });
  }, [selectedTemplate?.fields, form.watch('templateValues')]);

  useEffect(() => {
    const templateSelected =
      !!formValues[0] && formTemplates?.some((t) => t.id === formValues[0]);
    const assetNameFilled = !!formValues[1];
    const assetTagFilled = !!formValues[2];
    const assetNameValid = assetNameValidation.isValid === true;
    const assetTagValid = assetTagValidation.isValid === true;

    // Check if any of locationId, departmentId, inventoryId, or statusLabelId are present
    const assignmentLocationComplete =
      !!formValues[5] || !!formValues[6] || !!formValues[7] || !!formValues[4];

    // Environmental section is complete if ALL fields have valid values
    const environmentalComplete =
      !!watchedEnergyConsumption &&
      !!watchedExpectedLifespan &&
      !!watchedEndOfLifePlan;

    const newSections = [
      {
        name: "Asset Category",
        status: (templateSelected ? "complete" : "incomplete") as SectionStatus,
      },
      {
        name: "Asset Details",
        status: (assetNameFilled &&
        assetTagFilled &&
        assetNameValid &&
        assetTagValid
          ? "complete"
          : "incomplete") as SectionStatus,
      },
      {
        name: "Assignment & Location",
        status: (assignmentLocationComplete
          ? "complete"
          : "incomplete") as SectionStatus,
      },
      {
        name: "Environmental & Lifecycle",
        status: (environmentalComplete
          ? "complete"
          : "incomplete") as SectionStatus,
      },
      {
        name: "Category-Specific Fields",
        status: (templateSelected
          ? specialFieldsValid
            ? "complete"
            : "incomplete"
          : "incomplete") as SectionStatus,
      },
    ];

    // Only update if the sections have actually changed to prevent unnecessary re-renders
    // A shallow comparison for simplicity, though a deep comparison might be more robust
    const sectionsChanged =
      newSections.length !== formSections.length ||
      newSections.some(
        (section, index) => section.status !== formSections[index]?.status,
      );

    if (sectionsChanged) {
      setFormSections(newSections);
    }
  }, [
    formValues,
    selectedTemplate,
    specialFieldsValid,
    assetNameValidation.isValid,
    assetTagValidation.isValid,
    formTemplates,
    formSections,
    watchedEnergyConsumption,
    watchedExpectedLifespan,
    watchedEndOfLifePlan,
  ]);

  return (
    <>
      <ModalManager modals={useFormModals(form)} />
      <FormContainer
        form={form}
        requiredFields={getRequiredFieldsList(assetFormSchema)}
        requiredFieldsCount={getRequiredFieldCount(assetFormSchema)}
        hideProgress={isUpdate}
      >
        <Form {...form}>
          <form id="asset-form" onSubmit={form.handleSubmit(onSubmit)}>
            {isUpdate ? (
              <div className="w-full p-4">
                <PurchaseOrderDialog />
                {(!isDataLoaded || isUpdating) && id ? (
                  <MainFormSkeleton />
                ) : (
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
                        <div className="relative">
                          <CustomInput
                            required
                            name={"name"}
                            label="Asset Title"
                            control={form.control}
                            placeholder="Enter asset name"
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                            error={!isUpdate ? assetNameValidation.error ?? undefined : undefined}
                            isLoading={!isUpdate ? assetNameValidation.isValidating : false}
                            disabled={isUpdate}
                          />
                          {isUpdate && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 cursor-default text-muted-foreground">
                                    <Lock className="h-4 w-4" aria-label="Locked" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Asset Title cannot be changed after creation.
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                        <div className="relative">
                          <CustomInput
                            required
                            name={"assetTag"}
                            label="Asset Tag"
                            control={form.control}
                            placeholder="Enter asset tag"
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                            error={!isUpdate ? assetTagValidation.error ?? undefined : undefined}
                            isLoading={!isUpdate ? assetTagValidation.isValidating : false}
                            disabled={isUpdate}
                          />
                          {isUpdate && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 cursor-default text-muted-foreground">
                                    <Lock className="h-4 w-4" aria-label="Locked" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Asset Tag cannot be changed after creation.
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>

                        <SelectWithButton
                          name="modelId"
                          form={form}
                          label="Model"
                          data={models as any}
                          onNew={openModel}
                          placeholder="Select model"
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

                        <CustomInput
                          name="purchasePrice"
                          label="Purchase Price"
                          control={form.control}
                          type="number"
                          placeholder="e.g. 1000"
                        />

                        <CustomInput
                          name="currentValue"
                          label="Current Value"
                          control={form.control}
                          type="number"
                          placeholder="e.g. 800"
                        />

                        <CustomInput
                          name="depreciationRate"
                          label="Depreciation Rate (%)"
                          control={form.control}
                          type="number"
                          placeholder="e.g. 10"
                        />

                        <CustomDatePicker
                          name="purchaseDate"
                          label="Purchase Date"
                          form={form}
                        />
                      </FormSection>

                      {/* Environmental & Lifecycle */}
                      <FormSection title="Environmental & Lifecycle">
                        {/* User guidance message for CO2 accuracy */}
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded text-sm">
                          <strong>Tip:</strong> The more technical details you
                          provide (like energy consumption, lifespan, or
                          end-of-life plan), the more accurate your CO2
                          calculation will be. If any information is missing,
                          we&apos;ll use typical values for your asset
                          type/model.
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
                )}
              </div>
            ) : (
              <div className="max-w-[1200px] mx-auto px-4 py-6">
                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-12 lg:col-span-8 space-y-6">
                    <PurchaseOrderDialog />
                    {isUpdating && id ? (
                      <MainFormSkeleton />
                    ) : (
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
                            <div className="relative">
                              <CustomInput
                                required
                                name={"name"}
                                label="Asset Title"
                                control={form.control}
                                placeholder="Enter asset name"
                                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                                error={!isUpdate ? assetNameValidation.error ?? undefined : undefined}
                                isLoading={!isUpdate ? assetNameValidation.isValidating : false}
                                disabled={isUpdate}
                              />
                              {isUpdate && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="absolute right-3 top-1/2 -translate-y-1/2 cursor-default text-muted-foreground">
                                        <Lock className="h-4 w-4" aria-label="Locked" />
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      Asset Title cannot be changed after creation.
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                            <div className="relative">
                              <CustomInput
                                required
                                name={"assetTag"}
                                label="Asset Tag"
                                control={form.control}
                                placeholder="Enter asset tag"
                                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                                error={!isUpdate ? assetTagValidation.error ?? undefined : undefined}
                                isLoading={!isUpdate ? assetTagValidation.isValidating : false}
                                disabled={isUpdate}
                              />
                              {isUpdate && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="absolute right-3 top-1/2 -translate-y-1/2 cursor-default text-muted-foreground">
                                        <Lock className="h-4 w-4" aria-label="Locked" />
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      Asset Tag cannot be changed after creation.
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>

                            <SelectWithButton
                              name="modelId"
                              form={form}
                              label="Model"
                              data={models as any}
                              onNew={openModel}
                              placeholder="Select model"
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

                            <CustomInput
                              name="purchasePrice"
                              label="Purchase Price"
                              control={form.control}
                              type="number"
                              placeholder="e.g. 1000"
                            />

                            <CustomInput
                              name="currentValue"
                              label="Current Value"
                              control={form.control}
                              type="number"
                              placeholder="e.g. 800"
                            />

                            <CustomInput
                              name="depreciationRate"
                              label="Depreciation Rate (%)"
                              control={form.control}
                              type="number"
                              placeholder="e.g. 10"
                            />

                            <CustomDatePicker
                              name="purchaseDate"
                              label="Purchase Date"
                              form={form}
                            />

                            <CustomInput
                              name="licenseId"
                              label="License ID"
                              control={form.control}
                              placeholder="Enter license ID"
                            />

                            <CustomInput
                              name="userId"
                              label="User ID"
                              control={form.control}
                              placeholder="Enter user ID"
                            />
                          </FormSection>

                          {/* Environmental & Lifecycle */}
                          <FormSection title="Environmental & Lifecycle">
                            {/* User guidance message for CO2 accuracy */}
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded text-sm">
                              <strong>Tip:</strong> The more technical details you
                              provide (like energy consumption, lifespan, or
                              end-of-life plan), the more accurate your CO2
                              calculation will be. If any information is missing,
                              we&apos;ll use typical values for your asset
                              type/model.
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
                    )}
                  </div>
                  {/* Right Sidebar - Form Progress */}
                  <FormProgress sections={formSections} />
                </div>
              </div>
            )}
            {/* Footer */}
            {!isUpdate && (
              <ActionFooter form={form} isPending={submitting} router={router} />
            )}
          </form>
        </Form>
      </FormContainer>
    </>
  );
};

export default AssetForm;
