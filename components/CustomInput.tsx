import React from 'react'
import {FormControl, FormField, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {GrCircleInformation} from "react-icons/gr";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {InfoIcon} from "lucide-react";


interface CustomInputProps {
    label: string;
    placeholder?: string;
    name: string;
    control: any;
    type: string;
    disabled?: boolean
    readonly?: boolean
}

const PasswordRules = ({label}: {label: string}) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger >
                    {label} <GrCircleInformation className={'inline'}/>
                </TooltipTrigger>
                <TooltipContent className={'ag-tooltip w-[300px] max-w-[300px] bg-white'}>
                    <p>Password Rules:</p>
                    <ul>
                        <li>Be at least 8 characters long</li>
                        <li>One number</li>
                        <li>One special character</li>
                        <li>One uppercase letter</li>
                        <li>One lowercase letter</li>
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





    return (
        <FormField
            control={control}
            name={name}
            render={({field}) => (
                <div className={'form-item'}>
                    <FormLabel className={'form-label'}>
                        {type === 'password' ? <PasswordRules label={label}/> : label}
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
