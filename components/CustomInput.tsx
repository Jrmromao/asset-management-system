// import React, { forwardRef, useState } from 'react'
// import { FormControl, FormField, FormLabel, FormMessage } from "@/components/ui/form"
// import { Input } from "@/components/ui/input"
// import { Textarea } from "@/components/ui/textarea"
// import { usePathname } from 'next/navigation'
// import { Control } from 'react-hook-form'
// import { PasswordRules } from "@/components/PasswordRules"
// import { TooltipLabel } from "@/components/TooltipLabel"
// import { Eye, EyeOff } from 'lucide-react'
// import { Button } from "@/components/ui/button"
//
// export interface CustomInputProps {
//     label?: string;
//     name: string;
//     control: Control<any>;
//     type?: string;
//     placeholder?: string;
//     disabled?: boolean;
//     readonly?: boolean;
//     required?: boolean;
//     tooltip?: string;
//     className?: string;
// }
//
// const RequiredIndicator = () => (
//     <span className="text-red-500 ml-1">*</span>
// );
//
// const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(({
//                                                                         control,
//                                                                         name,
//                                                                         required,
//                                                                         label,
//                                                                         placeholder,
//                                                                         type = "text",
//                                                                         disabled = false,
//                                                                         readonly = false,
//                                                                         tooltip,
//                                                                         className,
//                                                                         ...props
//                                                                     }, ref) => {
//     const pathname = usePathname()
//     const isPassword = type === 'password'
//     const showPasswordTooltip = isPassword &&
//         (!pathname.includes('sign-in') ||
//             !name.includes('repeatPassword') ||
//             !name.includes('confirmNewPassword'))
//     const [showPassword, setShowPassword] = useState(false);
//     const isTextArea = type === 'textarea'
//
//     const togglePasswordVisibility = (e: React.MouseEvent) => {
//         e.preventDefault(); // Prevent form submission
//         setShowPassword(!showPassword);
//     };
//
//     const renderLabel = () => {
//         if (!label) return null;
//
//         const labelContent = showPasswordTooltip ? (
//             <PasswordRules label={label}/>
//         ) : tooltip ? (
//             <TooltipLabel label={label} tooltip={tooltip}/>
//         ) : (
//             <span>{label}</span>
//         );
//
//         return (
//             <FormLabel className="flex items-center gap-1">
//                 {required && <RequiredIndicator />}
//                 {labelContent}
//             </FormLabel>
//         );
//     };
//
//     const renderInput = (field: any) => {
//         if (isTextArea) {
//             return (
//                 <Textarea
//                     {...field}
//                     placeholder={placeholder}
//                     disabled={disabled}
//                     className={className}
//                     rows={4}
//                 />
//             );
//         }
//
//         return (
//             <div className="relative">
//                 <Input
//                     {...field}
//                     {...props}
//                     ref={ref}
//                     type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
//                     required={required}
//                     placeholder={placeholder}
//                     disabled={disabled}
//                     readOnly={readonly}
//                     className={`${className} ${isPassword ? 'pr-10' : ''}`}
//                 />
//                 {isPassword && (
//                     <Button
//                         type="button"
//                         variant="ghost"
//                         size="sm"
//                         className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//                         onClick={togglePasswordVisibility}
//                         tabIndex={-1} // Prevent tab focus on button
//                         aria-label={showPassword ? "Hide password" : "Show password"}
//                     >
//                         {showPassword ? (
//                             <EyeOff className="h-4 w-4 text-gray-500" />
//                         ) : (
//                             <Eye className="h-4 w-4 text-gray-500" />
//                         )}
//                     </Button>
//                 )}
//             </div>
//         );
//     };
//
//     return (
//         <FormField
//             control={control}
//             name={name}
//             render={({field}) => (
//                 <div className="space-y-2">
//                     {renderLabel()}
//                     <FormControl>
//                         {renderInput(field)}
//                     </FormControl>
//                     <FormMessage/>
//
//
//                 </div>
//             )}
//         />
//     )
// });
//
// CustomInput.displayName = 'CustomInput'
//
// export default CustomInput

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

export interface CustomInputProps {
  label?: string;
  name: string;
  control: Control<any>;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  tooltip?: string;
  className?: string;
}

const RequiredIndicator = () => <span className="text-red-500 ml-1">*</span>;

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  (
    {
      control,
      name,
      required,
      label,
      placeholder,
      type = "text",
      disabled = false,
      readonly = false,
      tooltip,
      className,
      ...props
    },
    ref,
  ) => {
    const pathname = usePathname();
    const isPassword = type === "password";
    const showPasswordTooltip =
      isPassword &&
      (!pathname.includes("sign-in") ||
        !name.includes("repeatPassword") ||
        !name.includes("confirmNewPassword"));
    const [showPassword, setShowPassword] = useState(false);
    const isTextArea = type === "textarea";

    const togglePasswordVisibility = (e: React.MouseEvent) => {
      e.preventDefault();
      setShowPassword(!showPassword);
    };

    const renderLabel = () => {
      if (!label) return null;

      const labelContent = showPasswordTooltip ? (
        <PasswordRules label={label} />
      ) : tooltip ? (
        <TooltipLabel label={label} tooltip={tooltip} />
      ) : (
        <span>{label}</span>
      );

      return (
        <FormLabel className="flex items-center gap-1">
          {required && <RequiredIndicator />}
          {labelContent}
        </FormLabel>
      );
    };

    const renderInput = (field: any) => {
      if (isTextArea) {
        return (
          <Textarea
            {...field}
            placeholder={placeholder}
            disabled={disabled}
            className={className}
            rows={4}
          />
        );
      }

      return (
        <div className="relative">
          <Input
            {...field}
            {...props}
            ref={ref}
            type={
              type === "password" ? (showPassword ? "text" : "password") : type
            }
            required={required}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readonly}
            className={`${className} ${isPassword ? "pr-10" : ""}`}
          />
          {isPassword && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={togglePasswordVisibility}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-500" />
              ) : (
                <Eye className="h-4 w-4 text-gray-500" />
              )}
            </Button>
          )}
        </div>
      );
    };

    return (
      <FormField
        control={control}
        name={name}
        render={({ field, fieldState: { error } }) => (
          <FormItem className="space-y-1">
            {renderLabel()}
            <FormControl>{renderInput(field)}</FormControl>
            {error && (
              <FormMessage className="text-sm text-red-700">Error</FormMessage>
            )}
          </FormItem>
        )}
      />
    );
  },
);

CustomInput.displayName = "CustomInput";

export default CustomInput;
