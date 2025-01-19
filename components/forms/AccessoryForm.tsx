"use client";

import React, { useState, useTransition } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, Info } from "lucide-react";

// Imports from previous component
import { useCategoryUIStore } from "@/lib/stores/useCategoryUIStore";
import { useStatusLabelUIStore } from "@/lib/stores/useStatusLabelUIStore";
import { accessorySchema } from "@/lib/schemas";
import { useStatusLabelsQuery } from "@/hooks/queries/useStatusLabelsQuery";
import { useSupplierQuery } from "@/hooks/queries/useSupplierQuery";
import { useSupplierUIStore } from "@/lib/stores/useSupplierUIStore";
import { useInventoryUIStore } from "@/lib/stores/useInventoryUIStore";
import { useCategoryQuery } from "@/hooks/queries/useCategoryQuery";
import { useDepartmentQuery } from "@/hooks/queries/useDepartmentQuery";
import { useDepartmentUIStore } from "@/lib/stores/useDepartmentUIStore";
import { useLocationUIStore } from "@/lib/stores/useLocationUIStore";
import { useLocationQuery } from "@/hooks/queries/useLocationQuery";
import { useInventoryQuery } from "@/hooks/queries/useInventoryQuery";
import { useAccessoryQuery } from "@/hooks/queries/useAccessoryQuery";

// UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { SelectWithButton } from "@/components/SelectWithButton";
import CustomInput from "@/components/CustomInput";
import CustomDatePicker from "@/components/CustomDatePicker";
import CustomPriceInput from "@/components/CustomPriceInput";
import { FormContainer } from "@/components/forms/FormContainer";
import ActionFooter from "@/components/forms/ActionFooter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import FormSection from "@/components/forms/FormSection";
import MainFormSkeleton from "@/components/forms/MainFormSkeleton";
import FormProgressSkeleton from "@/components/forms/FormProgressSkeleton";
import { FormProgress } from "@/components/forms/FormProgress";

type AccessoryFormValues = z.infer<typeof accessorySchema>;

