import React from 'react'
import {FormControl, FormField, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";


interface CustomInputProps {
    label: string;
    placeholder?: string;
    name: string;
    control: any;
    type: string;
}

const CustomInput = ({control, name, label, placeholder, type, ...rest}: CustomInputProps) => {
    return (
        <div className="w-full">
            <FormLabel className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </FormLabel>
            <div className="flex flex-col space-y-2">
                <FormControl>
                    <Input
                        placeholder={placeholder}
                        className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        {...rest}
                        type={type}
                    />
                </FormControl>

            </div>
        </div>
    )
}
export default CustomInput
