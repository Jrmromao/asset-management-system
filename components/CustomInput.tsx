import React, {forwardRef} from 'react'
import {FormControl, FormField, FormLabel, FormMessage} from "@/components/ui/form"
import {Input} from "@/components/ui/input"
import {Textarea} from "@/components/ui/textarea"
import {usePathname} from 'next/navigation'
import {Control} from 'react-hook-form'
import {PasswordRules} from "@/components/PasswordRules";
import {TooltipLabel} from "@/components/TooltipLabel";

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

const RequiredIndicator = () => (
    <span className="text-red-500 ml-1">*</span>
);

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(({
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
                                                                    }, ref) => {
    const pathname = usePathname()
    const isPassword = type === 'password'
    const showPasswordTooltip = isPassword &&
        (!pathname.includes('sign-in') ||
            !name.includes('repeatPassword') ||
            !name.includes('confirmNewPassword'))

    const isTextArea = type === 'textarea'

    const renderLabel = () => {
        if (!label) return null;

        const labelContent = showPasswordTooltip ? (
            <PasswordRules label={label}/>
        ) : tooltip ? (
            <TooltipLabel label={label} tooltip={tooltip}/>
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

    return (
        <FormField
            control={control}
            name={name}
            render={({field}) => (
                <div className="space-y-2">
                    {renderLabel()}

                    <FormControl>
                        {isTextArea ? (
                            <Textarea
                                {...field}
                                placeholder={placeholder}
                                disabled={disabled}
                                className={className}
                                rows={4}
                            />
                        ) : (
                            <Input
                                {...field}
                                {...props}
                                ref={ref}
                                type={type}
                                required={required}
                                placeholder={placeholder}
                                disabled={disabled}
                                readOnly={readonly}
                                className={className}
                            />
                        )}
                    </FormControl>

                    <FormMessage/>
                </div>
            )}
        />
    )
})

CustomInput.displayName = 'CustomInput'

export default CustomInput