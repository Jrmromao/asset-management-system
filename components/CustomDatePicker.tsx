// import React, {useState} from 'react'
// import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
// import {Button} from "@/components/ui/button";
// import {CalendarIcon} from "lucide-react";
// import {cn} from "@/lib/utils";
// import {format} from "date-fns";
// import {Calendar} from "@/components/ui/calendar";
// import {FormControl, FormField, FormLabel, FormMessage} from "@/components/ui/form";
// import {Controller} from "react-hook-form";
//
//
// interface CustomDatePickerProps {
//     label: string;
//     placeholder?: string;
//     name: string;
//     control: any;
//     date: Date | undefined
//     setDate: React.Dispatch<React.SetStateAction<Date | undefined>>
// }
//
// const CustomDatePicker = ({control, name, label, placeholder, date, setDate, ...rest}: CustomDatePickerProps) => {
//     const [isOpen, setIsOpen] = useState(false);
//     const handleSelect = (selectedDate: Date) => {
//         setDate(selectedDate);
//         console.log(date)
//         setIsOpen(false);
//     };
//     return (
//         <FormField
//             control={control}
//             name={name}
//             render={({ field: { onChange, onBlur, value } }) => (
//                 <div className="form-item">
//                     <FormLabel className="form-label">{label}</FormLabel>
//                     <div className="flex w-full flex-col">
//                         <FormControl>
//                             <Popover open={isOpen} onOpenChange={setIsOpen}>
//                                 <PopoverTrigger asChild>
//                                     <Button
//                                         variant="outline"
//                                         className={cn(
//                                             "w-[280px] justify-start text-left font-normal",
//                                             "w-full",
//                                             !value && "text-muted-foreground",
//                                             "input-class"
//                                         )}
//                                         onClick={() => setIsOpen(!isOpen)}
//                                     >
//                                         <CalendarIcon className="mr-2 h-4 w-4" />
//                                         {value ? format(value, "yyyy-MM-dd") : (
//                                             <span className="text-gray-500">{placeholder}</span>
//                                         )}
//                                     </Button>
//                                 </PopoverTrigger>
//                                 <PopoverContent className="w-auto p-0">
//                                     <Calendar
//                                         className={'bg-white'}
//                                         mode="single"
//                                         selected={value}
//                                         onSelect={onChange}
//                                         initialFocus
//                                         onDayClick={(selectedDate) => {
//                                             onChange(selectedDate);
//                                             setIsOpen(false);
//                                         }}
//                                     />
//                                 </PopoverContent>
//                             </Popover>
//                         </FormControl>
//                         <FormMessage className="form-message mt-2" /> {/* Keep this for potential error display */}
//                     </div>
//                 </div>
//             )}
//         />
//
//     )
// }
// export default CustomDatePicker
//
//


import React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"

interface CustomDatePickerProps {
    label?: string
    name: string
    form: UseFormReturn<any>
    placeholder?: string
    disabled?: boolean
}

const CustomDatePicker = ({
                              label,
                              name,
                              form,
                              placeholder = "Select date",
                              disabled = false,
                          }: CustomDatePickerProps) => {
    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem className="flex flex-col gap-2">
                    {label && <FormLabel>{label}</FormLabel>}
                    <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                    )}
                                    disabled={disabled}
                                >
                                    {field.value ? (
                                        format(field.value, "PPP")
                                    ) : (
                                        <span>{placeholder}</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <div className="bg-white rounded-md border shadow-sm">
                                <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={disabled}
                                    initialFocus
                                />
                            </div>
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

export default CustomDatePicker
