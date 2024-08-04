'use client'
import React, {useState} from 'react'
import {z, ZodIssue} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {Button} from "@/components/ui/button"
import {Form} from "@/components/ui/form"
import {Loader2} from "lucide-react";
import CustomInput from "@/components/CustomInput";
import {createCategory} from "@/lib/actions/category.actions";
import {useDialogStore} from "@/lib/stores/store";
import {useCategoryStore} from "@/lib/stores/categoryStore";

const CategoryForm = ({setRefresh}: { setRefresh: (flag: boolean) => void }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [closeDialog] = useDialogStore(state => [ state.onClose, state.onClose])
    const [ fetchAll] = useCategoryStore((state) => [state.getAll]);

    const schema = z.object({

        name: z
            .string()
            .min(3, {message: 'Name must be at least 3 characters'})
            .max(50, {message: 'Name must not be more than 50 characters'})
    });


    const onSubmit = async (data: z.infer<typeof schema>) => {
        setIsLoading(true)
        try {
            const categoryData = {
                name: data.name || '',
            }
            await createCategory(categoryData).then(_ => {
                setRefresh(true)
                form.reset()
                fetchAll()
                closeDialog()
            })
        } catch (e) {
            console.error(e)
        } finally {
            setIsLoading(false)
        }

    }

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
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
