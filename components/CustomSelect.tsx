import React from 'react'
import {FormControl, FormField, FormLabel, FormMessage} from "@/components/ui/form";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

interface BaseOption {
    id?: string;
    name: string;
}

interface CustomSelectProps {
    control: any;
    name: string;
    label: string;
    placeholder: string;
    value: any;
    disabled?: boolean;
    required?: boolean;
    data: BaseOption[] | User[];
    tooltip?: string;
}

const RequiredIndicator = () => (
    <span className="text-red-500 ml-1">*</span>
);

const CustomSelect = ({
                          control,
                          name,
                          label,
                          placeholder,
                          data,
                          value,
                          disabled,
                          required,
                          tooltip
                      }: CustomSelectProps) => {
    const renderLabel = () => {
        if (!label) return null;

        return (
            <FormLabel className="flex items-center mb-2 ">
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
                                onValueChange={field.onChange}
                                value={value}
                                disabled={disabled}
                            >
                                <SelectTrigger className="w-full input-class text-gray-100">
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