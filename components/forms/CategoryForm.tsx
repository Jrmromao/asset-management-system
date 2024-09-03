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
import {categorySchema} from "@/lib/schemas";
import {sleep} from "@/lib/utils";
import {toast} from "sonner";


const CategoryForm = () => {
    const [isLoading, setIsLoading] = useState(false)

    const [ fetchAll, createCat, closeDialog] = useCategoryStore((state) => [state.getAll, state.createCat, state.onClose]);

    const onSubmit = async (data: z.infer<typeof categorySchema>) => {
        setIsLoading(true)
        try {
            const categoryData = {
                name: data.name || '',
            }
            await createCat(categoryData)
            await sleep()
        } catch (e) {
            console.error(e)
        } finally {
            await sleep().then(_ => {
                toast.success('Category created successfully')
                form.reset()
                fetchAll()
                closeDialog()
            })
            setIsLoading(false)
        }

    }

    const form = useForm<z.infer<typeof categorySchema>>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: '',
        },
    });

    const {register} = form

    return (
        <section className={''}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className={'flex flex-col md:flex-col gap-4 pt-5'}>
                        <CustomInput
                            label="Name"
                            placeholder="name"
                            control={form.control}
                            {...register("name")}
                            type={'text'}
                        />
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
