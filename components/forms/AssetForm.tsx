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
import { useStatusLabelStore } from "@/lib/stores/statusLabelStore";
import { useModelStore } from "@/lib/stores/modelStore";
import { useLocationStore } from "@/lib/stores/locationStore";
import { useDepartmentStore } from "@/lib/stores/departmentStore";
import { useSupplierStore } from "@/lib/stores/SupplierStore";
import { useInventoryStore } from "@/lib/stores/inventoryStore";
import { create } from "@/lib/actions/assets.actions";
import { useCategoryStore } from "@/lib/stores/categoryStore";
import CustomPriceInput from "../CustomPriceInput";
import { SelectWithButton } from "@/components/SelectWithButton";
import { useManufacturerStore } from "@/lib/stores/manufacturerStore";
import { assetSchema } from "@/lib/schemas";
import { useFormTemplateStore } from "@/lib/stores/formTemplateStore";
import { CustomField, CustomFieldOption } from "@/types/form";
import { getFormTemplateById } from "@/lib/actions/formTemplate.actions";
import { DialogContainer } from "@/components/dialogs/DialogContainer";
import ModelForm from "@/components/forms/ModelForm";
import StatusLabelForm from "@/components/forms/StatusLabelForm";
import LocationForm from "@/components/forms/LocationForm";
import DepartmentForm from "@/components/forms/DepartmentForm";
import SupplierForm from "@/components/forms/SupplierForm";
import InventoryForm from "@/components/forms/InventoryForm";
import CategoryForm from "@/components/forms/CategoryForm";
import ManufacturerForm from "@/components/forms/ManufacturerForm";
import FormTemplateCreator from "@/components/forms/FormTemplateCreator";

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
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(
    null,
  );
  const [customFieldValues, setCustomFieldValues] = useState<
    Record<string, any>
  >({});
  // Stores
  const {
    create: createAsset,
    update: updateAsset,
    findById,
  } = useAssetStore();
  const {
    statusLabels,
    getAll: fetchStatusLabels,
    isOpen: isStatusOpen,
    onOpen: openStatus,
    onClose: closeStatus,
  } = useStatusLabelStore();
  const {
    models,
    fetchModels,
    isOpen: isModelOpen,
    onOpen: openModel,
    onClose: closeModel,
  } = useModelStore();
  const {
    locations,
    fetchLocations,
    isOpen: isLocationOpen,
    onOpen: openLocation,
    onClose: closeLocation,
  } = useLocationStore();
  const {
    departments,
    getAll: fetchDepartments,
    isOpen: isDepartmentOpen,
    onOpen: openDepartment,
    onClose: closeDepartment,
  } = useDepartmentStore();
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
    categories,
    getAll: fetchCategories,
    isOpen: isCategoryOpen,
    onOpen: openCategory,
    onClose: closeCategory,
  } = useCategoryStore();

  const {
    manufacturers,
    isOpen: isManufacturerOpen,
    onOpen: openManufacturer,
    onClose: closeManufacturer,
    getAll: fetchManufacturers,
  } = useManufacturerStore();

  const {
    isOpen: isTemplateOpen,
    templates,
    fetchTemplates,
    onOpen: openTemplate,
    onClose: closeTemplate,
  } = useFormTemplateStore();

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      purchaseDate: new Date(),
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
      endOfLife: new Date(),
      material: "",
      energyRating: "",
      licenseId: "",
      dailyOperatingHours: "",
      formTemplateId: "",
      templateValues: {},
    },
  });

  useEffect(() => {
    fetchStatusLabels();
    fetchLocations();
    fetchDepartments();
    fetchInventories();
    fetchSuppliers();
    fetchModels();
    fetchTemplates();

    if (isUpdate && id) {
      startTransition(async () => {
        const asset = await findById(id);
        if (asset) {
          form.reset(asset);
        } else {
          toast.error("Asset not found");
          router.back();
        }
      });
    }
  }, [
    isUpdate,
    id,
    fetchStatusLabels,
    fetchModels,
    fetchLocations,
    fetchDepartments,
    fetchInventories,
    fetchSuppliers,
    fetchTemplates,
  ]);

  const renderCustomFields = () => {
    if (!selectedTemplate) return null;

    return (
      <div className="space-y-6">
        {selectedTemplate.fields.map((field: CustomField) => {
          const fieldName = `templateValues.${field.name}`; // Changed from customFields to templateValues

          switch (field.type) {
            case "text":
              return (
                <CustomInput
                  key={field.name}
                  name={fieldName}
                  label={field.label}
                  control={form.control}
                  required={field.required}
                  placeholder={
                    field.placeholder || `Enter ${field.label.toLowerCase()}`
                  }
                />
              );
            case "number":
              return (
                <CustomInput
                  key={field.name}
                  name={fieldName}
                  label={field.label}
                  control={form.control}
                  required={field.required}
                  type="number"
                  placeholder={
                    field.placeholder || `Enter ${field.label.toLowerCase()}`
                  }
                />
              );
            case "select":
              const formattedOptions: CustomFieldOption[] =
                field.options?.map((option: string) => ({
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
                  data={formattedOptions}
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
      <DialogContainer
        description={""}
        open={isModelOpen}
        onOpenChange={closeModel}
        title="Add Model"
        form={<ModelForm />}
      />
      <DialogContainer
        description={""}
        open={isStatusOpen}
        onOpenChange={closeStatus}
        title="Add Status"
        form={<StatusLabelForm />}
      />
      <DialogContainer
        description={""}
        open={isLocationOpen}
        onOpenChange={closeLocation}
        title="Add Location"
        form={<LocationForm />}
      />

      <DialogContainer
        description={""}
        open={isDepartmentOpen}
        onOpenChange={closeDepartment}
        title="Add Department"
        form={<DepartmentForm />}
      />

      <DialogContainer
        description={""}
        open={isSupplierOpen}
        onOpenChange={closeSupplier}
        title="Add Supplier"
        form={<SupplierForm />}
      />
      <DialogContainer
        description={""}
        open={isInventoryOpen}
        onOpenChange={closeInventory}
        title="Add Inventory"
        form={<InventoryForm />}
      />

      <DialogContainer
        description={""}
        open={isCategoryOpen}
        onOpenChange={closeCategory}
        title="Add Inventory"
        form={<CategoryForm />}
      />

      <DialogContainer
        description=""
        open={isManufacturerOpen}
        onOpenChange={closeManufacturer}
        title="Add Manufacturer"
        form={<ManufacturerForm />}
      />

      <DialogContainer
        description=""
        open={isTemplateOpen}
        onOpenChange={closeTemplate}
        title="Add Custom Form fields"
        form={<FormTemplateCreator />}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Base Info Card */}
          <Card className="p-6">
            <div className="space-y-6">
              {/* Form Section Headers with Visual Separation */}
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

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">
                  Status & Location
                </h3>
                <div className="space-y-6">
                  <SelectWithButton
                    name="statusLabelId"
                    form={form}
                    isPending
                    label="Status Label"
                    data={statusLabels}
                    onNew={openStatus}
                    placeholder="Select status"
                    required
                  />
                  <SelectWithButton
                    form={form}
                    isPending
                    name="departmentId"
                    label="Department"
                    data={departments}
                    onNew={openDepartment}
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
                    {/*    name="purchaseDate"*/}
                    {/*    form={form}*/}
                    {/*    label="Purchase Date"*/}
                    {/*    placeholder="Select date"*/}
                    {/*/>*/}
                    {/*<CustomDatePicker*/}
                    {/*    name="endOfLife"*/}
                    {/*    form={form}*/}
                    {/*    label="End of Life"*/}
                    {/*    placeholder="Select date"*/}
                    {/*/>*/}

                    <CustomDatePicker
                      label="Purchase Date"
                      name="purchaseDate" // Changed from datePurchased
                      form={form}
                      placeholder="Select purchase date"
                      required
                      disablePastDates
                      tooltip="Select the date your asset was purchased"
                      minDate={new Date()}
                      maxDate={new Date(2025, 0, 1)}
                      formatString="dd/MM/yyyy"
                    />

                    <CustomDatePicker
                      label="End of Life"
                      name="endOfLife"
                      form={form}
                      placeholder="Select end of life"
                      required
                      disablePastDates
                      tooltip="Select the date your asset will no longer be used"
                      minDate={new Date()}
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
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">
                  Basic Information
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

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Custom Form Fields</CardTitle>
              <CardDescription>
                Please select a form template if you want to add custom fields
                to this asset
              </CardDescription>
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

                {selectedTemplate && renderCustomFields()}
              </div>
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

    // <div className="container mx-auto p-6 max-w-4xl space-y-6">
    //   {/* Header Section */}
    //   <div className="flex items-center gap-3 mb-6">
    //     <div className="p-2 bg-blue-50 rounded-lg">
    //       <Package className="h-6 w-6 text-blue-500" />
    //     </div>
    //     <div>
    //       <h1 className="text-2xl font-semibold">Create New Asset</h1>
    //       <p className="text-gray-500">Add a new asset to your inventory</p>
    //     </div>
    //   </div>
    //
    //   <Form {...form}>
    //     <form
    //       onSubmit={form.handleSubmit(onSubmit)}
    //       className="space-y-6 pb-24"
    //     >
    //       {/* Basic Information Card */}
    //       <Card>
    //         <CardHeader>
    //           <CardTitle>Basic Information</CardTitle>
    //           <CardDescription>
    //             Enter the core details about your asset
    //           </CardDescription>
    //         </CardHeader>
    //         <CardContent className="space-y-6">
    //           <div className="grid md:grid-cols-2 gap-6">
    //             <CustomInput
    //               required
    //               name="name"
    //               label="Asset Name"
    //               control={form.control}
    //               type="text"
    //               placeholder="Enter asset name"
    //             />
    //             <CustomInput
    //               required
    //               name="serialNumber"
    //               label="Tag Number"
    //               control={form.control}
    //               type="text"
    //               placeholder="Enter tag number"
    //             />
    //           </div>
    //           <SelectWithButton
    //             name="modelId"
    //             form={form}
    //             isPending={isPending}
    //             label="Model"
    //             data={models}
    //             onNew={openModel}
    //             placeholder="Select model"
    //             required
    //           />
    //           <div className="grid md:grid-cols-2 gap-6">
    //             <SelectWithButton
    //               name="statusLabelId"
    //               form={form}
    //               isPending={isPending}
    //               label="Status"
    //               data={statusLabels}
    //               onNew={openStatus}
    //               placeholder="Select status"
    //               required
    //             />
    //             <SelectWithButton
    //               name="departmentId"
    //               form={form}
    //               isPending={isPending}
    //               label="Department"
    //               data={departments}
    //               onNew={openDepartment}
    //               placeholder="Select department"
    //               required
    //             />
    //           </div>
    //         </CardContent>
    //       </Card>
    //
    //       {/* Purchase Information Card */}
    //       <Card>
    //         <CardHeader>
    //           <CardTitle>Purchase Information</CardTitle>
    //           <CardDescription>
    //             Enter purchase details and supplier information
    //           </CardDescription>
    //         </CardHeader>
    //         <CardContent className="space-y-6">
    //           <div className="grid md:grid-cols-2 gap-6">
    //             <CustomPriceInput
    //               name="price"
    //               label="Unit Price"
    //               control={form.control}
    //               placeholder="0.00"
    //               required
    //             />
    //             <CustomInput
    //               name="poNumber"
    //               label="PO Number"
    //               control={form.control}
    //               placeholder="Enter PO number"
    //             />
    //           </div>
    //           <div className="grid md:grid-cols-2 gap-6">
    //             <CustomDatePicker
    //               label="Purchase Date"
    //               name="purchaseDate"
    //               form={form}
    //               placeholder="Select purchase date"
    //               required
    //               disablePastDates
    //               tooltip="Select the date your asset was purchased"
    //             />
    //             <CustomDatePicker
    //               label="End of Life"
    //               name="endOfLife"
    //               form={form}
    //               placeholder="Select end of life"
    //               required
    //               disablePastDates
    //               tooltip="Select the date your asset will no longer be used"
    //             />
    //           </div>
    //           <SelectWithButton
    //             name="supplierId"
    //             label="Supplier"
    //             data={suppliers}
    //             onNew={openSupplier}
    //             placeholder="Select supplier"
    //             required
    //             form={form}
    //             isPending={isPending}
    //           />
    //           <SelectWithButton
    //             form={form}
    //             isPending={isPending}
    //             name="inventoryId"
    //             label="Inventory"
    //             data={inventories}
    //             onNew={openInventory}
    //             placeholder="Select an inventory"
    //             required
    //           />
    //         </CardContent>
    //       </Card>
    //
    //       {/* Location & Usage Card */}
    //       <Card>
    //         <CardHeader>
    //           <CardTitle>Location & Usage</CardTitle>
    //           <CardDescription>
    //             Specify where the asset is located and how it's used
    //           </CardDescription>
    //         </CardHeader>
    //         <CardContent className="space-y-6">
    //           <SelectWithButton
    //             form={form}
    //             isPending={isPending}
    //             name="locationId"
    //             label="Location"
    //             data={locations}
    //             onNew={openLocation}
    //             placeholder="Select location"
    //             required
    //           />
    //           <div className="grid md:grid-cols-2 gap-6">
    //             <CustomInput
    //               name="dailyOperatingHours"
    //               label="Operating Hours (per day)"
    //               control={form.control}
    //               type="number"
    //               placeholder="Enter operating hours"
    //             />
    //             <CustomInput
    //               name="energyRating"
    //               label="Energy Rating (kW)"
    //               control={form.control}
    //               placeholder="Enter energy rating"
    //             />
    //           </div>
    //         </CardContent>
    //       </Card>
    //
    //       {/* Physical Specifications Card */}
    //       <Card>
    //         <CardHeader>
    //           <CardTitle>Physical Specifications</CardTitle>
    //           <CardDescription>
    //             Enter the physical characteristics of the asset
    //           </CardDescription>
    //         </CardHeader>
    //         <CardContent className="space-y-6">
    //           <div className="grid md:grid-cols-2 gap-6">
    //             <CustomInput
    //               name="material"
    //               label="Material"
    //               control={form.control}
    //               placeholder="Enter material"
    //             />
    //             <CustomInput
    //               name="weight"
    //               label="Weight (kg)"
    //               control={form.control}
    //               type="text"
    //               placeholder="Enter weight"
    //             />
    //           </div>
    //         </CardContent>
    //       </Card>
    //
    //       {/* Custom Fields Card */}
    //       <Card>
    //         <CardHeader>
    //           <CardTitle>Custom Fields</CardTitle>
    //           <CardDescription>
    //             Add additional custom fields using a template
    //           </CardDescription>
    //         </CardHeader>
    //         <CardContent className="space-y-6">
    //           <SelectWithButton
    //             name="formTemplateId"
    //             label="Form Template"
    //             data={templates}
    //             onNew={openTemplate}
    //             placeholder="Select a form template"
    //             form={form}
    //             isPending={isPending}
    //             onChange={handleTemplateChange}
    //           />
    //           {selectedTemplate && renderCustomFields()}
    //         </CardContent>
    //       </Card>
    //     </form>
    //   </Form>
    //
    //   {/* Sticky Action Bar */}
    //   <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
    //     <div className="container mx-auto px-6 py-4 max-w-4xl flex justify-between items-center">
    //       <div className="text-sm text-gray-500">
    //         All required fields must be filled
    //       </div>
    //       <div className="flex gap-4">
    //         <Button
    //           type="button"
    //           variant="outline"
    //           onClick={() => router.back()}
    //           disabled={isPending}
    //         >
    //           Cancel
    //         </Button>
    //         <Button
    //           type="submit"
    //           disabled={isPending}
    //           className="min-w-[120px]"
    //         >
    //           {isPending ? (
    //             <>
    //               <Loader2 className="w-4 h-4 mr-2 animate-spin" />
    //               Creating...
    //             </>
    //           ) : (
    //             "Create Asset"
    //           )}
    //         </Button>
    //       </div>
    //     </div>
    //   </div>
    // </div>
  );
};

export default AssetForm;
