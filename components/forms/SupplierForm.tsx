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
  return cleaned;
}

const SupplierForm = ({ initialData, onSubmitSuccess }: SupplierFormProps) => {
  const [isPending, startTransition] = useTransition();
  const { onClose } = useSupplierUIStore();
  const { createSupplier, updateSupplier } = useSupplierQuery();

  const form = useForm<z.infer<typeof supplierSchema> & { active: boolean }>({
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

  const onSubmit = async (data: z.infer<typeof supplierSchema> & { active: boolean }) => {
    startTransition(async () => {
      try {
        if (initialData && initialData.id) {
          const updateData = sanitizeSupplierUpdate(data);
          await updateSupplier(initialData.id, updateData, {
            onSuccess: () => {
              toast.success("Supplier updated successfully");
            },
            onError: (error) => {
              console.error("Error updating Supplier:", error);
              toast.error("Failed to update supplier");
            },
          });
        } else {
          await createSupplier(data, {
            onSuccess: () => {
              toast.success("Supplier created successfully");
            },
            onError: (error) => {
              console.error("Error creating Supplier:", error);
              toast.error("Failed to create supplier");
            },
          });
        }
        onSubmitSuccess?.();
        onClose();
        form.reset();
      } catch (error) {
        console.error("Supplier operation error:", error);
        toast.error("Failed to save supplier");
      }
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 max-h-[70vh] overflow-y-auto pr-2"
      >
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
            required={true}
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
            required={true}
          />

          <CustomInput
            name="state"
            label="State/Province"
            control={form.control}
            type="text"
            placeholder="Enter state or province"
            disabled={isPending}
            required={true}
          />

          <CustomInput
            name="zip"
            label="Postal Code"
            control={form.control}
            type="text"
            placeholder="Enter postal code"
            disabled={isPending}
            required={true}
          />

          <CustomInput
            name="country"
            label="Country"
            control={form.control}
            type="text"
            placeholder="Enter country"
            disabled={isPending}
            required={true}
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
        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
              onClose();
            }}
            disabled={isPending}
          >
            Cancel
          </Button>

          <Button type="submit" disabled={isPending} className="min-w-[120px]">
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
      </form>
    </Form>
  );
};

export default SupplierForm;
