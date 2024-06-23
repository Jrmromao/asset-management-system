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
import {createAsset} from "@/lib/actions/assets.actions";
// import { Calendar } from "@/components/ui/calendar"
import {Loader2} from "lucide-react";
import CustomTextarea from "@/components/forms/CustomTextarea";
import {useDialogStore} from "@/lib/stores/store";

const AssetForm = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [user, setUser] = useState(null)
    const formSchema = assetFormSchema('asset')
    const router = useRouter()
    const [date, setDate] = useState<Date | undefined>(new Date())
    const closeDialog = useDialogStore((state) => state.onClose)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: '',
            name: '',
            // note: '',
            status: '',
            brand: '',
            purchaseNotes: '',
            purchasePrice: '',
            // purchaseDate: ''
        },
    })

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsLoading(true)
        console.log(data)
        try {
            const assetData = {
                name: data.name,
                description: data.purchaseNotes,
                categoryId: 4,
                status: 'active',
                purchasePrice: 10000,
                location: 'Dublin',
                datePurchased: new Date().getDate().toString(),
            }
            await createAsset(assetData).then(r => closeDialog())
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

                            <CustomInput control={form.control} name={'id'} label={'Asset ID'}
                                         placeholder={'Auto generate'} type={'text'}/>
                        </div>
                        <div className={'flex-1'}>
                            <CustomInput control={form.control} name={'name'} label={'Name'} placeholder={'Name'}
                                         type={'text'}/>
                        </div>
                    </div>
                    <div className={'flex flex-col md:flex-row gap-4  pt-5'}>
                        <div className={'flex-1'}>
                            <CustomInput control={form.control} name={'status'} label={'Status'} placeholder={'status'}
                                         type={'text'}/>
                        </div>
                        <div className={'flex-1'}>
                            <CustomInput control={form.control} name={'brand'} label={'Brand'} placeholder={'brand'}
                                         type={'text'}/>
                        </div>
                    </div>
                    <div className={'flex flex-col md:flex-row gap-4 pt-5'}>
                        <div className={'flex-1'}>
                            <CustomTextarea control={form.control} name={'purchaseNotes'} label={'Purchase Notes'}
                                            placeholder={'purchaseNotes'}/>
                        </div>
                        <div className={'flex-1'}>
                            <CustomInput control={form.control} name={'purchasePrice'} label={'Purchase Price'}
                                         placeholder={'purchasePrice'} type={'number'}/>
                        </div>
                    </div>
                    <div className={'flex flex-col md:flex-row gap-4 pt-5'}>
                        {/*<CustomInput control={form.control} name={'purchaseDate'} label={'Purchase Date'}*/}
                        {/*             placeholder={'YYYY/MM/DD'} type={'date'}/>*/}
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
export default AssetForm
