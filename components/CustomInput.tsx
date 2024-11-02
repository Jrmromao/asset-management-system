import React, { forwardRef, useState } from 'react'
import { FormControl, FormField, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { GrCircleInformation } from "react-icons/gr"
import { usePathname } from 'next/navigation'
import { Control } from 'react-hook-form'

export interface CustomInputProps {
    label?: string;
    name: string;
    control: Control<any>;
    type?: string;
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    tooltip?: string;
    className?: string;
}

const PasswordRules = ({ label }: { label: string }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="relative inline-flex items-center gap-1"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {label} <GrCircleInformation className="h-4 w-4" />
            {isHovered && (
                <div className="absolute left-full top-0 ml-2 w-80 bg-white p-2 rounded-md shadow-lg z-50">
                    <div className="space-y-2 text-sm">
                        <p className="font-medium">Password Requirements:</p>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>Minimum 8 characters</li>
                            <li>At least one uppercase letter (A-Z)</li>
                            <li>At least one lowercase letter (a-z)</li>
                            <li>At least one number (0-9)</li>
                            <li>At least one special character (!@#$%^&*)</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    )
}

const TooltipLabel = ({ label, tooltip }: { label: string; tooltip: string }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="relative inline-flex items-center gap-1"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {label} <GrCircleInformation className="h-4 w-4" />
            {isHovered && (
                <div className="absolute left-full top-0 ml-2 bg-white p-2 rounded-md shadow-lg z-50 min-w-[200px]">
                    {tooltip}
                </div>
            )}
        </div>
    );
};

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(({
                                                                        control,
                                                                        name,
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
        !pathname.includes('sign-in') &&
        !name.includes('repeatPassword') &&
        !name.includes('confirmNewPassword')

    const isTextArea = type === 'textarea'

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <div className="space-y-2">
                    {label && <FormLabel>
                        {showPasswordTooltip ? (
                            <PasswordRules label={label} />
                        ) : tooltip ? (
                            <TooltipLabel label={label} tooltip={tooltip} />
                        ) : (
                            label
                        )}
                    </FormLabel>}

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
                                placeholder={placeholder}
                                disabled={disabled}
                                readOnly={readonly}
                                className={className}
                            />
                        )}
                    </FormControl>

                    <FormMessage />
                </div>
            )}
        />
    )
})

CustomInput.displayName = 'CustomInput'

export default CustomInput