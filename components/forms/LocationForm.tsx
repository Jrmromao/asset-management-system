"use client";

import React, { useEffect, useTransition } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import CustomInput from "@/components/CustomInput";
import { locationSchema } from "@/lib/schemas";
import { useLocationUIStore } from "@/lib/stores/useLocationUIStore";
import { useLocationQuery } from "@/hooks/queries/useLocationQuery";
import { FormProps } from "@/types/form";

const LocationForm = ({
  initialData,
  onSubmitSuccess,
}: FormProps<DepartmentLocation>) => {
  const [isPending, startTransition] = useTransition();
  const { onClose } = useLocationUIStore();
  const { createLocation, isCreating, updateLocation, isUpdating } =
    useLocationQuery();

  const emptyValues = {
    name: "",
    addressLine1: "",
    addressLine2: "",
    state: "",
    city: "",
    zip: "",
    country: "",
  };

  const form = useForm<z.infer<typeof locationSchema>>({
    resolver: zodResolver(locationSchema),
    defaultValues: emptyValues,
  });

  // Set form values when initialData changes or component mounts
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        addressLine1: initialData.addressLine1,
        addressLine2: initialData.addressLine2 ?? "",
        state: initialData.state,
        city: initialData.city,
        zip: initialData.zip,
        country: initialData.country,
      });
    } else {
      form.reset(emptyValues);
    }
  }, [initialData, form]);

  const handleClose = () => {
    form.reset(emptyValues);
    onClose();
  };

  const onSubmit = async (data: z.infer<typeof locationSchema>) => {
    startTransition(async () => {
      try {
        if (initialData) {
          await updateLocation(initialData.id, data, {
            onSuccess: () => {
              toast.success("Location updated successfully");
              onSubmitSuccess?.();
              handleClose();
            },
            onError: (error: any) => {
              console.error("Location update error:", error);
              toast.error("Failed to update location");
            },
          });
        } else {
          await createLocation(data, {
            onSuccess: () => {
              toast.success("Location created successfully");
              onSubmitSuccess?.();
              handleClose();
            },
            onError: (error: any) => {
              console.error("Location creation error:", error);
              toast.error("Failed to create location");
            },
          });
        }
      } catch (error) {
        console.error("Location operation error:", error);
        toast.error(
          initialData
            ? "Failed to update location"
            : "Failed to create location",
        );
      }
    });
  };

  const isLoading = isPending || isCreating || isUpdating;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <CustomInput
          name="name"
          label="Location Name"
          control={form.control}
          type="text"
          placeholder="Enter location name"
          disabled={isLoading}
          required={true}
          tooltip="A unique name for this location"
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <CustomInput
            name="addressLine1"
            label="Address Line 1"
            control={form.control}
            type="text"
            placeholder="Enter street address"
            disabled={isLoading}
            required={true}
          />

          <CustomInput
            name="addressLine2"
            label="Address Line 2"
            control={form.control}
            type="text"
            placeholder="Apartment, suite, unit, etc. (optional)"
            disabled={isLoading}
          />

          <CustomInput
            name="city"
            label="City"
            control={form.control}
            type="text"
            placeholder="Enter city"
            disabled={isLoading}
            required={true}
          />

          <CustomInput
            name="state"
            label="State/Province"
            control={form.control}
            type="text"
            placeholder="Enter state or province"
            disabled={isLoading}
            required={true}
          />

          <CustomInput
            name="zip"
            label="Postal Code"
            control={form.control}
            type="text"
            placeholder="Enter postal code"
            disabled={isLoading}
            required={true}
          />

          <CustomInput
            name="country"
            label="Country"
            control={form.control}
            type="text"
            placeholder="Enter country"
            disabled={isLoading}
            required={true}
          />
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>

          <Button type="submit" disabled={isLoading} className="min-w-[120px]">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {initialData ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>{initialData ? "Update" : "Create"}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default LocationForm;
