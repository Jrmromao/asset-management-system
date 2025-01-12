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
import { useManufacturerStore } from "@/lib/stores/manufacturerStore";
import { modelSchema } from "@/lib/schemas";
import { useModelUIStore } from "@/lib/stores/useModelUIStore";
import { useModelsQuery } from "@/hooks/queries/useModelsQuery";

const ModelForm = () => {
  const { createModel, isCreating } = useModelsQuery();
  const { onClose } = useModelUIStore();

  // Manufacturer store
  const {
    isOpen: manufacturerIsOpen,
    onClose: closeManufacturerModal,
    onOpen: openManufacturerModal,
    manufacturers,
    getAll: fetchManufacturers,
  } = useManufacturerStore();

  const form = useForm<z.infer<typeof modelSchema>>({
    resolver: zodResolver(modelSchema),
    defaultValues: {
      name: "",
      modelNo: "",
      manufacturerId: "",
      endOfLife: undefined,
      notes: "",
    },
  });

  // Fetch initial data
  React.useEffect(() => {
    fetchManufacturers();
  }, [fetchManufacturers]);

  const onSubmit = async (data: z.infer<typeof modelSchema>) => {
    startTransition(async () => {
      createModel(
        {
          name: data.name,
          modelNo: data.modelNo,
          manufacturerId: data.manufacturerId,
          categoryId: "",
        },
        {
          onSuccess: () => {
            form.reset();
            onClose();
            console.log("Successfully created model");
          },
          onError: (error) => {
            console.error("Error creating model:", error);
          },
        },
      );
    });
  };

  function handleCancel(e: React.MouseEvent) {
    e.preventDefault();
    onClose();
    form.reset();
  }

  return (
    <section className="w-full">
      <DialogContainer
        open={manufacturerIsOpen}
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
            />

            <CustomInput
              name="modelNo"
              label="Model Number"
              control={form.control}
              placeholder="Enter model number"
              tooltip="Unique identifier for this model"
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
                  placeholder="Select manufacturer"
                  data={manufacturers}
                  value={form.watch("manufacturerId")}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="self-end h-10"
                onClick={() => openManufacturerModal()}
              >
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </div>
          </div>

          {/* Dates and Additional Info */}
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

            <Button type="submit" className="w-24" disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
};

export default ModelForm;
