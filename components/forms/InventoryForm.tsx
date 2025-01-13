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
import { inventorySchema } from "@/lib/schemas";
import { useInventoryUIStore } from "@/lib/stores/useInventoryUIStore";
import { useInventoryQuery } from "@/hooks/queries/useInventoryQuery";

const CategoryForm = () => {
  const [isPending, startTransition] = useTransition();
  const { createInventory } = useInventoryQuery();
  const { onClose } = useInventoryUIStore();

  const form = useForm<z.infer<typeof inventorySchema>>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      name: "",
    },
  });

  async function onSubmit(data: z.infer<typeof inventorySchema>) {
    startTransition(async () => {
      try {
        await createInventory(data, {
          onSuccess: () => {
            onClose();
            form.reset();
            console.log("Successfully created Inventory");
          },
          onError: (error) => {
            console.error("Error creating Inventory:", error);
          },
        });
      } catch (error) {
        console.error("Inventory creation error:", error);
        toast.error("Failed to create Inventory");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <CustomInput
          name="name"
          label="Name"
          control={form.control}
          type="text"
          placeholder=""
          disabled={isPending}
          tooltip="A unique name for this Inventory"
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