// Enhanced CollapsibleSection component
const CollapsibleSection = ({
  title,
  description,
  children,
  isExpanded,
  onToggle,
  isComplete = false,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  isComplete?: boolean;
}) => (
  <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-2 h-2 rounded-full ${
            isComplete ? "bg-green-500" : "bg-slate-200"
          }`}
        />
        <div>
          <h2 className="text-base font-medium">{title}</h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <div
        className={`transform transition-transform duration-200 ${
          isExpanded ? "rotate-180" : ""
        }`}
      >
        <ChevronDown className="h-5 w-5 text-slate-400" />
      </div>
    </button>

    <div
      className={`transition-all duration-300 ${
        isExpanded
          ? "max-h-[2000px] opacity-100"
          : "max-h-0 opacity-0 overflow-hidden"
      }`}
    >
      <div className="p-6 border-t">{children}</div>
    </div>
  </div>
);

// Progress Indicator

const AccessoryForm = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // State for collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    basicInfo: true,
    statusLocation: false,
    purchaseInfo: false,
    inventoryManagement: false,
    notes: false,
  });

  // Queries and UI stores (kept from original implementation)
  const { statusLabels, isLoading: isLoadingStatusLabels } =
    useStatusLabelsQuery();
  const { createAccessory } = useAccessoryQuery();
  const { suppliers } = useSupplierQuery();
  const { inventories } = useInventoryQuery();
  const { categories } = useCategoryQuery();
  const { departments } = useDepartmentQuery();
  const { locations } = useLocationQuery();

  // UI Store Actions
  const { onOpen: openSupplier } = useSupplierUIStore();
  const { onOpen: openInventory } = useInventoryUIStore();
  const { onOpen: openCategory } = useCategoryUIStore();
  const { onOpen: openDepartment } = useDepartmentUIStore();
  const { onOpen: openStatus } = useStatusLabelUIStore();
  const { onOpen: openLocation } = useLocationUIStore();

  // Form setup
  const form = useForm<AccessoryFormValues>({
    resolver: zodResolver(accessorySchema),
    defaultValues: {
      name: "",
      serialNumber: "",
      supplierId: "",
      modelNumber: "",
      locationId: "",
      inventoryId: "",
      poNumber: "",
      alertEmail: "",
      material: "",
      statusLabelId: "",
      notes: "",
      categoryId: "",
    },
  });

  // Submit handler
  const onSubmit = async (data: AccessoryFormValues) => {
    startTransition(async () => {
      try {
        await createAccessory(data, {
          onSuccess: () => {
            form.reset();
            toast.success("Accessory created successfully");
            router.push("/accessories");
          },
          onError: (error) => {
            toast.error("Something went wrong");
            console.error(error);
          },
        });
      } catch (error) {
        toast.error("Something went wrong");
        console.error(error);
      }
    });
  };

  return (
    <FormContainer form={form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="max-w-[1200px] mx-auto px-4 py-6">
            <div className="grid grid-cols-12 gap-6">
              {isPending ? (
                <MainFormSkeleton />
              ) : (
                <div className="col-span-12 lg:col-span-8 space-y-6">
                  <Card className={"bg-white"}>
                    <CardContent className="divide-y divide-slate-100">
                      <FormSection title="Basic Information">
                        <SelectWithButton
                          name="categoryId"
                          label="Category"
                          form={form}
                          required
                          onNew={openCategory}
                          data={categories}
                          placeholder="Select category"
                          isPending={isPending}
                        />

                        {/* Basic Information */}

                        <div className="grid gap-4 md:grid-cols-2">
                          <CustomInput
                            required
                            name="name"
                            label="Name"
                            control={form.control}
                            type="text"
                          />
                          <CustomInput
                            required
                            name="serialNumber"
                            label="Serial Number"
                            control={form.control}
                            type="text"
                          />
                        </div>
                        <CustomInput
                          name="modelNumber"
                          label="Model Number"
                          control={form.control}
                          type="text"
                          className="md:col-span-2"
                          required
                        />
                      </FormSection>

                      <FormSection title="Status & Location">
                        <SelectWithButton
                          name="statusLabelId"
                          label="Status"
                          form={form}
                          required
                          onNew={openStatus}
                          data={statusLabels}
                          placeholder="Select status"
                          isPending={isPending}
                        />
                        <SelectWithButton
                          name="departmentId"
                          label="Department"
                          form={form}
                          required
                          onNew={openDepartment}
                          data={departments}
                          placeholder="Select department"
                          isPending={isPending}
                        />
                        <SelectWithButton
                          name="locationId"
                          label="Location"
                          form={form}
                          required
                          onNew={openLocation}
                          data={locations}
                          placeholder="Select location"
                          isPending={isPending}
                        />
                        {/*<div className="grid gap-4 md:grid-cols-2">*/}
                        {/*  <CustomInput*/}
                        {/*    required*/}
                        {/*    name="material"*/}
                        {/*    label="Material"*/}
                        {/*    control={form.control}*/}
                        {/*  />*/}
                        {/*  <CustomInput*/}
                        {/*    name="weight"*/}
                        {/*    label="Weight (kg)"*/}
                        {/*    control={form.control}*/}
                        {/*    type="number"*/}
                        {/*    required*/}
                        {/*  />*/}
                        {/*</div>*/}
                      </FormSection>

                      {/* Purchase Information */}

                      <FormSection title={"Purchase Information"}>
                        <div className="grid gap-4 md:grid-cols-2">
                          <CustomInput
                            name="poNumber"
                            label="PO Number"
                            control={form.control}
                          />
                          <CustomPriceInput
                            name="price"
                            label="Unit Price"
                            control={form.control}
                            required
                          />
                          <CustomDatePicker
                            name="purchaseDate"
                            form={form}
                            label="Purchase Date"
                          />
                          <CustomDatePicker
                            name="endOfLife"
                            form={form}
                            label="End of Life"
                          />
                        </div>
                        <SelectWithButton
                          name="supplierId"
                          label="Supplier"
                          form={form}
                          data={suppliers}
                          onNew={openSupplier}
                          placeholder={""}
                          isPending={isPending}
                        />
                      </FormSection>

                      <FormSection title={"Inventory Information"}>
                        <SelectWithButton
                          name="inventoryId"
                          label="Inventory"
                          form={form}
                          required
                          onNew={openInventory}
                          data={inventories}
                          placeholder="Select inventory"
                          isPending={isPending}
                        />

                        {/* Quantity and Email Grid */}
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-6">
                            <CustomInput
                              name="totalQuantity"
                              label="Total Quantity"
                              control={form.control}
                              type="number"
                              required
                            />

                            <CustomInput
                              name="alertEmail"
                              label="Alert Email"
                              control={form.control}
                              type="email"
                              required
                            />
                          </div>

                          <div className="space-y-6">
                            <CustomInput
                              name="reoderPoint"
                              label="Reorder Point"
                              control={form.control}
                              type="number"
                              required
                            />
                            <Alert className="bg-blue-50 border-blue-200">
                              <Info className="text-blue-500" />
                              <AlertTitle className="text-blue-800 font-medium">
                                Inventory Alert Settings
                              </AlertTitle>
                              <AlertDescription className="text-blue-600 mt-1">
                                System will notify when inventory reaches
                                minimum quantity or reorder point.
                              </AlertDescription>
                            </Alert>
                          </div>
                        </div>
                      </FormSection>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Right Sidebar - Form Progress */}
              {isPending ? (
                <FormProgressSkeleton />
              ) : (
                <FormProgress
                  sections={[
                    {
                      name: "Category",
                      isValid: !!form.watch("categoryId"),
                    },
                    {
                      name: "Basic Information",
                      isValid:
                        !!form.watch("name") && !!form.watch("serialNumber"),
                    },
                    {
                      name: "Status & Location",
                      isValid:
                        !!form.watch("statusLabelId") &&
                        !!form.watch("locationId"),
                    },
                    {
                      name: "Purchase Information",
                      isValid: !!form.watch("price"),
                    },
                    {
                      name: "Inventory Management",
                      isValid: !!form.watch("inventoryId"),
                    },
                  ]}
                />
              )}
            </div>
          </div>

          <ActionFooter form={form} isPending={isPending} router={router} />
        </form>
      </Form>
    </FormContainer>
  );
};

export default AccessoryForm;
