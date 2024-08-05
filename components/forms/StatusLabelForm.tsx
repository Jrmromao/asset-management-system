'use client'
import React, {useState} from 'react'
import {z, ZodIssue} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {Button} from "@/components/ui/button"
import {Form} from "@/components/ui/form"
import {Loader2} from "lucide-react";
import CustomInput from "@/components/CustomInput";
import {useDialogStore} from "@/lib/stores/store";
import {useStatusLabelStore} from "@/lib/stores/statusLabelStore";
import CustomColorPicker from "@/components/CustomColorPicker";
import CustomSwitch from "@/components/CustomSwitch";

const CategoryForm = ({setRefresh}: { setRefresh: (flag: boolean) => void }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [closeDialog, createStatusLabel] = useStatusLabelStore(state => [state.onClose, state.create])

    const schema = z.object({
        name: z
            .string()
            .min(3, {message: 'Name must be at least 3 characters'})
            .max(50, {message: 'Name must not be more than 50 characters'}),
        description: z.string().min(1, "Description is required"),
        colorCode: z.string().optional(),
        isArchived: z.boolean().optional(),
        allowLoan: z.boolean().optional(),
    });


    const onSubmit = async (data: z.infer<typeof schema>) => {
        setIsLoading(true)
        try {

            createStatusLabel({
                name: data.name,
                colorCode: data.colorCode!,
                isArchived: data.isArchived || false,
                allowLoan: data.allowLoan! || true,
                description: data.description
            })

        } catch (e) {
            console.error(e)

        } finally {
            closeDialog()
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
                            placeholder="eg. Available"
                            control={form.control}
                            {...register("name")}
                            type={'text'}
                        />
                        <CustomInput
                            label="Description"
                            placeholder="eg. Asset is available"
                            control={form.control}
                            {...register("description")}
                            type={'text'}
                        />
                        <CustomSwitch
                            label="Is Archivable"
                            control={form.control}
                            {...register("isArchived")}
                        />
                        <CustomSwitch
                            label="Allow Loan"
                            control={form.control}
                            {...register("allowLoan")}
                        />
                        <CustomColorPicker
                            label="Color Code"
                            control={form.control}
                            {...register("colorCode")}
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
