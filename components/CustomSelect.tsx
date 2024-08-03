import React from 'react'
import {FormControl, FormField, FormLabel, FormMessage} from "@/components/ui/form";

import {Textarea} from "@/components/ui/textarea"

import {Control, FieldPath} from 'react-hook-form'
import {date, z} from "zod";
import {formSchema as myFormSchema} from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";


interface CustomInputProps {
    control: any,
    name: string,
    label: string,
    placeholder: string,
    data: Category[] | License[]
}


const CustomSelect = ({control, name, label, placeholder, data}: CustomInputProps) => {
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
                            <Select onValueChange={field.onChange}>


                                <SelectTrigger className="w-full input-class text-gray-100">
                                    <div className={`${field.value ? '' : 'text-gray-600'}`}>
                                        <SelectValue placeholder={placeholder}/>
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="w-full bg-white">
                                    <SelectGroup>
                                        {data?.map((option) => (
                                            <SelectItem  key={option.id} value={option.name!}>
                                                {option.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage className={'form-message mt-2'}/>
                    </div>
                </div>
            )}
        />
    )
}
export default CustomSelect
