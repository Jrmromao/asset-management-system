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
import { FormProps } from "@/types/form";

const InventoryForm = ({
  initialData,
  onSubmitSuccess,
}: FormProps<Inventory>) => {
  const [isPending, startTransition] = useTransition();
  const { createInventory, updateInventory } = useInventoryQuery();
  const { onClose } = useInventoryUIStore();

  const defaultValues = {
    name: initialData?.name ?? "",
  };

  const form = useForm<z.infer<typeof inventorySchema>>({
    resolver: zodResolver(inventorySchema),
    defaultValues,
  });

  async function onSubmit(data: z.infer<typeof inventorySchema>) {
    startTransition(async () => {
      try {
        if (initialData && initialData.id) {
          await updateInventory(
            initialData.id,
            { ...data },
            {
              onSuccess: () => {
                onClose();
                form.reset();
                toast.success("Successfully updated inventory");
                onSubmitSuccess?.();
              },
              onError: (error: any) => {
                console.error("Error updating inventory:", error);
                toast.error("Failed to update inventory");
              },
            },
          );
        } else {
          // Create new inventory
          await createInventory(data, {
            onSuccess: () => {
              onClose();
              form.reset();
              toast.success("Successfully created inventory");
              onSubmitSuccess?.();
            },
            onError: (error) => {
              console.error("Error creating inventory:", error);
              toast.error("Failed to create inventory");
            },
          });
        }
      } catch (error) {
        console.error("Inventory operation error:", error);
        toast.error(`Failed to ${initialData ? "update" : "create"} inventory`);
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
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>

          <Button type="submit" disabled={isPending} className="min-w-[120px]">
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {initialData ? "Updating..." : "Creating..."}
              </>
            ) : initialData ? (
              "Update"
            ) : (
              "Create"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default InventoryForm;
