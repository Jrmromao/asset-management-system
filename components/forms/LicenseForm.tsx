'use client'
import React, {useState} from 'react'
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {Button} from "@/components/ui/button"
import {Form,} from "@/components/ui/form"
import CustomInput from "@/components/forms/CustomInput";
import {formSchema as assetFormSchema} from "@/lib/utils";
import {useRouter} from "next/navigation";
import {create} from "@/lib/actions/licenseTool.actions";
import {Loader2} from "lucide-react";
import CustomTextarea from "@/components/forms/CustomTextarea";
import {useDialogStore} from "@/lib/stores/store";

const LicenseForm = () => {
    const [isLoading, setIsLoading] = useState(false)
    const formSchema = assetFormSchema('license')
    const router = useRouter()
    const closeDialog = useDialogStore((state) => state.onClose)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: '',
            name: '',
            key: '',
        },
    })


    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsLoading(true)
        try {
            const licenseData = {
                name: data.name,
                key: data.key!,
                issuedDate:  new Date(),
                expirationDate:  new Date(),
            }
            await create(licenseData).then(r => {
                form.reset()
                closeDialog()
            })
        } catch (e) {
            console.error(e)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <section className="w-full bg-white z-50">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>

                    <div className={'flex flex-col md:flex-row gap-4 pt-5'}>
                        <div className={'flex-1'}>

                            <CustomInput control={form.control} name={'name'} label={'Name'} placeholder={'Name'} type={'text'}/>
                        </div>
                        <div className={'flex-1'}>
                            <CustomInput control={form.control} name={'key'} label={'Key'} placeholder={'Key'} type={'text'}/>
                        </div>
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
export default LicenseForm
