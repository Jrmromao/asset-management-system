'use client'
import React, {useState} from 'react'
import {z, ZodIssue} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {Button} from "@/components/ui/button"
import {Form} from "@/components/ui/form"
import {Loader2} from "lucide-react";
import CustomInput from "@/components/CustomInput";
import {useCategoryStore} from "@/lib/stores/categoryStore";
import {categorySchema, kitItemSchema} from "@/lib/schemas";
import {sleep} from "@/lib/utils";
import {toast} from "sonner";
import CustomSelect from "@/components/CustomSelect";


interface KitItemFormProps {
    data: Asset[] | License[] | Category[]
    control: any
    name: string
    placeholder: string
    value: any
    label: string
    onClose: () => void

}




const KitItemForm = ({data, control, name, placeholder, value, label, onClose}: KitItemFormProps) => {
    const [isLoading, setIsLoading] = useState(false)



    const form = useForm<z.infer<typeof kitItemSchema>>({
        resolver: zodResolver(kitItemSchema),
        defaultValues: {
            name: '',
        },
    });



    return (
        <section className={''}>
            <Form {...form}>
                <form>
                    <div className={'flex flex-col md:flex-col gap-4 pt-5'}>
                    <CustomSelect control={control} name={name} label={label} placeholder={placeholder} value={value} data={data}   />
                    </div>
                </form>
            </Form>

            <Button type="button" onClick={onClose} className={'form-btn mt-6 w-full md:w-auto'} disabled={isLoading}>
                {isLoading ? (
                        <>
                            <Loader2 size={20} className={'animate-spin'}/>&nbsp;
                            Loading...
                        </>
                    ) :
                    'Submit'}
            </Button>
        </section>
    )
}
export default KitItemForm
