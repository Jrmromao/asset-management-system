// hooks/useAssetForm.ts

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { assetSchema } from "@/lib/schemas";
import type {
  AssetFormValues,
  CustomFieldValues,
  FormTemplate,
} from "@/types/form";

export const useAssetForm = (isUpdate = false) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(
    null,
  );
  const [customFieldValues, setCustomFieldValues] = useState<CustomFieldValues>(
    {},
  );
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "status",
    "purchase",
  ]);

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: "",
      serialNumber: "",
      modelId: "",
      price: 0,
      statusLabelId: "",
      departmentId: "",
      inventoryId: "",
      locationId: "",
      supplierId: "",
      poNumber: "",
      weight: 0,
      material: "",
      energyRating: "",
      licenseId: "",
      dailyOperatingHours: "",
      formTemplateId: "",
      templateValues: {},
    },
  });

  const toggleSection = (e: React.MouseEvent, section: string) => {
    e.preventDefault();
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section],
    );
  };

  const handleTemplateChange = async (
    formTemplateId: string,
    formTemplates: FormTemplate[],
  ) => {
    try {
      if (!formTemplateId) {
        form.setValue("formTemplateId", "");
        form.setValue("templateValues", {});
        setSelectedTemplate(null);
        setCustomFieldValues({});
        return;
      }

      const selectedTemplate = formTemplates.find(
        (template) => template.id === formTemplateId,
      );

      if (!selectedTemplate?.fields) {
        toast.error("Template not found or invalid");
        return;
      }

      form.setValue("formTemplateId", formTemplateId);
      setSelectedTemplate(selectedTemplate);

      const emptyValues = selectedTemplate.fields.reduce<CustomFieldValues>(
        (acc, field) => ({
          ...acc,
          [field.name]: "",
        }),
        {},
      );

      form.setValue("templateValues", emptyValues);
      setCustomFieldValues(emptyValues);
    } catch (error) {
      toast.error("Failed to load template details");
      console.error("Error loading template:", error);
    }
  };

  const onSubmit = (createAsset: any) => {
    const submitHandler = async (data: AssetFormValues) => {
      startTransition(async () => {
        try {
          const formattedData = {
            ...data,
            purchaseDate: data.purchaseDate,
            endOfLife: data.endOfLife,
            weight: data.weight,
            ...(data.formTemplateId
              ? {
                  formTemplateId: data.formTemplateId,
                  templateValues: data.templateValues,
                }
              : {}),
          };

          await createAsset(formattedData, {
            onSuccess: () => {
              form.reset();
              toast.success("Asset created successfully");
              router.push("/assets");
            },
            onError: (error: any) => {
              toast.error("Something went wrong creating asset: " + error);
            },
          });
        } catch (error) {
          toast.error("Something went wrong");
          console.error(error);
        }
      });
    };

    return submitHandler;
  };

  const isSectionComplete = (section: string): boolean => {
    switch (section) {
      case "basic":
        return (
          !!form.watch("name") &&
          !!form.watch("serialNumber") &&
          !!form.watch("purchaseDate")
        );
      case "status":
        return true;
      case "purchase":
        return !!form.watch("price") && !!form.watch("endOfLife");
      case "physical":
      case "energy":
        return true;
      default:
        return false;
    }
  };

  return {
    form,
    isPending,
    selectedTemplate,
    expandedSections,
    customFieldValues,
    toggleSection,
    handleTemplateChange,
    onSubmit,
    isSectionComplete,
  };
};
