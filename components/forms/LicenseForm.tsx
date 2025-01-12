"use client";

import React, { useState, useTransition } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { InfoIcon, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";

import CustomInput from "@/components/CustomInput";
import CustomDatePicker from "@/components/CustomDatePicker";
import CustomPriceInput from "@/components/CustomPriceInput";
import Dropzone from "@/components/Dropzone";
import { SelectWithButton } from "@/components/SelectWithButton";
import { useSupplierUIStore } from "@/lib/stores/useSupplierUIStore";
import { licenseSchema } from "@/lib/schemas";
import { ModalManager } from "@/components/ModalManager";
import { useFormModals } from "@/hooks/useFormModals";
import { useStatusLabelUIStore } from "@/lib/stores/useStatusLabelUIStore";
import { useStatusLabelsQuery } from "@/hooks/queries/useStatusLabelsQuery";
import { useLicenseQuery } from "@/hooks/queries/useLicenseQuery";
import { useDepartmentUIStore } from "@/lib/stores/useDepartmentUIStore";
import { useDepartmentQuery } from "@/hooks/queries/useDepartmentQuery";
import { useInventoryUIStore } from "@/lib/stores/useInventoryUIStore";
import { useSupplierQuery } from "@/hooks/queries/useSupplierQuery";
import { useInventoryQuery } from "@/hooks/queries/useInventoryQuery";
import { useLocationUIStore } from "@/lib/stores/useLocationUIStore";
import { useLocationQuery } from "@/hooks/queries/useLocationQuery";

type LicenseFormValues = z.infer<typeof licenseSchema>;

const LicenseForm = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const { onOpen } = useStatusLabelUIStore();
  const { statusLabels } = useStatusLabelsQuery();
  const { createLicense } = useLicenseQuery();
  const { onOpen: openDepartment } = useDepartmentUIStore();
  const { departments } = useDepartmentQuery();
  const { suppliers } = useSupplierQuery();
  const { inventories } = useInventoryQuery();
  const { locations } = useLocationQuery();
  const { onOpen: openInventory } = useInventoryUIStore();
  const { onOpen: openSupplier } = useSupplierUIStore();

  const { onOpen: openLocation } = useLocationUIStore();

  const handleDrop = (acceptedFiles: File[]) => {
    const csvFile = acceptedFiles[0];
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

  async function onSubmit(data: LicenseFormValues) {
    startTransition(async () => {
      await createLicense(data, {
        onSuccess: () => {
          form.reset();
          console.log("Successfully created a License");
        },
        onError: (error) => {
          console.error("Error creating a License:", error);
        },
      });
    });
  }

  return (
    <section className="w-full mx-auto p-6">
      <ModalManager modals={useFormModals(form)} />

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
                    onNew={onOpen}
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
