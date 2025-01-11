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
import Dropzone from "@/components/Dropzone";
import { SelectWithButton } from "@/components/SelectWithButton";
import { useStatusLabelUIStore } from "@/lib/stores/useStatusLabelUIStore";
import { useLocationStore } from "@/lib/stores/locationStore";
import { useDepartmentStore } from "@/lib/stores/departmentStore";
import { useInventoryStore } from "@/lib/stores/inventoryStore";
import { useSupplierStore } from "@/lib/stores/SupplierStore";
import { DialogContainer } from "@/components/dialogs/DialogContainer";
import SupplierForm from "@/components/forms/SupplierForm";
import InventoryForm from "@/components/forms/InventoryForm";
import DepartmentForm from "@/components/forms/DepartmentForm";
import StatusLabelForm from "@/components/forms/StatusLabelForm";
import LocationForm from "@/components/forms/LocationForm";
import { licenseSchema } from "@/lib/schemas";
import { create } from "@/lib/actions/license.actions";

type LicenseFormValues = z.infer<typeof licenseSchema>;

const LicenseForm = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);

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
    locations,
    fetchLocations,
    isOpen: isLocationOpen,
    onOpen: openLocation,
    onClose: closeLocation,
  } = useLocationStore();
  const {
    statusLabels,
    getAll: fetchStatusLabels,
    isOpen: isStatusOpen,
    onOpen: openStatus,
    onClose: closeStatus,
  } = useStatusLabelUIStore();

  const {
    departments,
    getAll: fetchDepartments,
    isOpen: isDepartmentOpen,
    onOpen: openDepartment,
    onClose: closeDepartment,
  } = useDepartmentStore();
  useEffect(() => {
    fetchInventories();
    fetchSuppliers();
    closeInventory();
    closeSupplier();
  }, []);

  const handleDrop = (acceptedFiles: File[]) => {
    const csvFile = acceptedFiles[0];
    // if (!csvFile.name.endsWith('.csv')) {
    //     toast.error('Please select a CSV file.')
    //     return
    // }
    setFile(csvFile);
  };

  const form = useForm<LicenseFormValues>({
    resolver: zodResolver(licenseSchema),
    defaultValues: {
      licenseName: "",
      licensedEmail: "",
      // alertRenewalDays: ,
      statusLabelId: "",
      locationId: "",
      inventoryId: "",
      minSeatsAlert: "",
      seats: "",
      supplierId: "",
      poNumber: "",
      purchasePrice: "",
      alertRenewalDays: "",
      // licenseKey: '',
      notes: "",
    },
  });

  const onSubmit = async (data: LicenseFormValues) => {
    startTransition(async () => {
      try {
        const formData = {
          ...data,
        };
        await create(data).then((_) => {
          toast.success("License created successfully");
          // router.push('/licenses')
        });
        form.reset();
      } catch (error) {
        toast.error(`Something went wrong: ${error}`);
        console.error(error);
      }
    });
  };

  return (
    <section className="w-full mx-auto p-6">
      <DialogContainer
        description=""
        open={isSupplierOpen}
        onOpenChange={closeSupplier}
        title="Add Supplier"
        form={<SupplierForm />}
      />

      <DialogContainer
        description=""
        open={isInventoryOpen}
        onOpenChange={closeInventory}
        title="Add Inventory"
        form={<InventoryForm />}
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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              {/* License Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  License Information
                </h3>
                <CustomInput
                  name="licenseName"
                  label="License Name"
                  control={form.control}
                  placeholder="e.g. Adobe Creative Cloud"
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

              {/* License Management */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">
                  License Management
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <CustomInput
                    name="seats"
                    label="Total Seats"
                    control={form.control}
                    type="number"
                    placeholder="Enter total licenses"
                    required
                  />
                  <CustomInput
                    name="minSeatsAlert"
                    label="Minimum License Alert"
                    control={form.control}
                    type="number"
                    placeholder="Enter minimum threshold"
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
                      name="purchasePrice"
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
                      name="renewalDate"
                      form={form}
                      label="Renewal Date"
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

              {/* Notifications */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">
                  Notification Settings
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <CustomInput
                    name="licensedEmail"
                    label="Licensed Email"
                    control={form.control}
                    type="email"
                    placeholder="Enter email for notifications"
                    required
                  />
                  <CustomInput
                    name="alertRenewalDays"
                    label="Alert Days Before Renewal"
                    control={form.control}
                    type="number"
                    placeholder="e.g. 30"
                    required
                  />
                </div>
              </div>

              {/* Attachments */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Attachments</h3>
                <div className="grid grid-cols-2 gap-6">
                  <Dropzone
                    onDrop={handleDrop}
                    accept={{
                      "text/pdf": [".pdf"],
                    }}
                  />
                  <Alert>
                    <InfoIcon className="h-4 w-4" />
                    <AlertTitle>Note</AlertTitle>
                    <AlertDescription>
                      Upload license documentation, terms, or related files (PDF
                      only, max 10 files)
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </div>
          </Card>

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
                "Create License"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
};

export default LicenseForm;
