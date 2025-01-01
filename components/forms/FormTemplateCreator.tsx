"use client";
import React, { useState, useTransition } from "react";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2, Plus, Trash2, GripVertical } from "lucide-react";
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
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createFormTemplate } from "@/lib/actions/formTemplate.actions";
import { useFormTemplateStore } from "@/lib/stores/formTemplateStore";

const fieldTypes = ["text", "number", "date", "select", "checkbox"] as const;
type FieldType = (typeof fieldTypes)[number];

const formFieldSchema = z.object({
  name: z.string().min(1, "Field name is required"),
  type: z.enum(fieldTypes),
  placeholder: z.string().optional(),
  label: z.string().optional(),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
});

const formTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  fields: z.array(formFieldSchema),
});

type FormTemplateValues = z.infer<typeof formTemplateSchema>;
type FormFieldValues = z.infer<typeof formFieldSchema>;

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "select", label: "Dropdown" },
  { value: "checkbox", label: "Checkbox" },
] as const;

interface SortableFieldProps {
  id: string;
  index: number;
  field: any;
  form: any;
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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative bg-white border rounded-lg p-6 ${isDragging ? "shadow-lg" : ""}`}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="cursor-grab touch-none"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="w-5 h-5 text-gray-400" />
            </button>
            <h3 className="text-lg">Field {index + 1}</h3>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            disabled={isPending}
            className="hover:bg-transparent"
          >
            <Trash2 className="w-5 h-5 text-gray-500" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-x-6">
          <div className="space-y-2">
            <Label>Field Name</Label>
            <CustomInput
              name={`fields.${index}.name`}
              control={form.control}
              type="text"
              placeholder="Enter field name"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label>Field Type</Label>
            <Select
              value={form.watch(`fields.${index}.type`)}
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
              control={form.control}
              type="text"
              placeholder="Enter Label"
              disabled={isPending}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pl-1">
          <Switch
            checked={form.watch(`fields.${index}.required`)}
            onCheckedChange={(checked) =>
              form.setValue(`fields.${index}.required`, checked)
            }
          />
          <Label>Required Field</Label>
        </div>

        {/* Dropdown Options Section */}
        {form.watch(`fields.${index}.type`) === "select" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Dropdown Options</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const currentOptions =
                    form.watch(`fields.${index}.options`) || [];
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
              {(form.watch(`fields.${index}.options`) || []).map(
                (option: string, optionIndex: number) => (
                  <div key={optionIndex} className="flex items-center gap-2">
                    <CustomInput
                      name={`fields.${index}.options.${optionIndex}`}
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
                          ...(form.watch(`fields.${index}.options`) || []),
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

const FormTemplateCreator = () => {
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormTemplateValues>({
    resolver: zodResolver(formTemplateSchema),
    defaultValues: {
      name: "",
      fields: [],
    },
  });

  const { fetchTemplates, onClose: closeTemplate } = useFormTemplateStore();

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

  const onSubmit = async (data: FormTemplateValues) => {
    startTransition(async () => {
      try {
        const response = await createFormTemplate(data);

        if (response.error) {
          console.error("Form template creation error:", response.error);
          toast.error("Failed to create form template");
          return;
        }

        console.log("Form template data:", data);
        toast.success("Form template created successfully");
        fetchTemplates();
        closeTemplate();
        form.reset();
      } catch (error) {
        console.error("Form template creation error:", error);
        toast.error("Failed to create form template");
      }
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col h-[calc(100vh-100px)]"
      >
        {/* Fixed Header */}
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Add Template</h2>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            <CustomInput
              name="name"
              label="Template Name"
              control={form.control}
              type="text"
              placeholder="Enter template name"
              disabled={isPending}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl">Fields</h2>
                <Button
                  type="button"
                  variant="outline"
                  className="border-2 border-primary hover:bg-primary/10 rounded-lg"
                  onClick={() =>
                    append({
                      name: "",
                      type: "text",
                      required: false,
                      options: [],
                    })
                  }
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
                  Creating Template...
                </>
              ) : (
                "Create Template"
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default FormTemplateCreator;
