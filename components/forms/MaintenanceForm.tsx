"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { createMaintenanceEvent } from "@/lib/actions/maintenance.actions";
import { toast } from "sonner";
import CustomDatePicker from "@/components/CustomDatePicker";
import { SearchableSelect, SearchableSelectItem } from "./SearchableSelect";
import { useEffect, useState } from "react";
import { getAllAssets } from "@/lib/actions/assets.actions";
import { getAllStatusLabels } from "@/lib/actions/statusLabel.actions";
import { Asset } from "@/types/asset";

const maintenanceFormSchema = z.object({
  assetId: z.string().min(1, "Asset is required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  notes: z.string().optional(),
  startDate: z.date({
    required_error: "A start date is required.",
  }),
  isWarranty: z.boolean().default(false),
});

type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>;

interface MaintenanceFormProps {
  onSuccess?: () => void;
  preselectedAssetId?: string;
}

export const MaintenanceForm = ({
  onSuccess,
  preselectedAssetId,
}: MaintenanceFormProps) => {
  const [assets, setAssets] = useState<SearchableSelectItem[]>([]);
  const [statusLabels, setStatusLabels] = useState<SearchableSelectItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch assets
      const assetResponse = await getAllAssets();
      if (assetResponse.success && assetResponse.data) {
        setAssets(
          assetResponse.data.map((asset: Asset) => ({
            value: asset.id,
            label: asset.name,
            secondaryLabel: asset.assetTag,
          })),
        );
      }

      // Fetch status labels
      const statusResponse = await getAllStatusLabels();
      if (statusResponse.success && statusResponse.data) {
        setStatusLabels(
          statusResponse.data.map((label: any) => ({
            value: label.id,
            label: label.name,
          })),
        );
      }
    };
    fetchData();
  }, []);

  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      isWarranty: false,
      assetId: preselectedAssetId || "",
    },
  });

  const onSubmit = async (values: MaintenanceFormValues) => {
    const response = await createMaintenanceEvent(values);
    if (response.success) {
      toast.success("Maintenance event created successfully!");
      form.reset();
      onSuccess?.();
    } else {
      toast.error(response.error || "Failed to create maintenance event.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <SearchableSelect
          name="assetId"
          label="Asset"
          placeholder="Select an asset"
          searchPlaceholder="Search assets..."
          notFoundText="No assets found."
          items={assets}
          form={form}
          required
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Screen Replacement" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <CustomDatePicker
          name="startDate"
          label="Start Date"
          form={form}
          required
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maintenance Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the work performed, parts used, etc. This will be used for AI carbon analysis."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isWarranty"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Under Warranty</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit">Create Maintenance Event</Button>
      </form>
    </Form>
  );
};
