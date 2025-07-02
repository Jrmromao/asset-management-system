import React from "react";
import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
  FormItem,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CustomSelectProps<T> {
  control?: Partial<Control<any>>;
  name: string;
  label: string;
  placeholder: string;
  disabled?: boolean;
  required?: boolean;
  data: T[];
  isLoading?: boolean;
  onChange?: (value: string) => void | Promise<void>;
  value?: string;
}

const RequiredIndicator = () => <span className="text-red-500 ml-1">*</span>;

const CustomSelect = <T extends { id?: string; name?: string }>({
  control,
  name,
  label,
  placeholder,
  data,
  disabled,
  required,
  isLoading,
  onChange,
  value,
}: CustomSelectProps<T>) => {
  // Only render FormLabel if control is present (i.e., inside a form context)
  const renderLabel = () => {
    if (!label) return null;
    if (!control) {
      // Just render a plain label
      return (
        <label className="flex items-center mb-2">
          {required && <RequiredIndicator />}
          <span>{label}</span>
        </label>
      );
    }
    // Use FormLabel (react-hook-form context) only if control is present
    return (
      <FormLabel className="flex items-center mb-2">
        {required && <RequiredIndicator />}
        <span>{label}</span>
      </FormLabel>
    );
  };

  // If no control is provided, render a plain select (no react-hook-form)
  if (!control) {
    return (
      <div className="space-y-1">
        {renderLabel()}
        <div className="flex w-full flex-col gap-1">
          <Select
            onValueChange={onChange}
            value={value || ""}
            disabled={disabled || isLoading}
          >
            <SelectTrigger
              className={`w-full input-class ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className={`${value ? "" : "text-gray-600"}`}>
                <SelectValue placeholder={placeholder} />
              </div>
            </SelectTrigger>
            <SelectContent className="w-full bg-white">
              <SelectGroup>
                {data?.map((option) => (
                  <SelectItem key={option.id} value={option.id || ""}>
                    {option.name ||
                      `${(option as any).firstName} ${(option as any).lastName}`}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  // Only render FormField/react-hook-form logic if control is present
  return (
    <FormField
      control={control as any}
      name={name}
      render={({ field }) => {
        const handleValueChange = (newValue: string) => {
          field.onChange(newValue);
          onChange?.(newValue);
        };

        return (
          <FormItem>
            <FormLabel>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </FormLabel>
            <FormControl>
              <Select
                onValueChange={handleValueChange}
                value={field.value || ""}
                disabled={disabled || isLoading}
              >
                <SelectTrigger
                  className={`w-full input-class ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className={`${field.value ? "" : "text-gray-600"}`}>
                    <SelectValue placeholder={placeholder} />
                  </div>
                </SelectTrigger>
                <SelectContent className="w-full bg-white">
                  <SelectGroup>
                    {data?.map((option) => (
                      <SelectItem key={option.id} value={option.id || ""}>
                        {option.name ||
                          `${(option as any).firstName} ${(option as any).lastName}`}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage className="text-sm text-red-700" />
          </FormItem>
        );
      }}
    />
  );
};

export default CustomSelect;
