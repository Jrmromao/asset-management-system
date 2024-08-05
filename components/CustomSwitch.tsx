import React from 'react'
import {FormControl, FormField, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Switch} from "@/components/ui/switch";
import {useController} from "react-hook-form";
import {cn} from "@/lib/utils";


interface CustomSwitchInputProps {
    label: string;
    name: string;
    control: any;

}

const CustomSwitch = ({control, name, label, ...rest}: CustomSwitchInputProps) => {

    const {
        field: { onChange, value },
        fieldState: { error },
    } = useController({
        name,
        control,
        defaultValue: false,
    });

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
                            <Switch
                                checked={value}
                                onCheckedChange={onChange}
                                className={cn(
                                    "relative inline-flex h-6 w-11 items-center rounded-full",
                                    "data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-200",
                                    // Slide effect styles
                                    "after:absolute after:left-[2px] after:top-[2px] after:h-[calc(100%-4px)] after:w-[calc(100%-4px)] after:rounded-full after:transition-all after:content-['']",
                                    "data-[state=checked]:after:translate-x-full data-[state=unchecked]:after:translate-x-0"
                                )}
                            />
                        </FormControl>
                        <FormMessage className={'form-message mt-2'}/>
                    </div>
                </div>
            )}
        />
    )
}
export default CustomSwitch
