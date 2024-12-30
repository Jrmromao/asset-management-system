import React from 'react'
import { Control } from 'react-hook-form'
import { FormControl, FormField, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CustomSelectProps<T> {
    control: Control<any>;
    name: string;
    label: string;
    placeholder: string;
    value?: string;
    disabled?: boolean;
    required?: boolean;
    data: T[];
    tooltip?: string;
    isLoading?: boolean;
    onChange?: (value: string) => void | Promise<void>;
}

const RequiredIndicator = () => (
    <span className="text-red-500 ml-1">*</span>
);

const CustomSelect = <T extends { id?: string; name?: string }>({
                                                                    control,
                                                                    name,
                                                                    label,
                                                                    placeholder,
                                                                    data,
                                                                    value,
                                                                    disabled,
                                                                    required,
                                                                    tooltip,
                                                                    isLoading,
                                                                    onChange
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
            render={({field}) => {
                const handleValueChange = (newValue: string) => {
                    field.onChange(newValue);
                    onChange?.(newValue);
                };

                return (
                    <div className="space-y-1">
                        {renderLabel()}
                        <div className="flex w-full flex-col gap-1">
                            <FormControl>
                                <Select
                                    onValueChange={handleValueChange}
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
                                                    value={option.id || ''}
                                                >
                                                    {option.name || `${(option as any).firstName} ${(option as any).lastName}`}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage className="text-sm text-red-700"/>
                        </div>
                    </div>
                );
            }}
        />
    )
}

export default CustomSelect