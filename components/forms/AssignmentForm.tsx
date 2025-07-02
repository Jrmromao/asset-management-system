"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useForm, Controller } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { FormError } from "@/components/forms/form-error";
import CustomSelect from "@/components/CustomSelect";
import { useUserStore } from "@/lib/stores/userStore";
import * as z from "zod";
import { assignmentSchema } from "@/lib/schemas";
import { Input } from "@/components/ui/input";

// Define supported asset types
export type AssetType = "asset" | "license" | "accessory" | "consumable";

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

interface Props {
  itemId: string;
  seatsRequested?: number;
  type: AssetType;
  onOptimisticUpdate: (data: { userId: string; userName: string }) => void;
  onSuccess?: () => void;
  onError?: (previousData?: { userId: string; userName: string }) => void;
  assignAction: (data: AssignmentFormValues) => Promise<{ error?: string }>;
  availableSeats?: number;
  availableQuantity?: number;
}

const AssignmentForm = ({
  itemId,
  type,
  seatsRequested,
  onOptimisticUpdate,
  onSuccess,
  onError,
  assignAction,
  availableSeats,
  availableQuantity,
}: Props) => {
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      userId: "",
      itemId: itemId,
      type: type,
    },
    mode: "onChange",
  });

  const [getAllUsers, users] = useUserStore((state) => [
    state.getAll,
    state.users,
  ]);

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  const onSubmit = async (data: AssignmentFormValues) => {
    // Coerce seatsRequested and quantity to numbers if needed
    if (typeof data.seatsRequested === "string") {
      data.seatsRequested = parseInt(data.seatsRequested, 10);
    }
    if (typeof data.quantity === "string") {
      data.quantity = parseInt(data.quantity, 10);
    }
    const selectedUser = users.find((user) => user.id === data.userId);

    if (!selectedUser || !selectedUser.name) {
      setError("Selected user not found or user name is missing");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const optimisticData = {
      userId: data.userId,
      userName: selectedUser.name,
    };

    try {
      onOptimisticUpdate(optimisticData);

      const response = await assignAction(data);

      if (response?.error) {
        throw new Error(response.error);
      }

      onSuccess?.();
    } catch (e) {
      console.error(`${type} assignment error:`, e, data);
      setError(typeof e === "string" ? e : `Failed to assign ${type}`);
      onError?.(optimisticData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSubmitButtonText = () => {
    if (isSubmitting) return `Assigning ${type}...`;
    return `Assign ${type}`;
  };

  return (
    <section className="w-full bg-white z-50 max-h-700 overflow-y-auto p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <CustomSelect
            control={form.control}
            name="userId"
            label="Name"
            placeholder="Select User"
            disabled={isSubmitting}
            data={users || []}
            required
          />

          {/* Show seats dropdown for licenses using CustomSelect */}
          {type === "license" && availableSeats && availableSeats > 0 && (
            <>
              <Controller
                control={form.control}
                name="seatsRequested"
                render={({ field }) => (
                  <CustomSelect
                    {...field}
                    value={field.value ? String(field.value) : ""}
                    label="Number of Seats"
                    placeholder="Select seats"
                    disabled={isSubmitting}
                    data={Array.from({ length: availableSeats }, (_, i) => ({
                      id: String(i + 1),
                      name: String(i + 1),
                    }))}
                    required
                    onChange={(val) =>
                      field.onChange(val ? Number(val) : undefined)
                    }
                  />
                )}
              />
              {form.formState.errors.seatsRequested && (
                <div className="text-red-600 text-sm mt-1">
                  {form.formState.errors.seatsRequested.message}
                </div>
              )}
            </>
          )}

          {/* Show quantity dropdown for accessories using CustomSelect */}
          {type === "accessory" &&
            availableQuantity &&
            availableQuantity > 0 && (
              <CustomSelect
                control={form.control}
                name="quantity"
                label="Quantity"
                placeholder="Select quantity"
                disabled={isSubmitting}
                data={Array.from({ length: availableQuantity }, (_, i) => ({
                  id: String(i + 1),
                  name: String(i + 1),
                }))}
                required
              />
            )}

          <FormError message={error} />

          <div className="flex flex-col gap-4">
            <Button
              type="submit"
              className="form-btn"
              disabled={isSubmitting || !form.watch("userId")}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  &nbsp; {getSubmitButtonText()}
                </>
              ) : (
                getSubmitButtonText()
              )}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
};

export default AssignmentForm;
