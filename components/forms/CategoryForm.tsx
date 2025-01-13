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
import { categorySchema } from "@/lib/schemas";
import { insert } from "@/lib/actions/category.actions";
import { useCategoryUIStore } from "@/lib/stores/useCategoryUIStore";

const CategoryForm = () => {
  const [isPending, startTransition] = useTransition();
  const { onClose } = useCategoryUIStore();

  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
    },
  });

  async function onSubmit(data: z.infer<typeof categorySchema>) {
    startTransition(async () => {
      try {
        const result = await insert(data);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        toast.success("Category created successfully");
        onClose();
        form.reset();
      } catch (error) {
        console.error("Category creation error:", error);
        toast.error("Failed to create category");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <CustomInput
          name="name"
          label="Category Name"
          control={form.control}
          type="text"
          placeholder="Enter category name"
          disabled={isPending}
          tooltip="A unique name for this category"
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

export default CategoryForm;
