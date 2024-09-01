import React from 'react'
import {FormControl, FormField, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {GrCircleInformation} from "react-icons/gr";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {InfoIcon} from "lucide-react";
import {usePathname} from 'next/navigation';

export interface CustomInputProps {
    label: string;
    placeholder?: string;
    name: string;
    control: any;
    type: string;
    disabled?: boolean
    readonly?: boolean
}

const PasswordRules = ({label}: { label: string }) => {


    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    {label} <GrCircleInformation className={'inline'}/>
                </TooltipTrigger>
                <TooltipContent className={'ag-tooltip w-[300px] max-w-[300px] bg-white'}>
                    <ul>
                        <li>Your password should:</li>
                        <ul>
                            <li>Be at least 8 characters long</li>
                            <li>Include a mix of:</li>
                            <ul>
                                <li>Uppercase letters (A-Z)</li>
                                <li>Lowercase letters (a-z)</li>
                                <li>Numbers (0-9)</li>
                                <li>Special characters (e.g., !@#$%^&*)</li>
                            </ul>
                        </ul>
                    </ul>


                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}


const CustomInput = ({
                         control,
                         name,
                         label,
                         placeholder,
                         type,
                         disabled,
                         readonly = false,
                         ...rest
                     }: CustomInputProps) => {

    const pathname = usePathname();
    const showTooltip =
        !pathname.includes('sign-in') &&
        !name.includes('repeatPassword') &&
        !name.includes('confirmNewPassword') &&
        type === 'password';

    return (
        <FormField
            control={control}
            name={name}
            render={({field}) => (
                <div className={'form-item'}>
                    <FormLabel className={'form-label'}>
                        {showTooltip ? <PasswordRules label={label}/> : label}
                    </FormLabel>
                    <div className={'flex w-full flex-col'}>
                        <FormControl>
                            <Input
                                readOnly={readonly}
                                disabled={disabled}
                                placeholder={placeholder}
                                className={'input-class'} {...field}
                                type={type}
                            />
                        </FormControl>
                        <FormMessage className={'form-message mt-2'}/>
                    </div>
                </div>
            )}
        />
    )
}
export default CustomInput
