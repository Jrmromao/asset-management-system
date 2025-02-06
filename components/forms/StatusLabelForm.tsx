"use client";

import React, { startTransition } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2 } from "lucide-react";

import CustomInput from "@/components/CustomInput";
import CustomColorPicker from "@/components/CustomColorPicker";
import CustomSwitch from "@/components/CustomSwitch";

import { statusLabelSchema } from "@/lib/schemas";
import { useStatusLabelUIStore } from "@/lib/stores/useStatusLabelUIStore";
import { useStatusLabelsQuery } from "@/hooks/queries/useStatusLabelsQuery";
import { FormProps } from "@/types/form"; // Keep for UI state only

type FormValues = z.infer<typeof statusLabelSchema>;

const StatusLabelForm = ({
  initialData,
  onSubmitSuccess,
}: FormProps<StatusLabel>) => {
  const { createStatusLabel, isCreating, updateStatusLabel, isUpdating } =
    useStatusLabelsQuery();

  const { onClose } = useStatusLabelUIStore();

  const form = useForm<FormValues>({
    resolver: zodResolver(statusLabelSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      colorCode: initialData?.colorCode || "#000000",
      isArchived: initialData?.isArchived || false,
      allowLoan: initialData?.allowLoan || true,
    },
  });

  async function onSubmit(data: FormValues) {
    startTransition(async () => {
      if (initialData) {
        await updateStatusLabel(initialData.id, data, {
          onSuccess: () => {
            onSubmitSuccess?.();
            onClose();
            form.reset();
          },
        });
      }
      await createStatusLabel(
        {
          name: data.name,
          description: data.description,
          colorCode: data.colorCode ?? "", // Ensure a default value for colorCode
          isArchived: data.isArchived ?? false,
          allowLoan: data.allowLoan ?? true,
        },
        {
          onSuccess: () => {
            form.reset();
            onClose();
            console.log("Successfully created status label");
          },
          onError: (error) => {
            console.error("Error creating status label:", error);
          },
        },
      );
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <CustomInput
            name="name"
            label="Name"
            control={form.control}
            placeholder="eg. Available"
          />

          <CustomInput
            type="textarea"
            name="description"
            label="Description"
            control={form.control}
            placeholder="eg. Asset is available for use"
          />

          <div className="grid grid-cols-2 gap-4">
            <CustomSwitch
              name="isArchived"
              label="Is Archivable"
              control={form.control}
            />

            <CustomSwitch
              name="allowLoan"
              label="Allow Loan"
              control={form.control}
            />
          </div>

          <CustomColorPicker
            name="colorCode"
            label="Status Color"
            control={form.control}
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
            disabled={isCreating}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={isCreating || !form.formState.isValid}
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
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

export default StatusLabelForm;
