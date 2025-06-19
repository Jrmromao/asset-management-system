"use client";

import React, { useCallback, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import CustomInput from "@/components/CustomInput";
import CustomColorPicker from "@/components/CustomColorPicker";
import CustomSwitch from "@/components/CustomSwitch";

import { statusLabelSchema } from "@/lib/schemas";
import { useStatusLabelsQuery } from "@/hooks/queries/useStatusLabelsQuery";
import type { StatusLabel } from "@prisma/client";

type FormValues = z.infer<typeof statusLabelSchema>;

interface StatusLabelFormProps {
  initialData?: StatusLabel;
  onClose: () => void;
  onSubmitSuccess?: () => void;
}

export default function StatusLabelForm({
  initialData,
  onClose,
  onSubmitSuccess,
}: StatusLabelFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createStatusLabel, updateStatusLabel } = useStatusLabelsQuery();

  const form = useForm<FormValues>({
    resolver: zodResolver(statusLabelSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      colorCode: initialData?.colorCode ?? "#000000",
      isArchived: initialData?.isArchived ?? false,
      allowLoan: initialData?.allowLoan ?? true,
    },
  });

  const handleSubmit = useCallback(
    async (data: FormValues) => {
      try {
        setIsSubmitting(true);
        const formData = {
          name: data.name,
          description: data.description,
          colorCode: data.colorCode ?? "#000000",
          isArchived: data.isArchived ?? false,
          allowLoan: data.allowLoan ?? true,
        };

        if (initialData) {
          await updateStatusLabel(initialData.id, formData, {
            onSuccess: () => {
              form.reset();
              onSubmitSuccess?.();
              onClose();
              toast.success("Status label updated successfully");
            },
            onError: (error: Error) => {
              toast.error(error.message || "Failed to update status label");
            },
          });
        } else {
          await createStatusLabel(formData, {
            onSuccess: () => {
              form.reset();
              onSubmitSuccess?.();
              onClose();
              toast.success("Status label created successfully");
            },
            onError: (error: Error) => {
              toast.error(error.message || "Failed to create status label");
            },
          });
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "An error occurred";
        toast.error(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      createStatusLabel,
      updateStatusLabel,
      initialData,
      form,
      onClose,
      onSubmitSuccess,
    ],
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <CustomInput
          control={form.control}
          name="name"
          label="Name"
          placeholder="Enter status label name"
          disabled={isSubmitting}
        />

        <CustomInput
          control={form.control}
          name="description"
          label="Description"
          placeholder="Enter status label description"
          disabled={isSubmitting}
        />

        <CustomColorPicker
          control={form.control}
          name="colorCode"
          label="Color"
          disabled={isSubmitting}
        />

        <CustomSwitch
          control={form.control}
          name="isArchived"
          label="Archived"
          disabled={isSubmitting}
        />

        <CustomSwitch
          control={form.control}
          name="allowLoan"
          label="Allow Loan"
          disabled={isSubmitting}
        />

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
