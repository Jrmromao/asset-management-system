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
        <FormField
            control={control}
            name={name}
            render={({field}) => (
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                        <FormLabel className="block text-sm font-medium text-gray-700 mb-1">
                            {label}
                        </FormLabel>
                    </div>
                    <div className="col-span-2">

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
            )}
        />
    )
}
export default CustomInput
