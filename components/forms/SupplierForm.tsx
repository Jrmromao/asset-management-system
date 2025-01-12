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

const SupplierForm = () => {
  const [isPending, startTransition] = useTransition();
  const { onClose } = useSupplierUIStore();
  const { createSupplier } = useSupplierQuery();

  const form = useForm<z.infer<typeof supplierSchema>>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
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
    },
  });

  const onSubmit = async (data: z.infer<typeof supplierSchema>) => {
    startTransition(async () => {
      try {
        await createSupplier(data, {
          onSuccess: () => {
            console.log("Successfully created Supplier");
          },
          onError: (error) => {
            console.error("Error creating Supplier:", error);
          },
        });
        toast.success("Supplier created successfully");
        onClose();
        form.reset();
      } catch (error) {
        console.error("Supplier creation error:", error);
        toast.error("Failed to create supplier");
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                Creating...
              </>
            ) : (
              "Create"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SupplierForm;
