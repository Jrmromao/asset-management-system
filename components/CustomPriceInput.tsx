import {
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { forwardRef } from "react";
import { CustomInputProps } from "@/components/CustomInput";

const CustomPriceInput = forwardRef<
  HTMLInputElement,
  Omit<CustomInputProps, "type">
>(
  (
    {
      control,
      name,
      label,
      required,
      placeholder = "0.00",
      disabled,
      readonly,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <div className="space-y-2">
            {label && (
              <FormLabel className="flex items-center">
                {required && <span className="text-red-500 mr-1">*</span>}
                {label}
              </FormLabel>
            )}
            <FormControl>
              <div className="flex-1">
                <div className="relative">
                  <Input
                    {...field}
                    {...props}
                    ref={ref}
                    type="number"
                    placeholder={placeholder}
                    disabled={disabled}
                    readOnly={readonly}
                    className={`pl-6 ${className}`}
                    step="0.01"
                  />
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">
                    €
                  </span>
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </div>
        )}
      />
    );
  },
);

CustomPriceInput.displayName = "CustomPriceInput";

export default CustomPriceInput;
