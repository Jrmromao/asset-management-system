'use client'
import React, {useState} from 'react'
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {Button} from "@/components/ui/button"
import {Form,} from "@/components/ui/form"
import {formSchema as assetFormSchema} from "@/lib/utils";
import {useRouter} from "next/navigation";
import {Loader2} from "lucide-react";
import Dropzone from "@/components/Dropzone";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";
import {useAssetStore} from "@/lib/stores/assetStore";
import CustomInput from "@/components/CustomInput";
import CustomSelect from "@/components/CustomSelect";
import {Card} from "@/components/ui/card";
import {useLicenseStore} from "@/lib/stores/licenseStore";
import {useCategoryStore} from "@/lib/stores/categoryStore";

const AssetForm = () => {

    const [isLoading, setIsLoading] = useState(false)
    const [user, setUser] = useState(null)
    const router = useRouter()
    const [date, setDate] = useState<Date | undefined>(new Date())

    const [licenseQuestion, setLicenseQuestion] = useState('')

    const formSchema = assetFormSchema('asset')
    z
    // Zustand Stores
    const [createAsset] = useAssetStore((state) => [state.createAsset]);
    const [licenses] = useLicenseStore((state) => [state.licenses]);
    const [categories] = useCategoryStore((state) => [state.categories]);


    const INITIAL_VALUES = {
        name: '',
        brand: '',
        model: '',
        serialNumber: '',
        purchaseNotes: '',
        purchasePrice: '',
        category: '',
        datePurchased: '',
        certificateUrl: '',
        licenceUrl: '',
        assigneeId: '',
        licenseName: '',
        key: '',
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: INITIAL_VALUES
    })


    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsLoading(true)
        try {
            const categoryId = Number(categories.find(c => c.name === data.category?.toString())?.id)
            const licenseId = licenseQuestion === 'yes'
                ? (licenses.find(l => l.name === data.existingLicenseName)?.id ?? 0)
                : 0;


            console.log(categoryId)
            const assetData: Asset = {
                name: data.name || '',
                brand: data.brand || '',
                model: data.model || '',
                categoryId: categoryId,
                serialNumber: data.serialNumber || '',
                purchasePrice: Number(data.purchasePrice) || 0,
                datePurchased: new Date().getDate().toString(),
                license: {
                    id: licenseId,
                    name: data.newLicenseName || data.existingLicenseName ||'' ,
                    key: data.key || '',
                    licenseUrl: '',
                    issuedDate: new Date('2023-01-09'),
                    expirationDate: new Date('2026-01-09'),
                }
            }


            console.log(assetData)

            createAsset(assetData)
            form.reset()

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

                    <Card className={'p-3.5'}>
                        <div className={'mt-6 header-2'}>Asset Details</div>

                        <div className={'flex flex-col md:flex-row gap-4 pt-5'}>

                            <div className={'flex-1'}>
                                <CustomInput control={form.control} name={'assetName'} label={'Asset Name'}
                                             placeholder={'eg. Keyboard'}
                                             type={'text'}/>
                            </div>

                            <div className={'flex-1'}>
                                <CustomSelect control={form.control} name={'category'} label={'Category'}
                                              data={categories}
                                              placeholder={'eg. IT Equipment'}/>
                            </div>
                        </div>
                        <div className={'flex flex-col md:flex-row gap-4  pt-5'}>
                            <div className={'flex-1'}>
                                <CustomInput control={form.control} name={'brand'} label={'Brand'}
                                             placeholder={'eg. Apple'}
                                             type={'text'}/>
                            </div>
                            <div className={'flex-1'}>
                                <CustomInput control={form.control} name={'model'} label={'Model'}
                                             placeholder={'eg. Apple Keyboard'}
                                             type={'text'}/>
                            </div>
                        </div>
                        <div className={'flex flex-col md:flex-row gap-4 pt-5'}>

                            <div className={'flex-1'}>
                                <CustomInput control={form.control} name={'purchasePrice'} label={'Purchase Price'}
                                             placeholder={'eg. 1000'} type={'number'}/>
                            </div>

                            <div className={'flex-1'}>
                                <CustomInput control={form.control} name={'serialNumber'} label={'Serial Number'}
                                             placeholder={'eg. 1234'} type={'string'}/>
                            </div>
                        </div>


                        <hr className={'mt-9 border-1'}/>

                        <div className={'mt-6 header-2'}>License Details</div>


                        <p className={'mt-2 text-sm'}>Do you have a license for this asset?</p>


                        <div className="flex items-center space-x-2">
                            <Label> Yes</Label><Checkbox id="terms" checked={licenseQuestion === 'yes'}
                                                         onClick={() => setLicenseQuestion('yes')}/>
                            <Label> No</Label> <Checkbox id="terms" checked={licenseQuestion === 'no'}  
                                                         onClick={() => setLicenseQuestion('no')}/>
                        </div>

                        <CustomSelect control={form.control} name={'existingLicenseName'} label={'License'}
                                      data={licenses}
                                      placeholder={'eg. MS Office'}/>


                        <div className={'flex flex-col md:flex-row gap-4 pt-5'}>
                            <div className={'flex-1'}>
                                <CustomInput control={form.control} name={'newLicenseName'} label={'License Name'}
                                             placeholder={'eg. MS Office'}
                                             type={'text'}/>
                            </div>
                            <div className={'flex-1'}>
                                <CustomInput control={form.control} name={'key'} label={'License Key'}
                                             placeholder={'eg. XX-XX-XX-XX-XX-XX'}
                                             type={'text'}/>
                            </div>
                        </div>

                        <div className={'flex flex-col md:flex-row gap-4 pt-5'}>
                            <div className={'flex-1'}>
                                <CustomInput control={form.control} name={'issuedDate'} label={'Issued Date'}
                                             placeholder={'eg. 2022-12-31'}
                                             type={'text'}/>
                            </div>
                            <div className={'flex-1'}>
                                <CustomInput control={form.control} name={'expirationDate'} label={'Expiration Date'}
                                             placeholder={'eg. 2026-12-31'}
                                             type={'text'}/>

                            </div>
                        </div>

                        <div className={'flex flex-col md:flex-row gap-4 pt-5'}>
                            <div className={'flex-1'}>
                                <Dropzone label={'License Certificate'} docType={'certificate'}/>
                            </div>
                            <div className={'flex-1'}>
                                <Dropzone label={'Asset key'} docType={'key'}/>
                            </div>
                        </div>
                    </Card>
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
