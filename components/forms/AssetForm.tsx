"use client";

import React, { useEffect, useState, useTransition } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Components
import CustomInput from "@/components/CustomInput";
import CustomSelect from "@/components/CustomSelect";
import CustomDatePicker from "@/components/CustomDatePicker";

// Forms
// Stores
import { useAssetStore } from "@/lib/stores/assetStore";
import { useLocationStore } from "@/lib/stores/locationStore";
import { useSupplierStore } from "@/lib/stores/useSupplierUIStore";
import { useInventoryStore } from "@/lib/stores/useInventoryUIStore";
import { create } from "@/lib/actions/assets.actions";
import CustomPriceInput from "../CustomPriceInput";
import { SelectWithButton } from "@/components/SelectWithButton";
import { assetSchema } from "@/lib/schemas";
import { useFormTemplateStore } from "@/lib/stores/formTemplateStore";
import { CustomField, CustomFieldOption } from "@/types/form";
import { getFormTemplateById } from "@/lib/actions/formTemplate.actions";
import { useFormModals } from "@/hooks/useFormModals";
import { ModalManager } from "@/components/ModalManager";
import { useStatusLabelsQuery } from "@/hooks/queries/useStatusLabelsQuery";
import { useStatusLabelUIStore } from "@/lib/stores/useStatusLabelUIStore";
import { useModelsQuery } from "@/hooks/queries/useModelsQuery";
import { useModelUIStore } from "@/lib/stores/useModelUIStore";
import { useDepartmentUIStore } from "@/lib/stores/useDepartmentUIStore";
import { useDepartmentQuery } from "@/hooks/queries/useDepartmentQuery";

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
  const { statusLabels, isLoading: isLoadingStatusLabels } =
    useStatusLabelsQuery();
  const { departments } = useDepartmentQuery();

  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);
  const { models } = useModelsQuery();

  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [loadingErrors, setLoadingErrors] = useState<string[]>([]);

  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(
    null,
  );
  const [customFieldValues, setCustomFieldValues] = useState<
    Record<string, any>
  >({});
  // Stores
  const { onOpen: openStatus } = useStatusLabelUIStore();
  const { onOpen: openModel } = useModelUIStore();
  const { onOpen: openDepartment } = useDepartmentUIStore();
  const {
    create: createAsset,
    update: updateAsset,
    findById,
  } = useAssetStore();

  const {
    locations,
    fetchLocations,
    isOpen: isLocationOpen,
    onOpen: openLocation,
    onClose: closeLocation,
  } = useLocationStore();

  const {
    inventories,
    getAll: fetchInventories,
    isOpen: isInventoryOpen,
    onOpen: openInventory,
    onClose: closeInventory,
  } = useInventoryStore();
  const {
    suppliers,
    getAll: fetchSuppliers,
    isOpen: isSupplierOpen,
    onOpen: openSupplier,
    onClose: closeSupplier,
  } = useSupplierStore();

  const {
    isOpen: isTemplateOpen,
    templates,
    fetchTemplates: fetchFormTemplates,
    onOpen: openTemplate,
    onClose: closeTemplate,
  } = useFormTemplateStore();

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

  // Modify your useEffect
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingInitialData(true);
      setLoadingErrors([]);
      const errors: string[] = [];

      try {
        await Promise.all([
          fetchLocations().catch(() => errors.push("Locations")),
          fetchInventories().catch(() => errors.push("Inventories")),
          fetchSuppliers().catch(() => errors.push("Suppliers")),
          fetchFormTemplates().catch(() => errors.push("Form templates")),
        ]);

        if (errors.length > 0) {
          setLoadingErrors(errors);
          toast.error(`Failed to load: ${errors.join(", ")}`);
        }

        if (isUpdate && id) {
          try {
            const asset = await findById(id);
            if (asset) {
              form.reset(asset);
            } else {
              toast.error("Asset not found");
              router.back();
            }
          } catch (error) {
            toast.error("Failed to load asset data");
          }
        }
      } finally {
        setIsLoadingInitialData(false);
      }
    };

    loadInitialData();
  }, []);

  const renderCustomFields = () => {
    if (!selectedTemplate) return null;

    return selectedTemplate.fields.map((field: CustomField) => {
      const fieldName = `templateValues.${field.name}`;

      switch (field.type) {
        case "text":
          return (
            <div key={field.name}>
              <CustomInput
                name={fieldName}
                label={field.label}
                control={form.control}
                required={field.required}
                placeholder={
                  field.placeholder || `Enter ${field?.label.toLowerCase()}`
                }
              />
            </div>
          );
        case "number":
          return (
            <div key={field.name}>
              <CustomInput
                name={fieldName}
                label={field.label}
                control={form.control}
                required={field.required}
                type="number"
                placeholder={
                  field.placeholder || `Enter ${field?.label.toLowerCase()}`
                }
              />
            </div>
          );
        case "select":
          const formattedOptions: CustomFieldOption[] =
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

  const handleTemplateChange = async (formTemplateId: string) => {
    try {
      if (!formTemplateId) {
        // Reset if no template is selected
        form.setValue("formTemplateId", "");
        form.setValue("templateValues", {});
        setSelectedTemplate(null);
        return;
      }

      // Update form with the new template ID
      form.setValue("formTemplateId", formTemplateId);

      // Fetch template details
      const response = await getFormTemplateById(formTemplateId);

      if (response.error) {
        toast.error(response.error);
        return;
      }

      if (response.data) {
        setSelectedTemplate(response.data);

        // Type the initial accumulator object
        const initialValues: Record<string, string> = {};

        // Use typed accumulator and field parameter
        const emptyValues = response.data.fields.reduce(
          (acc: Record<string, string>, field: CustomField) => {
            acc[field.name] = "";
            return acc;
          },
          initialValues,
        );

        // Update form with empty values for the new template
        form.setValue("templateValues", emptyValues);
      }
    } catch (error) {
      toast.error("Failed to load template details");
      console.error("Error loading template:", error);
    }
  };

  async function onSubmit(data: AssetFormValues) {
    startTransition(async () => {
      try {
        console.log(data);
        const formattedData = {
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
        };

        await create(formattedData)
          .then(() => {
            form.reset();
            toast.success("Asset created successfully");
            router.push("/assets"); // Add navigation after success
          })
          .catch((error) => {
            toast.error("Something went wrong: " + error);
          });
      } catch (error) {
        toast.error("Something went wrong");
        console.error(error);
      }
    });
  }

  return (
    <section className="w-full mx-auto p-6">
      {/* Modals */}
      <ModalManager modals={useFormModals(form)} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Template Selection */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Category</CardTitle>
              <CardDescription>Select a category for the asset</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <SelectWithButton
                  name="formTemplateId"
                  label="Form Template"
                  data={templates}
                  onNew={openTemplate}
                  placeholder="Select a form template"
                  form={form}
                  isPending={isPending}
                  onChange={handleTemplateChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Main Information Card */}
          <Card className="p-6">
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">
                  Basic Information
                </h3>
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
                <SelectWithButton
                  name="modelId"
                  form={form}
                  isPending
                  label="Model"
                  data={models}
                  onNew={openModel}
                  placeholder="Select model"
                  required
                />
              </div>

              {/* Status & Location */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">
                  Status & Location
                </h3>
                <div className="space-y-6">
                  <SelectWithButton
                    name="statusLabelId"
                    form={form}
                    isPending={isLoadingStatusLabels}
                    label="Status Label"
                    data={statusLabels}
                    onNew={openDepartment}
                    placeholder="Select status"
                    required
                  />
                  <SelectWithButton
                    form={form}
                    isPending
                    name="departmentId"
                    label="Department"
                    data={departments}
                    onNew={openStatus}
                    placeholder="Select department"
                    required
                  />
                  <SelectWithButton
                    isPending
                    form={form}
                    name="locationId"
                    label="Location"
                    data={locations}
                    onNew={openLocation}
                    placeholder="Select location"
                    required
                  />
                </div>
              </div>

              {/* Purchase Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">
                  Purchase Information
                </h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
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
                  <div className="grid grid-cols-2 gap-6">
                    {/*<CustomDatePicker*/}
                    {/*  label="Purchase Date"*/}
                    {/*  name="purchaseDate"*/}
                    {/*  form={form}*/}
                    {/*  placeholder="Select purchase date"*/}
                    {/*  required*/}
                    {/*  disablePastDates*/}
                    {/*  tooltip="Select the date your asset was purchased"*/}
                    {/*  minDate={new Date()}*/}
                    {/*  maxDate={new Date(2025, 0, 1)}*/}
                    {/*  formatString="dd/MM/yyyy"*/}
                    {/*/>*/}
                    <CustomDatePicker
                      name="purchaseDate"
                      form={form}
                      tooltip="Select the date your asset will no longer be used"
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
                    isPending
                  />
                  <SelectWithButton
                    form={form}
                    isPending
                    name="inventoryId"
                    label="Inventory"
                    data={inventories}
                    onNew={openInventory}
                    placeholder="Select an inventory"
                    required
                  />
                </div>
              </div>

              {/* Physical Properties */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">
                  Physical Properties
                </h3>
                <div className="grid grid-cols-2 gap-6">
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
              </div>

              {/* Energy Consumption */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">
                  Energy Consumption
                </h3>
                <div className="grid grid-cols-2 gap-6">
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
              </div>
            </div>
          </Card>

          <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50">
            <CardHeader className="pb-3 px-4 sm:px-6">
              <CardTitle className="text-lg font-semibold text-slate-700 break-words">
                Additional Category Fields
              </CardTitle>
              <CardDescription className="text-sm">
                Fields specific to the selected category template
              </CardDescription>
            </CardHeader>
            <CardContent className="bg-white rounded-lg mx-2 sm:mx-4 mb-4 p-3 sm:p-6 shadow-sm">
              {selectedTemplate ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {renderCustomFields()}
                </div>
              ) : (
                <div className="py-6 sm:py-8 text-center text-slate-500">
                  <p className="text-sm sm:text-base">
                    Select a category template to show additional fields
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 sticky bottom-0 bg-white p-4 border-t shadow-lg">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="min-w-[120px]"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isUpdate ? "Updating..." : "Creating..."}
                </>
              ) : isUpdate ? (
                "Update Asset"
              ) : (
                "Create Asset"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
};

export default AssetForm;
