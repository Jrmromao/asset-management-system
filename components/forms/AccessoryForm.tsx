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
import { useStatusLabelUIStore } from "@/lib/stores/useStatusLabelUIStore";
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
    isOpen: isStatusOpen,
    onOpen: openStatus,
    onClose: closeStatus,
  } = useStatusLabelUIStore();

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

  // Category store
  const {
    isOpen: categoryIsOpen,
    onClose: closeCategoryModal,
    onOpen: openCategoryModal,
    categories: categoryList,
    getAll: fetchCategories,
  } = useCategoryStore();

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
      modelNumber: "",
      locationId: "",
      inventoryId: "",
      poNumber: "",
      alertEmail: "",
      material: "",
      statusLabelId: "",
      notes: "",
      categoryId: "",
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

      <DialogContainer
        open={categoryIsOpen}
        onOpenChange={closeCategoryModal}
        title="Add Category"
        description="Add a new category for your accessories."
        form={<CategoryForm />}
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 md:space-y-6"
        >
          {/* Category Selection Card */}
          <Card className="p-4 md:p-6">
            <SelectWithButton
              name="categoryId"
              label="Category"
              form={form}
              required
              onNew={openCategory}
              data={categoryList}
              placeholder="Select category"
              isPending={isPending}
            />
          </Card>

          {/* Basic Information */}
          <Card className="p-4 md:p-6">
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <CustomInput
                required
                name="name"
                label="Name"
                control={form.control}
                type="text"
              />
              <CustomInput
                required
                name="serialNumber"
                label="Serial Number"
                control={form.control}
                type="text"
              />
              <CustomInput
                name="modelNumber"
                label="Model Number"
                control={form.control}
                type="text"
                className="md:col-span-2"
                required
              />
            </div>
          </Card>

          {/* Status & Location */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-4 md:p-6">
              <h3 className="text-lg font-semibold mb-4">Status & Location</h3>
              <div className="space-y-4">
                <SelectWithButton
                  name="statusLabelId"
                  label="Status"
                  form={form}
                  required
                  onNew={openStatus}
                  data={statusLabels}
                  placeholder="Select status"
                  isPending={isPending}
                />
                <SelectWithButton
                  name="departmentId"
                  label="Department"
                  form={form}
                  required
                  onNew={openDepartment}
                  data={departments}
                  placeholder="Select department"
                  isPending={isPending}
                />
                <SelectWithButton
                  name="locationId"
                  label="Location"
                  form={form}
                  required
                  onNew={openLocation}
                  data={locations}
                  placeholder="Select location"
                  isPending={isPending}
                />
              </div>
            </Card>

            <Card className="p-4 md:p-6">
              <h3 className="text-lg font-semibold mb-4">
                Physical Properties
              </h3>
              <div className="space-y-4">
                <CustomInput
                  name="material"
                  label="Material"
                  control={form.control}
                />
                <CustomInput
                  name="weight"
                  label="Weight (kg)"
                  control={form.control}
                  type="number"
                  required
                />
              </div>
            </Card>
          </div>

          {/* Purchase Information */}
          <Card className="p-4 md:p-6">
            <h3 className="text-lg font-semibold mb-4">Purchase Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <CustomInput
                name="poNumber"
                label="PO Number"
                control={form.control}
              />
              <CustomPriceInput
                name="price"
                label="Unit Price"
                control={form.control}
                required
              />
              <CustomDatePicker
                name="purchaseDate"
                form={form}
                label="Purchase Date"
              />
              <CustomDatePicker
                name="endOfLife"
                form={form}
                label="End of Life"
              />
              <div className="md:col-span-2">
                <SelectWithButton
                  name="supplierId"
                  label="Supplier"
                  form={form}
                  onNew={openSupplier}
                  data={suppliers}
                  placeholder="Select supplier"
                  isPending={isPending}
                />
              </div>
            </div>
          </Card>

          {/* Inventory Management */}
          <Card className="p-4 md:p-6">
            <h3 className="text-lg font-semibold mb-4">Inventory Management</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <SelectWithButton
                  name="inventoryId"
                  label="Inventory"
                  form={form}
                  required
                  onNew={openInventory}
                  data={inventories}
                  placeholder="Select inventory"
                  isPending={isPending}
                />
                <CustomInput
                  name="totalQuantityCount"
                  label="Total Quantity"
                  control={form.control}
                  type="number"
                  required
                />
                <CustomInput
                  name="reorderPoint"
                  label="Reorder Point"
                  control={form.control}
                  type="number"
                  required
                />
                <CustomInput
                  name="alertEmail"
                  label="Alert Email"
                  control={form.control}
                  type="email"
                  required
                />
              </div>
              <Alert className="h-fit">
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Inventory Alert Settings</AlertTitle>
                <AlertDescription>
                  System will notify when inventory reaches minimum quantity or
                  reorder point.
                </AlertDescription>
              </Alert>
            </div>
          </Card>

          {/* Notes */}
          <Card className="p-4 md:p-6">
            <h3 className="text-lg font-semibold mb-4">
              Additional Information
            </h3>
            <CustomInput
              name="notes"
              control={form.control}
              type="textarea"
              placeholder="Add any additional notes..."
            />
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
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
