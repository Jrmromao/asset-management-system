'use client'
import React, {useState} from 'react'
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {Button} from "@/components/ui/button"
import {Form,} from "@/components/ui/form"
import CustomInput from "@/components/forms/CustomInput";
import {formSchema} from "@/lib/utils";
import {Loader2} from "lucide-react";
import CustomTextarea from "@/components/forms/CustomTextarea";
import {createCategory, listCategories} from "@/lib/actions/category.actions";

const CategoryForm = ({setRefresh}:{setRefresh: (flag: boolean) => void}) => {
    const [isLoading, setIsLoading] = useState(false)
    const catFormSchema = formSchema('category')

    const form = useForm<z.infer<typeof catFormSchema>>({
        resolver: zodResolver(catFormSchema),
        defaultValues: {
            name: '',
            purchaseNotes: '',
        },
    }
    )
    const onSubmit = async (data: z.infer<typeof catFormSchema>) => {
        setIsLoading(true)
        try {
            const categoryData = {
                name: data.name,
            }
            await createCategory(categoryData).then(_ => setRefresh(true))
        } catch (e) {
            console.error(e)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <section className={''}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className={'flex flex-col md:flex-col gap-4 pt-5'}>
                            <CustomInput control={form.control} name={'name'} label={'Name'} placeholder={'Name'} type={'text'}/>
                    </div>
                    <Button type="submit" className={'form-btn mt-6 w-full md:w-auto'} disabled={isLoading}>
                        {isLoading ? (
                                <>
                                    <Loader2 size={20} className={'animate-spin'}/>&nbsp;
                                    Loading...
                                </>
                            ) :
                            'Submit'}
                    </Button>
                </form>
            </Form>
        </section>
    )
}
export default CategoryForm
