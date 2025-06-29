"use client";
import React, { useTransition, useEffect } from "react";
import { z } from "zod";
import {
  useFieldArray,
  useForm,
  UseFormReturn,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { GripVertical, Loader2, Plus, Trash2, Download } from "lucide-react";
import { toast } from "sonner";
import CustomInput from "@/components/CustomInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useFormTemplateUIStore } from "@/lib/stores/useFormTemplateUIStore";
import { useFormTemplatesQuery } from "@/hooks/queries/useFormTemplatesQuery";
import {
  CustomField,
  FormProps,
  FormTemplate as BaseFormTemplate,
} from "@/types/form";
import { createTemplateSchema } from "@/lib/schemas";
import { useCategoryQuery } from "@/hooks/queries/useCategoryQuery";
import { SelectWithButton } from "@/components/SelectWithButton";
import { useCategoryUIStore } from "@/lib/stores/useCategoryUIStore";

const fieldTypes = ["number", "text", "select", "date", "checkbox"] as const;

type FieldType = (typeof fieldTypes)[number];

const formFieldSchema = z.object({
  name: z.string().min(1, "Field name is required"),
  label: z.string().min(1, "Field label is required"),
  type: z.enum(["number", "text", "select", "date", "checkbox"]),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  categoryId: z.string().min(1, "Category is required"),
  placeholder: z.string().optional(),
  showIf: z.record(z.array(z.string())).optional(),
});

const formTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  fields: z.array(formFieldSchema),
  categoryId: z.string().min(1, "Category is required"),
});

type FormTemplateValues = z.infer<typeof createTemplateSchema> & {
  categoryId: string;
};
type FormFieldValues = z.infer<typeof formFieldSchema>;

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "select", label: "Dropdown" },
  { value: "checkbox", label: "Checkbox" },
  { value: "date", label: "Date" },
] as const;

interface SortableFieldProps {
  id: string;
  index: number;
  field: CustomField;
  form: UseFormReturn<FormTemplateValues>;
  isPending: boolean;
  onRemove: () => void;
}

