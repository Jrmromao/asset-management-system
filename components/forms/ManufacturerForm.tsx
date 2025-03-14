"use client";

import React, { useTransition } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import CustomInput from "@/components/CustomInput";
import { manufacturerSchema } from "@/lib/schemas";
import { toast } from "sonner";
import { FormProps } from "@/types/form";
import { useManufacturerUIStore } from "@/lib/stores";
import { useManufacturerQuery } from "@/hooks/queries";

const ManufacturerForm = ({
  initialData,
  onSubmitSuccess,
}: FormProps<Manufacturer>) => {
  const [isPending, startTransition] = useTransition();
  const { createManufacturer, isCreating, updateManufacturer, isUpdating } =
    useManufacturerQuery();
  const { onClose } = useManufacturerUIStore();

  const form = useForm<z.infer<typeof manufacturerSchema>>({
    resolver: zodResolver(manufacturerSchema),
    defaultValues: {
      name: initialData?.name || "",
      url: initialData?.url || "",
      supportUrl: initialData?.supportUrl || "",
      supportPhone: initialData?.supportPhone || "",
      supportEmail: initialData?.supportEmail || "",
    },
  });

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    form.reset();
    onClose();
  };

  async function onSubmit(data: z.infer<typeof manufacturerSchema>) {
    startTransition(async () => {
      try {
        if (initialData) {
          await updateManufacturer(initialData.id, data, {
            onSuccess: () => {
              onSubmitSuccess?.();
              onClose();
              form.reset();
            },
          });
        } else {
          await createManufacturer(data, {
            onSuccess: () => {
              onClose();
              form.reset();
            },
          });
        }
      } catch (error) {
        toast.error("Something went wrong");
        console.error(error);
      }
    });
  }

  if (isCreating || isUpdating) {
    return <p className="text-center">Saving...</p>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <CustomInput
          type="text"
          name="name"
          label="Name"
          placeholder="Enter manufacturer name"
          control={form.control}
        />

        <CustomInput
          type="text"
          name="url"
          label="URL"
          placeholder="Enter manufacturer URL"
          control={form.control}
        />

        <CustomInput
          type="text"
          name="supportUrl"
          label="Support URL"
          placeholder="Enter support URL"
          control={form.control}
        />

        <CustomInput
          type="text"
          name="supportPhone"
          label="Support Phone"
          placeholder="Enter support phone"
          control={form.control}
        />

        <CustomInput
          name="supportEmail"
          label="Support Email"
          placeholder="Enter support email"
          control={form.control}
          type="email"
        />

        <div className="flex space-x-2">
          <Button type="submit" className="w-24" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>{initialData ? "Update" : "Create"}</>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-24"
            onClick={handleCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ManufacturerForm;
