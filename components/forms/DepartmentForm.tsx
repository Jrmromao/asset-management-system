"use client";

import React, { useTransition, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import CustomInput from "@/components/CustomInput";
import { departmentSchema } from "@/lib/schemas";
import { useDepartmentUIStore } from "@/lib/stores/useDepartmentUIStore";
import { useDepartmentQuery } from "@/hooks/queries/useDepartmentQuery";
import { FormProps } from "@/types/form";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const DepartmentForm = ({
  initialData,
  onSubmitSuccess,
}: FormProps<Department>) => {
  const [isPending, startTransition] = useTransition();
  const { onClose } = useDepartmentUIStore();
  const { createDepartment, updateDepartment, isCreating, isUpdating} =
    useDepartmentQuery();
  
  const { onClose: closeDepartment } = useDepartmentUIStore();

  const form = useForm<z.infer<typeof departmentSchema> & { active: boolean }>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: initialData?.name || "",
      active: initialData?.active ?? true,
    },
  });

  const onSubmit = async (data: z.infer<typeof departmentSchema> & { active: boolean }) => {
    startTransition(async () => {
      try {
        if (initialData) {
          await updateDepartment(initialData.id, data, {
            onSuccess: () => {
              toast.success("Department updated successfully");
              onSubmitSuccess?.();
              form.reset();
            },
            onError: (error: any) => {
              console.error("Error updating department:", error);
              toast.error("Failed to update department");
            },
          });
        } else {
          await createDepartment(data, {
            onSuccess: () => {
              toast.success("Department created successfully");
              onSubmitSuccess?.();
              form.reset();
            },
            onError: (error: any) => {
              console.error("Error creating department:", error);
              toast.error("Failed to create department");
            },
          });
        }
      } catch (error) {
        console.error("Department operation error:", error);
        toast.error(
          initialData
            ? "Failed to update department"
            : "Failed to create department",
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
          label="Name"
          control={form.control}
          type="text"
          required
          placeholder="Enter department name"
          disabled={isLoading}
          tooltip="A unique name for this department."
        />

        {initialData && (
          <div className="flex items-center gap-3 pt-4">
            <Label htmlFor="active-toggle">Is Active</Label>
            <Switch
              id="active-toggle"
              checked={form.watch("active")}
              onCheckedChange={(checked: boolean) => form.setValue("active", checked)}
              disabled={isLoading}
            />
          </div>
        )}

        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
              onClose();
            }}
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

export default DepartmentForm;
