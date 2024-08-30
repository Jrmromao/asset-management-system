import React from 'react'
import {FormControl, FormField, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";


interface CustomInputProps {
    label: string;
    placeholder?: string;
    name: string;
    control: any;
    type: string;
    disabled?: boolean
    readonly ?: boolean
}

const CustomInput = ({control, name, label, placeholder, type, disabled, readonly = false,...rest}: CustomInputProps) => {
    return (
        <FormField
            control={control}
            name={name}
            render={({field}) => (
                <div className={'form-item'}>
                    <FormLabel className={'form-label'}>
                        {label}
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
