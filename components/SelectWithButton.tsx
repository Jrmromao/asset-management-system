import React from "react";
import { UseFormReturn } from "react-hook-form";
import CustomSelect from "@/components/CustomSelect";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface SelectWithButtonProps {
  name: string;
  label: string;
  form: UseFormReturn<any>;
  data: any[];
  onNew: () => void;
  onChange?: (value: string) => Promise<void> | void;
  placeholder: string;
  required?: boolean;
  isPending?: boolean;
}

export const SelectWithButton = ({
  name,
  label,
  data,
  onNew,
  placeholder,
  form,
  onChange,
  isPending = false,
  required = false,
}: SelectWithButtonProps) => (
  <div className="w-full">
    <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
      <div className="min-w-0">
        <CustomSelect
          name={name}
          required={required}
          label={label}
          control={form.control}
          data={data}
          placeholder={placeholder}
          onChange={onChange}
        />
      </div>
      <div className="pb-0">
        <Button
          type="button"
          variant="outline"
          onClick={(e) => {
            e.preventDefault(); // Prevent form submission
            onNew();
          }}
          className="h-10 w-10 p-0 flex-shrink-0"
          // disabled={isPending}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
);
