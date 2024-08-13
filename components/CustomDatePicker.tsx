import React, {useState} from 'react'
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {CalendarIcon} from "lucide-react";
import {cn} from "@/lib/utils";
import {format} from "date-fns";
import {Calendar} from "@/components/ui/calendar";
import {FormControl, FormField, FormLabel, FormMessage} from "@/components/ui/form";


interface CustomDatePickerProps {
    label: string;
    placeholder?: string;
    name: string;
    control: any;
    type: string;
    date: Date | undefined
    setDate: React.Dispatch<React.SetStateAction<Date | undefined>>
}

const CustomDatePicker = ({control, name, label, placeholder, type, date, setDate, ...rest}: CustomDatePickerProps) => {

    const [isOpen, setIsOpen] = useState(false);


    const handleSelect = (selectedDate: Date) => {
        setDate(selectedDate);
        console.log(date)
        setIsOpen(false);
    };
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
                            <Popover open={isOpen} onOpenChange={setIsOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-[280px] justify-start text-left font-normal", 'w-full',
                                            !date && "text-muted-foreground", 'input-class ', {...field}

                                            )}
                                        onClick={() => setIsOpen(!isOpen)} // Toggle popover visibility
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4"/>
                                        {date ? format(date, "yyyy-MM-dd") : <span>{placeholder}</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        className={'bg-white'}
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                        onDayClick={handleSelect}
                                    />
                                </PopoverContent>
                            </Popover>
                        </FormControl>
                        <FormMessage className={'form-message mt-2'}/>
                    </div>
                </div>
            )}
        />


    )
}
export default CustomDatePicker


