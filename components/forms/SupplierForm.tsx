"use client";

import React, { useTransition } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import CustomInput from "@/components/CustomInput";
import { supplierSchema } from "@/lib/schemas";
import { useSupplierUIStore } from "@/lib/stores/useSupplierUIStore";
import { useSupplierQuery } from "@/hooks/queries/useSupplierQuery";
import CustomSwitch from "../CustomSwitch";
import { Supplier } from "@prisma/client";

interface SupplierFormProps {
  initialData?: Supplier;
  onSubmitSuccess?: () => void;
}

function sanitizeSupplierUpdate(data: any) {
  const cleaned = { ...data };
  delete cleaned.id;
  delete cleaned.createdAt;
  delete cleaned.updatedAt;
  delete cleaned.asset;
  delete cleaned.companyId;
  delete cleaned.company;
  delete cleaned.assets;
  delete cleaned.accessories;
  delete cleaned.License;
  delete cleaned.PurchaseOrder;
  delete cleaned.Maintenance;
  return cleaned;
}

const SupplierForm = ({ initialData, onSubmitSuccess }: SupplierFormProps) => {
  const [isPending, startTransition] = useTransition();
  const { onClose } = useSupplierUIStore();
  const { createSupplier, updateSupplier } = useSupplierQuery();

  const form = useForm<z.infer<typeof supplierSchema>>({
    resolver: zodResolver(supplierSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          phoneNum: initialData.phoneNum ?? "",
          url: initialData.url ?? "",
          addressLine2: initialData.addressLine2 ?? "",
          notes: initialData.notes ?? "",
          active: initialData.active ?? true,
        }
      : {
          name: "",
          contactName: "",
          email: "",
          phoneNum: "",
          url: "",
          addressLine1: "",
          addressLine2: "",
          city: "",
          state: "",
          zip: "",
          country: "",
          notes: "",
          active: true,
        },
  });

  const onSubmit = async (data: z.infer<typeof supplierSchema>) => {
    try {
      console.log("Supplier form submission - data:", data);
      
      // Validate the data before submission
      try {
        const validation = supplierSchema.safeParse(data);
        if (!validation.success) {
          console.error("Validation errors:", validation.error.errors);
          toast.error(`Validation failed: ${validation.error.errors[0].message}`);
          return;
        }
      } catch (validationError) {
        console.error("Validation error:", validationError);
        toast.error("Form validation failed");
        return;
      }

      startTransition(async () => {
        try {
          if (initialData && initialData.id) {
            console.log("Updating supplier with ID:", initialData.id);
            const updateData = sanitizeSupplierUpdate(data);
            console.log("Sanitized update data:", updateData);
            
            try {
              const result = await updateSupplier(initialData.id, updateData);
              console.log("Update result:", result);
              if (result.success) {
                toast.success("Supplier updated successfully");
                onSubmitSuccess?.();
                onClose();
                form.reset();
              } else {
                toast.error(result.error || "Failed to update supplier");
              }
            } catch (updateError) {
              console.error("Update operation error:", updateError);
              toast.error("Failed to update supplier");
            }
          } else {
            console.log("Creating new supplier");
            
            try {
              const result = await createSupplier(data);
              console.log("Create result:", result);
              if (result.success) {
                toast.success("Supplier created successfully");
                onSubmitSuccess?.();
                onClose();
                form.reset();
              } else {
                toast.error(result.error || "Failed to create supplier");
              }
            } catch (createError) {
              console.error("Create operation error:", createError);
              toast.error("Failed to create supplier");
            }
          }
        } catch (error) {
          console.error("Supplier operation error:", error);
          toast.error("Failed to save supplier");
        }
      });
    } catch (error) {
      console.error("Critical error in supplier form submission:", error);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col h-[calc(100vh-160px)]"
      >
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            <CustomInput
              name="name"
              label="Supplier Name"
              control={form.control}
              type="text"
              placeholder="Enter supplier name"
              disabled={isPending}
              required={true}
              tooltip="Legal name of the supplier company"
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Company Information */}
              <CustomInput
                name="contactName"
                label="Contact Person"
                control={form.control}
                type="text"
                placeholder="Enter contact person's name"
                disabled={isPending}
                required={true}
                tooltip="Primary contact person at the supplier"
              />

              {/* Contact Information */}
              <CustomInput
                name="email"
                label="Email"
                control={form.control}
                type="email"
                placeholder="Enter email address"
                disabled={isPending}
                required={true}
                tooltip="Must be a unique email address"
              />

              <CustomInput
                name="phoneNum"
                label="Phone Number"
                control={form.control}
                type="tel"
                placeholder="Enter phone number"
                disabled={isPending}
              />

              <CustomInput
                name="url"
                label="Website"
                control={form.control}
                type="url"
                placeholder="Enter website URL"
                disabled={isPending}
                tooltip="Company website URL (if available)"
              />

              {/* Address Information */}
              <CustomInput
                name="addressLine1"
                label="Address Line 1"
                control={form.control}
                type="text"
                placeholder="Enter street address"
                disabled={isPending}
              />

              <CustomInput
                name="addressLine2"
                label="Address Line 2"
                control={form.control}
                type="text"
                placeholder="Apartment, suite, unit, etc. (optional)"
                disabled={isPending}
              />

              <CustomInput
                name="city"
                label="City"
                control={form.control}
                type="text"
                placeholder="Enter city"
                disabled={isPending}
              />

              <CustomInput
                name="state"
                label="State/Province"
                control={form.control}
                type="text"
                placeholder="Enter state or province"
                disabled={isPending}
              />

              <CustomInput
                name="zip"
                label="Postal Code"
                control={form.control}
                type="text"
                placeholder="Enter postal code"
                disabled={isPending}
              />

              <CustomInput
                name="country"
                label="Country"
                control={form.control}
                type="text"
                placeholder="Enter country"
                disabled={isPending}
              />
            </div>

            {/* Notes - Full Width */}
            <div className="col-span-full">
              <CustomInput
                name="notes"
                label="Notes"
                control={form.control}
                type="textarea"
                placeholder="Enter any additional notes about the supplier"
                disabled={isPending}
                tooltip="Optional notes about the supplier"
              />
            </div>

            <CustomSwitch
              control={form.control}
              name="active"
              label="Active"
              disabled={isPending}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="border-t px-6 py-4 bg-white">
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              className="w-24"
              onClick={() => {
                form.reset();
                onClose();
              }}
              disabled={isPending}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isPending} className="w-24">
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {initialData ? "Updating..." : "Creating..."}
                </>
              ) : (
                initialData ? "Update" : "Create"
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default SupplierForm;
