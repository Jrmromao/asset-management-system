"use client";

import React, { useEffect, useState, useTransition } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { InfoIcon, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import CustomInput from "@/components/CustomInput";
import CustomDatePicker from "@/components/CustomDatePicker";
import CustomPriceInput from "@/components/CustomPriceInput";
import { DialogContainer } from "@/components/dialogs/DialogContainer";

import CategoryForm from "@/components/forms/CategoryForm";
import SupplierForm from "@/components/forms/SupplierForm";
import ManufacturerForm from "@/components/forms/ManufacturerForm";
import InventoryForm from "@/components/forms/InventoryForm";

import { useCategoryStore } from "@/lib/stores/categoryStore";
import { useSupplierStore } from "@/lib/stores/SupplierStore";
import { useManufacturerStore } from "@/lib/stores/manufacturerStore";
import { useInventoryStore } from "@/lib/stores/inventoryStore";
import { create } from "@/lib/actions/accessory.actions";
import { useStatusLabelStore } from "@/lib/stores/statusLabelStore";
import { SelectWithButton } from "@/components/SelectWithButton";
import { useModelStore } from "@/lib/stores/modelStore";
import { useLocationStore } from "@/lib/stores/locationStore";
import { useDepartmentStore } from "@/lib/stores/departmentStore";
import ModelForm from "@/components/forms/ModelForm";
import { accessorySchema } from "@/lib/schemas";
import { getAllSimple } from "@/lib/actions/supplier.actions";
import StatusLabelForm from "@/components/forms/StatusLabelForm";
import DepartmentForm from "@/components/forms/DepartmentForm";
import LocationForm from "@/components/forms/LocationForm";
import { findAll } from "@/lib/actions/category.actions";
import { getAll as getAllModels } from "@/lib/actions/model.actions";
import { getAll as getAllInventories } from "@/lib/actions/inventory.actions";
import { getAll as getAllManufacturers } from "@/lib/actions/manufacturer.actions";

type AccessoryFormValues = z.infer<typeof accessorySchema>;

const AccessoryForm = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const {
    isOpen: isCategoryOpen,
    onOpen: openCategory,
    onClose: closeCategory,
  } = useCategoryStore();
  const {
    isOpen: isManufacturerOpen,
    onOpen: openManufacturer,
    onClose: closeManufacturer,
  } = useManufacturerStore();
  const {
    isOpen: isInventoryOpen,
    onOpen: openInventory,
    onClose: closeInventory,
  } = useInventoryStore();
  const {
    // suppliers,
    isOpen: isSupplierOpen,
    onOpen: openSupplier,
    onClose: closeSupplier,
  } = useSupplierStore();
  const {
    statusLabels,
    isOpen: isStatusOpen,
    onOpen: openStatus,
    onClose: closeStatus,
  } = useStatusLabelStore();

  const {
    locations,
    isOpen: isLocationOpen,
    onOpen: openLocation,
    onClose: closeLocation,
  } = useLocationStore();
  const {
    departments,
    isOpen: isDepartmentOpen,
    onOpen: openDepartment,
    onClose: closeDepartment,
  } = useDepartmentStore();

  const {
    isOpen: isModelOpen,
    onOpen: openModel,
    onClose: closeModel,
  } = useModelStore();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [inventories, setInventories] = useState<Inventory[]>([]);

  const form = useForm<AccessoryFormValues>({
    resolver: zodResolver(accessorySchema),
    defaultValues: {
      name: "",
      serialNumber: "",
      supplierId: "",
      modelId: "",
      locationId: "",
      inventoryId: "",
      poNumber: "",
      alertEmail: "",
      material: "",
      statusLabelId: "",
      notes: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      const suppliersResult = await getAllSimple();
      if (suppliersResult.data) {
        setSuppliers(suppliersResult.data);
      }

      const categoryResult = await findAll();
      if (categoryResult.data) {
        setCategories(categoryResult.data);
      }

      const modelsResult = await getAllModels();
      if (modelsResult.data) {
        setModels(modelsResult.data);
      }

      const inventoryResult = await getAllInventories();
      if (inventoryResult.data) {
        setInventories(inventoryResult.data);
      }
      const manufacturersResult = await getAllManufacturers();
      if (manufacturersResult.data) {
        setManufacturers(manufacturersResult.data);
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (data: AccessoryFormValues) => {
    startTransition(async () => {
      try {
        console.log(data);

        await create(data).then((_) => {
          form.reset();
          toast.success("Accessory created successfully");
          router.push("/accessories");
        });
      } catch (error) {
        toast.error("Something went wrong");
        console.error(error);
      }
    });
  };

  return (
    <section className="w-full mx-auto p-6">
      <DialogContainer
        description=""
        open={isModelOpen}
        onOpenChange={closeModel}
        title="Add Model"
        form={<ModelForm />}
      />
      <DialogContainer
        description=""
        open={isCategoryOpen}
        onOpenChange={closeCategory}
        title="Add Category"
        form={<CategoryForm />}
      />
      <DialogContainer
        description=""
        open={isSupplierOpen}
        onOpenChange={closeSupplier}
        title="Add Supplier"
        form={<SupplierForm />}
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
        open={isInventoryOpen}
        onOpenChange={closeInventory}
        title="Add Inventory"
        form={<InventoryForm />}
      />

      <DialogContainer
        description=""
        open={isStatusOpen}
        onOpenChange={closeStatus}
        title="Add Status Label"
        form={<StatusLabelForm />}
      />

      <DialogContainer
        description=""
        open={isDepartmentOpen}
        onOpenChange={closeDepartment}
        title="Add Department"
        form={<DepartmentForm />}
      />

      <DialogContainer
        description=""
        open={isLocationOpen}
        onOpenChange={closeLocation}
        title="Add Department"
        form={<LocationForm />}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <CustomInput
                    required
                    name="name"
                    label="Name"
                    control={form.control}
                    type="text"
                    placeholder="Enter asset name"
                  />
                  <CustomInput
                    required
                    name="serialNumber"
                    label="Serial Number"
                    control={form.control}
                    type="text"
                    placeholder="Enter serial number"
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
                    label="Status Label"
                    data={statusLabels}
                    onNew={openStatus}
                    placeholder="Select a status label"
                    required
                    form={form}
                    isPending
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
                      placeholder="Select date"
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
                </div>
              </div>
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">
                  Inventory Management
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <SelectWithButton
                      name="inventoryId"
                      label="Inventory"
                      data={inventories}
                      onNew={openInventory}
                      placeholder="Select inventory"
                      required
                      form={form}
                      isPending
                    />
                    <CustomInput
                      name="totalQuantityCount"
                      label="Total Quantity"
                      control={form.control}
                      type="number"
                      placeholder="Enter total quantity"
                      required
                    />

                    {/*<CustomInput*/}
                    {/*    name="minQuantityAlert"*/}
                    {/*    label="Minimum Quantity Alert"*/}
                    {/*    control={form.control}*/}
                    {/*    type="number"*/}
                    {/*    placeholder="Enter minimum quantity"*/}
                    {/*    required*/}
                    {/*/>*/}
                    <CustomInput
                      name="reorderPoint"
                      label="Reorder Point"
                      control={form.control}
                      type="number"
                      placeholder="Enter reorder point"
                      required
                    />
                    <CustomInput
                      name="alertEmail"
                      label="Alert Email"
                      control={form.control}
                      type="email"
                      placeholder="Enter alert email"
                      required
                    />
                  </div>
                  <Alert>
                    <InfoIcon className="h-4 w-4" />
                    <AlertTitle>Inventory Alert Settings</AlertTitle>
                    <AlertDescription>
                      System will notify when inventory reaches minimum quantity
                      or reorder point. Make sure to set appropriate values for
                      your stock management.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
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
                    type="number"
                    required
                    placeholder="Enter weight"
                  />
                </div>
              </div>
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">
                  Additional Information
                </h3>
                <div className="space-y-4">
                  <CustomInput
                    name="notes"
                    label="Notes"
                    control={form.control}
                    type="textarea"
                    placeholder="Enter notes"
                  />
                </div>
              </div>
            </div>
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
                  Creating...
                </>
              ) : (
                "Create Accessory"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
};

export default AccessoryForm;
