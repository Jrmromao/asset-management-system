'use client'
import React, {useEffect, useState} from 'react'
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {Button} from "@/components/ui/button"
import {Form,} from "@/components/ui/form"
import CustomInput from "@/components/forms/CustomInput";
import {formSchema as assetFormSchema} from "@/lib/utils";
import {useRouter} from "next/navigation";
import {create} from "@/lib/actions/assets.actions";
import {getCategories} from "@/lib/actions/category.actions";
// import { Calendar } from "@/components/ui/calendar"
import {Loader2} from "lucide-react";
import CustomTextarea from "@/components/forms/CustomTextarea";
import {useDialogStore} from "@/lib/stores/store";
import Dropbox from "next-auth/providers/dropbox";
import Dropzone from "@/components/Dropzone";
import CustomSelect from "@/components/forms/CustomSelect";
import YesNoQuestion from "@/components/YesNoQuestion";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";

const AssetForm = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [user, setUser] = useState(null)
    const formSchema = assetFormSchema('asset')
    const router = useRouter()
    const [date, setDate] = useState<Date | undefined>(new Date())
    const closeDialog = useDialogStore((state) => state.onClose)
    const [categories, setCategories] = useState<Category[]>([])
    const [licenseQuestion, setLicenseQuestion] = useState('')


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: '',
            name: '',
            brand: '',
            model: '',
            serialNumber: '',
            purchaseNotes: '',
            purchasePrice: '',
        },
    })

    useEffect(() => {
        getCategories().then(r => {
            setCategories(r)
        })
    }, [getCategories, setCategories])


    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsLoading(true)
        try {
            const assetData = {
                name: data.name,
                brand: data.brand || '',
                model: data.model || '',
                categoryId: categories.find(c => c.name === data.category?.toString())?.id || 0,
                serialNumber: data.serialNumber || '',
                purchasePrice: Number(data.purchasePrice) || 0,
                datePurchased: new Date().getDate().toString(),
            }
            await create(assetData).then(r => {
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
        <section className="w-full bg-white z-50 max-h-[700px] overflow-y-auto p-4">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>

                    <div className={'mt-6 header-2'}>Asset Details</div>

                    <div className={'flex flex-col md:flex-row gap-4 pt-5'}>

                        <div className={'flex-1'}>
                            <CustomInput control={form.control} name={'name'} label={'Name'} placeholder={'Name'}
                                         type={'text'}/>
                        </div>


                        <div className={'flex-1'}>
                            <CustomSelect control={form.control} name={'category'} label={'Category'} data={categories}
                                          placeholder={'Select a Category'}/>
                        </div>
                    </div>
                    <div className={'flex flex-col md:flex-row gap-4  pt-5'}>
                        <div className={'flex-1'}>
                            <CustomInput control={form.control} name={'brand'} label={'Brand'} placeholder={'brand'}
                                         type={'text'}/>
                        </div>
                        <div className={'flex-1'}>
                            <CustomInput control={form.control} name={'model'} label={'Model'}
                                         placeholder={'Model'}
                                         type={'text'}/>
                        </div>
                    </div>
                    <div className={'flex flex-col md:flex-row gap-4 pt-5'}>

                        <div className={'flex-1'}>
                            <CustomInput control={form.control} name={'purchasePrice'} label={'Purchase Price'}
                                         placeholder={'Purchase Price'} type={'number'}/>
                        </div>

                        <div className={'flex-1'}>
                            <CustomInput control={form.control} name={'serialNumber'} label={'Serial Number'}
                                         placeholder={'Serial Number'} type={'string'}/>
                        </div>
                    </div>

                    <div className={'flex flex-col md:flex-row gap-4 pt-5'}>
                        <div className={'flex-1'}>
                            <Dropzone label={'License'}/>
                        </div>
                        <div className={'flex-1'}>
                            <Dropzone label={'Certificate'}/>
                        </div>
                    </div>

                    <div className={'mt-6 header-2'}>License</div>


                    <p className={'mt-2 text-sm'}>Do you have a license for this asset?</p>

                    <div className="flex items-center space-x-2">
                        <Label> Yes</Label><Checkbox id="terms" checked={licenseQuestion === 'yes'}
                                                     onClick={() => setLicenseQuestion('yes')}/>
                        <Label> No</Label> <Checkbox id="terms" checked={licenseQuestion === 'no'}
                                                     onClick={() => setLicenseQuestion('no')}/>
                    </div>

                    {licenseQuestion === 'yes' && <p className={'mt-2 text-sm'}>Select a license</p>}
                    {licenseQuestion === 'no' && <p className={'mt-2 text-sm'}>License Form</p>}



                    <Button type="submit" className={'form-btn mt-6 w-full  md:w-auto'} disabled={isLoading}>

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