const SortableField = ({
  id,
  index,
  field,
  form,
  isPending,
  onRemove,
}: SortableFieldProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Use useWatch for conditional rendering
  const fieldType = useWatch({
    control: form.control,
    name: `fields.${index}.type`,
  });

  const fieldOptions = useWatch({
    control: form.control,
    name: `fields.${index}.options`,
  });

  const isRequired = useWatch({
    control: form.control,
    name: `fields.${index}.required`,
  });

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-lg p-4 bg-white ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div {...attributes} {...listeners} className="cursor-grab">
              <GripVertical className="w-4 h-4 text-gray-400" />
            </div>
            <span className="font-medium">Field {index + 1}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            disabled={isPending}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-x-6">
          <div className="space-y-2">
            <Label>Field Name</Label>
            <CustomInput
              name={`fields.${index}.name`}
              label="Field Name"
              control={form.control}
              type="text"
              placeholder="Enter Field Name"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label>Field Type</Label>
            <Select
              value={fieldType}
              onValueChange={(value: FieldType) =>
                form.setValue(`fields.${index}.type`, value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Text" />
              </SelectTrigger>
              <SelectContent>
                {FIELD_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6">
          <div className="space-y-2">
            <Label>Placeholder</Label>
            <CustomInput
              name={`fields.${index}.placeholder`}
              label="Placeholder"
              control={form.control}
              type="text"
              placeholder="Enter Placeholder"
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label>Label</Label>
            <CustomInput
              name={`fields.${index}.label`}
              label="Label"
              control={form.control}
              type="text"
              placeholder="Enter Label"
              disabled={isPending}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pl-1">
          <Switch
            checked={isRequired}
            onCheckedChange={(checked) =>
              form.setValue(`fields.${index}.required`, checked)
            }
          />
          <Label>Required Field</Label>
        </div>

        {/* Dropdown Options Section */}
        {fieldType === "select" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Dropdown Options</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const currentOptions =
                    form.getValues(`fields.${index}.options`) || [];
                  form.setValue(`fields.${index}.options`, [
                    ...currentOptions,
                    "",
                  ]);
                }}
                disabled={isPending}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Option
              </Button>
            </div>
            <div className="space-y-2">
              {(fieldOptions || []).map(
                (option: string, optionIndex: number) => (
                  <div key={optionIndex} className="flex items-center gap-2">
                    <CustomInput
                      name={`fields.${index}.options.${optionIndex}`}
                      label={`Option ${optionIndex + 1}`}
                      control={form.control}
                      type="text"
                      placeholder="Enter option"
                      disabled={isPending}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const currentOptions = [
                          ...(form.getValues(`fields.${index}.options`) || []),
                        ];
                        currentOptions.splice(optionIndex, 1);
                        form.setValue(
                          `fields.${index}.options`,
                          currentOptions,
                        );
                      }}
                      disabled={isPending}
                    >
                      <Trash2 className="w-4 h-4 text-gray-500" />
                    </Button>
                  </div>
                ),
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

type FormTemplate = BaseFormTemplate & { categoryId?: string };

const FormTemplateCreator = ({
  initialData,
  onSubmitSuccess,
}: FormProps<FormTemplate>) => {
  const [isPending, startTransition] = useTransition();

  const {
    categories,
    isLoading: isLoadingCategories,
    refresh: refreshCategories,
  } = useCategoryQuery();
  const { onOpen: openCategoryModal, isOpen: isCategoryModalOpen } =
    useCategoryUIStore();

  const form = useForm<FormTemplateValues>({
    resolver: zodResolver(createTemplateSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      fields:
        initialData?.fields?.map((field) => ({
          ...field,
          label: field.label ?? "",
          required: field.required ?? false,
        })) ?? [],
      categoryId: initialData?.categoryId ?? "",
    },
  });
  const handleAddField = () => {
    append({
      name: "",
      label: "",
      type: "text",
      required: false,
      options: [],
    });
  };

  const { createFormTemplate, updateFormTemplate, isCreating, isUpdating } =
    useFormTemplatesQuery();

  const { onClose: closeTemplate } = useFormTemplateUIStore();

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "fields",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over.id);

      move(oldIndex, newIndex);
    }
  };

  type APIFieldType = "number" | "text" | "select" | "date" | "checkbox";

  interface APIField {
    name: string;
    type: APIFieldType;
    required: boolean;
    label: string;
    options?: string[];
    placeholder?: string;
    showIf?: Record<string, string[]>;
  }

  interface APIFormTemplate {
    name: string;
    fields: APIField[];
  }

  // Transform function to convert field to API format
  const transformFieldToAPIFormat = (field: CustomField): APIField => {
    const { type, showIf, ...rest } = field;
    return {
      ...rest,
      type: type as APIFieldType,
      label: field.label || field.name, // Ensure label is always a string
    };
  };

  const onSubmit = async (data: FormTemplateValues) => {
    startTransition(async () => {
      try {
        const transformedData = {
          ...data,
          fields: data.fields.map(transformFieldToAPIFormat),
        };

        if (initialData && initialData.id) {
          await updateFormTemplate(initialData.id, transformedData as any, {
            onSuccess: () => {
              form.reset();
              closeTemplate();
              toast.success("Successfully updated form template");
              onSubmitSuccess?.();
            },
            onError: (error: any) => {
              console.error("Error updating form template:", error);
              toast.error("Failed to update form template");
            },
          });
        } else {
          await createFormTemplate(transformedData, {
            onSuccess: () => {
              closeTemplate();
              form.reset();
              toast.success("Form template created successfully");
              onSubmitSuccess?.();
            },
            onError: (error) => {
              console.error("Error creating form template:", error);
              toast.error("Failed to create form template");
            },
          });
        }
      } catch (error) {
        console.error("Form template creation error:", error);
        toast.error("Failed to create form template");
      }
    });
  };

  // Refresh categories when the category modal closes
  useEffect(() => {
    if (!isCategoryModalOpen) {
      refreshCategories();
    }
  }, [isCategoryModalOpen, refreshCategories]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col h-[calc(100vh-160px)]"
      >
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {/* Category Selector */}
            <SelectWithButton
              name="categoryId"
              label="Category"
              form={form}
              data={categories || []}
              onNew={openCategoryModal}
              placeholder="Select category"
              required
              isPending={isPending || isLoadingCategories}
            />
            {/* Template Name */}
            <div className="flex justify-between items-end">
              <div className="flex-1">
                <CustomInput
                  name="name"
                  label="Template Name"
                  control={form.control}
                  type="text"
                  placeholder="Enter template name"
                  disabled={isPending}
                />
              </div>

              {/* Download CSV Template Button - only show for existing templates */}
              {initialData?.id && (
                <Button
                  type="button"
                  variant="outline"
                  className="ml-4 flex items-center gap-2"
                  onClick={() => {
                    window.open(
                      `/api/form-templates/${initialData.id}/csv-template`,
                      "_blank",
                    );
                  }}
                >
                  <Download className="w-4 h-4" />
                  Download CSV Template
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl">Fields</h2>
                <Button
                  type="button"
                  variant="outline"
                  className="border-2 border-primary hover:bg-primary/10 rounded-lg"
                  onClick={handleAddField}
                  disabled={isPending}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Field
                </Button>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={fields.map((field) => field.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <SortableField
                        key={field.id}
                        id={field.id}
                        index={index}
                        field={field}
                        form={form}
                        isPending={isPending}
                        onRemove={() => remove(index)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="border-t px-6 py-4 bg-white">
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
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
        </div>
      </form>
    </Form>
  );
};

export default FormTemplateCreator;
