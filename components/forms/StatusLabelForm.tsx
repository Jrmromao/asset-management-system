"use client";

import React, { useCallback } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { StatusLabel } from "@prisma/client";

import CustomInput from "@/components/CustomInput";
import CustomColorPicker from "@/components/CustomColorPicker";
import CustomSwitch from "@/components/CustomSwitch";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { statusLabelSchema } from "@/lib/schemas";
import { useStatusLabelsQuery } from "@/hooks/queries/useStatusLabelsQuery";
import { useStatusLabelUIStore } from "@/lib/stores/useStatusLabelUIStore";
import { useRealTimeValidation } from "@/hooks/useRealTimeValidation";

type FormValues = z.infer<typeof statusLabelSchema>;

interface StatusLabelFormProps {
  initialData?: StatusLabel;
  onSubmitSuccess?: () => void;
}

export default function StatusLabelForm({
  initialData,
  onSubmitSuccess,
}: StatusLabelFormProps) {
  const { onClose } = useStatusLabelUIStore();
  const { createStatusLabel, updateStatusLabel, isCreating, isUpdating } =
    useStatusLabelsQuery();

  const form = useForm<FormValues & { active?: boolean }>({
    resolver: zodResolver(statusLabelSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      colorCode: initialData?.colorCode ?? "#000000",
      isArchived: initialData?.isArchived ?? false,
      allowLoan: initialData?.allowLoan ?? true,
      active: initialData?.active ?? true,
    },
  });

  const initialName = initialData?.name ?? "";
  const watchedName = form.watch("name");
  const shouldValidateName = watchedName !== initialName;

  const {
    isValid: isNameUnique,
    message: nameErrorMessage,
    isChecking: isNameChecking,
  } = useRealTimeValidation({
    endpoint: "status-label",
    field: "Name",
    value: watchedName,
    excludeId: initialData?.id,
    enabled: shouldValidateName,
  });

  const isLoading = isCreating || isUpdating;

  const handleSubmit = useCallback(
    async (data: FormValues) => {
      try {
        if (initialData) {
          await updateStatusLabel(initialData.id, data);
          toast.success("Status label updated");
        } else {
          await createStatusLabel(data);
          toast.success("Status label created");
        }
        onSubmitSuccess?.();
        onClose();
      } catch (error) {
        toast.error("An error occurred. Please try again.");
      }
    },
    [
      initialData,
      updateStatusLabel,
      createStatusLabel,
      onSubmitSuccess,
      onClose,
    ],
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <CustomInput
                  {...field}
                  control={form.control}
                  label="Name"
                  placeholder="Enter status label name"
                  disabled={isLoading}
                  required
                />
              </FormControl>
              {shouldValidateName && isNameChecking && (
                <p className="text-sm text-gray-500">Checking...</p>
              )}
              {shouldValidateName && !isNameUnique && (
                <p className="text-sm font-medium text-destructive">
                  {nameErrorMessage}
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <CustomInput
          control={form.control}
          name="description"
          label="Description"
          placeholder="Enter status label description"
          disabled={isLoading}
        />

        <CustomColorPicker
          control={form.control}
          name="colorCode"
          label="Color"
          disabled={isLoading}
          required
        />

        <CustomSwitch
          control={form.control}
          name="isArchived"
          label="Archived"
          disabled={isLoading}
        />

        <CustomSwitch
          control={form.control}
          name="allowLoan"
          label="Allow Loan"
          disabled={isLoading}
        />

        {initialData && (
          <CustomSwitch
            control={form.control}
            name="active"
            label="Is Active"
            disabled={isLoading}
          />
        )}

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || (shouldValidateName && (isNameChecking || !isNameUnique))}
          >
            {isLoading || (shouldValidateName && isNameChecking) ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {shouldValidateName && isNameChecking
              ? "Validating..."
              : initialData
                ? "Update"
                : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
