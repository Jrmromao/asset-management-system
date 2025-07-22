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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const InventoryForm = ({
  initialData,
  onSubmitSuccess,
}: FormProps<Inventory>) => {
  const [isPending, startTransition] = useTransition();
  const { createInventory, updateInventory } = useInventoryQuery();
  const { onClose } = useInventoryUIStore();

  const defaultValues = {
    name: initialData?.name ?? "",
    active: initialData?.active ?? true,
  };

  const form = useForm<z.infer<typeof inventorySchema> & { active: boolean }>({
    resolver: zodResolver(inventorySchema),
    defaultValues,
  });

  async function onSubmit(data: z.infer<typeof inventorySchema> & { active: boolean }) {
    console.log("🔍 [InventoryForm] onSubmit - Starting with data:", data);

    startTransition(async () => {
      try {
        if (initialData && initialData.id) {
          console.log(
            "🔍 [InventoryForm] onSubmit - Updating existing inventory:",
            initialData.id,
          );
          await updateInventory(
            initialData.id,
            { ...data },
            {
              onSuccess: () => {
                console.log("✅ [InventoryForm] onSubmit - Update successful");
                onClose();
                form.reset();
                toast.success("Successfully updated inventory");
                onSubmitSuccess?.();
              },
              onError: (error: any) => {
                console.error(
                  "❌ [InventoryForm] onSubmit - Update error:",
                  error,
                );
                toast.error("Failed to update inventory");
              },
            },
          );
        } else {
          console.log("🔍 [InventoryForm] onSubmit - Creating new inventory");
          // Create new inventory
          await createInventory(data, {
            onSuccess: () => {
              console.log("✅ [InventoryForm] onSubmit - Create successful");
              onClose();
              form.reset();
              toast.success("Successfully created inventory");
              onSubmitSuccess?.();
            },
            onError: (error) => {
              console.error(
                "❌ [InventoryForm] onSubmit - Create error:",
                error,
              );
              toast.error("Failed to create inventory");
            },
          });
        }
      } catch (error) {
        console.error("❌ [InventoryForm] onSubmit - Operation error:", error);
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

        {initialData && (
          <div className="flex items-center gap-3 pt-4">
            <Label htmlFor="active-toggle">Is Active</Label>
            <Switch
              id="active-toggle"
              checked={form.watch("active")}
              onCheckedChange={(checked: boolean) => form.setValue("active", checked)}
              disabled={isPending}
            />
          </div>
        )}

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
