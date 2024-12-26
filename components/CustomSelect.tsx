import React from 'react'
import { Control } from 'react-hook-form'
import { FormControl, FormField, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface BaseOption {
    id?: string;
    name: string;
}

interface CustomSelectProps<T extends BaseOption = BaseOption> {
    control: Control<any>;
    name: string;
    label: string;
    placeholder: string;
    value?: string;
    disabled?: boolean;
    required?: boolean;
    data: T[];
    tooltip?: string;
    onChange?: (value: string) => void;
    isLoading?: boolean;
}

const RequiredIndicator = () => (
    <span className="text-red-500 ml-1">*</span>
);

const CustomSelect = <T extends BaseOption>({
                                                control,
                                                name,
                                                label,
                                                placeholder,
                                                data,
                                                value,
                                                disabled,
                                                required,
                                                tooltip,
                                                onChange,
                                                isLoading
                                            }: CustomSelectProps<T>) => {
    const renderLabel = () => {
        if (!label) return null;

        return (
            <FormLabel className="flex items-center mb-2">
                {required && <RequiredIndicator />}
                <span>{label}</span>
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

                    <div className="flex w-full flex-col">
                        <FormControl>
                            <Select
                                onValueChange={(newValue) => {
                                    field.onChange(newValue);
                                    // Call the external onChange if provided
                                    if (onChange) {
                                        onChange(newValue);
                                    }
                                }}
                                value={value || field.value}
                                disabled={disabled || isLoading}
                            >
                                <SelectTrigger
                                    className={`w-full input-class ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div className={`${field.value ? '' : 'text-gray-600'}`}>
                                        <SelectValue placeholder={placeholder}/>
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="w-full bg-white">
                                    <SelectGroup>
                                        {data?.map((option) => (
                                            <SelectItem
                                                key={option.id}
                                                value={option.id!}
                                            >
                                                {option.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage className="mt-2"/>
                    </div>
                </div>
            )}
        />
    )
}

export default CustomSelect