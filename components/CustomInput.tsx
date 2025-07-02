import React, { forwardRef, useState } from "react";
import {
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
  FormItem,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePathname } from "next/navigation";
import { Control } from "react-hook-form";
import { PasswordRules } from "@/components/PasswordRules";
import { TooltipLabel } from "@/components/TooltipLabel";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CustomInputProps {
  name: string;
  label: string;
  control: Control<any>;
  placeholder?: string;
  required?: boolean;
  type?: string;
  className?: string;
  error?: string;
  isLoading?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  tooltip?: string;
}

const CustomInput = ({
  name,
  label,
  control,
  placeholder,
  required = false,
  type = "text",
  className,
  error,
  isLoading,
  tooltip,
  disabled,
}: CustomInputProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                {...field}
                type={type}
                placeholder={placeholder}
                className={cn(
                  "dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400",
                  (error || fieldState.error) &&
                    "border-red-500 focus:border-red-500",
                  className,
                )}
                disabled={isLoading || disabled}
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-white"></div>
                </div>
              )}
            </div>
          </FormControl>
          {(error || fieldState.error?.message) && (
            <FormMessage className="text-red-500 text-sm">
              {error || fieldState.error?.message}
            </FormMessage>
          )}
        </FormItem>
      )}
    />
  );
};

export default CustomInput;
