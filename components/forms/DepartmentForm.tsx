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
import { departmentSchema } from "@/lib/schemas";
import { useDepartmentUIStore } from "@/lib/stores/useDepartmentUIStore";
import { useDepartmentQuery } from "@/hooks/queries/useDepartmentQuery";

const DepartmentForm = () => {
  const [isPending, startTransition] = useTransition();
  const { onClose } = useDepartmentUIStore();
  const { createDepartment } = useDepartmentQuery();

  const form = useForm<z.infer<typeof departmentSchema>>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof departmentSchema>) => {
    startTransition(async () => {
      try {
        await createDepartment(data, {
          onSuccess: () => {
            toast.success("Department created successfully");
            onClose();
            form.reset();
          },
          onError: (error: any) => {
            console.error("Error creating department:", error);
          },
        });
      } catch (error) {
        console.error("Department creation error:", error);
        toast.error("Failed to create department");
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <CustomInput
          name="name"
          label="Name"
          control={form.control}
          type="text"
          placeholder="Enter department name"
          disabled={isPending}
          tooltip="A unique name for this department."
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

export default DepartmentForm;
