import React from 'react'
import {FormControl, FormField, FormLabel, FormMessage} from "@/components/ui/form";

import { Textarea } from "@/components/ui/textarea"

import {Control, FieldPath} from 'react-hook-form'
import {z} from "zod";
import {formSchema as myFormSchema} from "@/lib/utils";




interface CustomInputProps {
    control: any,
    name: string,
    label: string,
    placeholder: string,
}

const CustomTextarea = ({control, name, label, placeholder}: CustomInputProps) => {
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
                            <Textarea
                                placeholder={placeholder}
                                className={'input-class'} {...field}
                            />
                        </FormControl>
                        <FormMessage className={'form-message mt-2'}/>
                    </div>
                </div>
            )}
        />
    )
}
export default CustomTextarea
