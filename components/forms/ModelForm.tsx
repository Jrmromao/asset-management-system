"use client";

import React, { startTransition } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2, Plus } from "lucide-react";
import CustomInput from "@/components/CustomInput";
import CustomSelect from "@/components/CustomSelect";
import { DialogContainer } from "@/components/dialogs/DialogContainer";
import ManufacturerForm from "@/components/forms/ManufacturerForm";
import { modelSchema } from "@/lib/schemas";
import { useModelUIStore } from "@/lib/stores/useModelUIStore";
import { useModelsQuery } from "@/hooks/queries/useModelsQuery";
import { FormProps } from "@/types/form";
import { toast } from "sonner";
import { useManufacturerQuery } from "@/hooks/queries";
import { useManufacturerUIStore } from "@/lib/stores";
import CustomSwitch from "@/components/CustomSwitch";

const ModelForm = ({ initialData, onSubmitSuccess }: FormProps<Model>) => {
  const { createModel, isCreating, updateModel, isUpdating } = useModelsQuery();
  const { manufacturers, isLoading: isLoadingManufacturers } = useManufacturerQuery();
  const { onClose } = useModelUIStore();
  const {
    isOpen: isManufacturerModalOpen,
    onOpen: openManufacturerModal,
    onClose: closeManufacturerModal,
  } = useManufacturerUIStore();

  const defaultValues = {
    name: initialData?.name ?? "",
    modelNo: initialData?.modelNo ?? "",
    manufacturerId: initialData?.manufacturerId ?? "",
    active: initialData?.active ?? true,
    endOfLife: undefined,
    notes: "",
  };

  const form = useForm<z.infer<typeof modelSchema>>({
    defaultValues,
    resolver: zodResolver(modelSchema),
  });

  const onSubmit = async (data: z.infer<typeof modelSchema>) => {
    // TODO: Remove all debug logging before production deployment
    console.log("=== Model Form Submission Debug Logs ===");
    console.log("Form Data:", data);

    if (!data.manufacturerId) {
      toast.error("Please select a manufacturer");
      return;
    }

    startTransition(async () => {
      try {
        const modelData = {
          name: data.name,
          modelNo: data.modelNo,
          manufacturerId: data.manufacturerId,
          active: data.active ?? true,
          endOfLife: data.endOfLife,
          notes: data.notes,
          imageUrl: data.imageUrl,
        };

        // TODO: Remove debug logging
        console.log("Processed Model Data:", {
          ...modelData,
          endOfLife: modelData.endOfLife?.toISOString(),
        });

        if (initialData) {
          // TODO: Remove debug logging
          console.log("Updating existing model:", initialData.id);

          const response = await updateModel(initialData.id, modelData, {
            onSuccess: () => {
              // TODO: Remove debug logging
              console.log("Model update succeeded");
              form.reset();
              onClose();
              toast.success("Model updated successfully");
              onSubmitSuccess?.();
            },
            onError: (error) => {
              // TODO: Remove debug logging
              console.error("Model update error:", {
                error,
                modelData,
                initialData,
              });
              toast.error(error.message || "Failed to update model");
            },
          });

          if (!response.success) {
            // TODO: Remove debug logging
            console.error("Model update failed:", {
              error: response.error,
              modelData,
              initialData,
            });
            toast.error(response.error || "Failed to update model");
          }
        } else {
          // TODO: Remove debug logging
          console.log("Creating new model");

          const response = await createModel(modelData, {
            onSuccess: () => {
              // TODO: Remove debug logging
              console.log("Model creation succeeded");
              onClose();
              form.reset();
              toast.success("Model created successfully");
              onSubmitSuccess?.();
            },
            onError: (error) => {
              // TODO: Remove debug logging
              console.error("Model creation error:", {
                error,
                modelData,
              });
              toast.error(error.message || "Failed to create model");
            },
          });

          if (!response.success) {
            // TODO: Remove debug logging
            console.error("Model creation failed:", {
              error: response.error,
              modelData,
            });
            toast.error(response.error || "Failed to create model");
          }
        }
      } catch (error) {
        // TODO: Remove debug logging
        console.error("Model operation error:", {
          error,
          isUpdate: !!initialData,
          modelData: data,
        });
        toast.error(`Failed to ${initialData ? "update" : "create"} Model`);
      }
    });
  };

  function handleCancel(e: React.MouseEvent) {
    e.preventDefault();
    onClose();
    form.reset();
  }

  if (isCreating || isUpdating) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <section className="w-full">
      <DialogContainer
        open={isManufacturerModalOpen}
        onOpenChange={closeManufacturerModal}
        title="Add Manufacturer"
        description="Add a new manufacturer to your inventory"
        form={<ManufacturerForm />}
      />

      {/* Main Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <CustomInput
              name="name"
              label="Model Name"
              control={form.control}
              placeholder="Enter model name"
              tooltip="The display name for this model"
              required
            />

            <CustomInput
              name="modelNo"
              label="Model Number"
              control={form.control}
              placeholder="Enter model number"
              tooltip="Unique identifier for this model"
              required
            />
          </div>

          {/* Manufacturer Selection */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="flex-1">
                <CustomSelect
                  control={form.control}
                  name="manufacturerId"
                  label="Manufacturer"
                  placeholder={
                    isLoadingManufacturers
                      ? "Loading manufacturers..."
                      : "Select manufacturer"
                  }
                  data={manufacturers || []}
                  value={form.watch("manufacturerId")}
                  isLoading={isLoadingManufacturers}
                  required
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="self-end h-10"
                onClick={() => openManufacturerModal()}
                disabled={isLoadingManufacturers}
              >
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <CustomSwitch
              label={"Is Active"}
              name={"active"}
              control={form.control}
              required={false}
            />
          </div>

          <div className="space-y-4">
            <CustomInput
              name="notes"
              label="Notes"
              control={form.control}
              type="textarea"
              placeholder="Enter any additional information"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="w-24"
              onClick={handleCancel}
              disabled={isCreating}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="w-24"
              disabled={isCreating || isLoadingManufacturers}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>{initialData ? "Update" : "Create"}</>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
};

export default ModelForm;
