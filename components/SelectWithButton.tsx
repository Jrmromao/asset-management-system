import React from 'react'
import { UseFormReturn } from "react-hook-form"
import CustomSelect from "@/components/CustomSelect"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface SelectWithButtonProps {
    name: string
    label: string
    form: UseFormReturn<any>
    data: any[]
    onNew: () => void
    placeholder: string
    required?: boolean
    isPending?: boolean
}

export const SelectWithButton = ({
                                     name,
                                     label,
                                     data,
                                     onNew,
                                     placeholder,
                                     form,
                                     isPending = false,
                                     required = false
                                 }: SelectWithButtonProps) => (
    <div className="flex gap-2 relative">
        <div className="flex-1">
            <CustomSelect
                value={form.watch(name)}
                name={name}
                required={required}
                label={label}
                control={form.control}
                data={data}
                placeholder={placeholder}
            />
        </div>
        <div className="flex items-end">
            <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                    e.preventDefault(); // Prevent form submission
                    onNew();
                }}
                className="h-10 z-10"
                // disabled={isPending}
            >
                <Plus className="h-4 w-4"/>
            </Button>
        </div>
    </div>
)