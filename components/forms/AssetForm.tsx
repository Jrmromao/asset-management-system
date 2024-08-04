'use client'
import React, {useEffect, useState} from 'react'
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {Button} from "@/components/ui/button"
import {Form,} from "@/components/ui/form"
import {useRouter} from "next/navigation";
import {Loader2} from "lucide-react";
import Dropzone from "@/components/Dropzone";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";
import {useAssetStore} from "@/lib/stores/assetStore";
import CustomSelect from "@/components/CustomSelect";
import {Card} from "@/components/ui/card";
import {useLicenseStore} from "@/lib/stores/licenseStore";
import {useCategoryStore} from "@/lib/stores/categoryStore";
import CustomInput from "@/components/CustomInput";
import {useDialogStore} from "@/lib/stores/store";
import {DialogContainer} from "@/components/dialogs/DialogContainer";
import CategoryForm from "@/components/forms/CategoryForm";
import {useStatusLabelStore} from "@/lib/stores/statusLabelStore";

const AssetForm = () => {

    const INITIAL_VALUES = {
        assetName: '',
        brand: '',
        model: '',
        serialNumber: '',
        purchasePrice: '',
        categoryId: '',
        licenseId: '',
        category: '',
        existingLicenseName: '',
        newLicenseName: '',
        issuedDate: '',
        expirationDate: '',
        key: '',
    }


    const [isLoading, setIsLoading] = useState(false)
    const [licenseQuestion, setLicenseQuestion] = useState('')
    const [openDialog, closeDialog, isOpen] = useDialogStore(state => [state.onOpen, state.onClose, state.isOpen])

    const [createAsset] = useAssetStore((state) => [state.create]);
    const [licenses, fetchLicenses] = useLicenseStore((state) => [state.licenses, state.getAll]);
    const [categories, fetchAll] = useCategoryStore((state) => [state.categories, state.getAll]);
    const [statusLabels, fetchAllStatusLabels] = useStatusLabelStore((state) => [state.statusLabels, state.getAll]);


    useEffect(() => {
        closeDialog()
        fetchLicenses()
        fetchAll()
        fetchAllStatusLabels()
    }, []);

    const schema = z.object({

        id: z.string().optional(),
        assetName: z.string().min(1, "Asset name is required"),
        brand: z.string().min(1, "Brand is required"),
        model: z.string().min(1, "Model is required"),
        serialNumber: z.string().min(1, "Serial number is required"),
        category: z.string().min(1, "Category is required"),
        purchasePrice: z.string()
            .regex(/^\d+(\.\d{1,2})?$/, "Amount must be a number")
            .min(1, "Amount is too short"),


        newLicenseName: licenseQuestion === 'no' ? z.string().min(1, "License name is required") : z.string().optional(),
        existingLicenseName: licenseQuestion === 'yes' ? z.string().min(1, "License name is required") : z.string().optional(),
        key: licenseQuestion === 'no' ? z.string().min(1, "Key is required") : z.string().optional(),
        issuedDate: licenseQuestion === 'no' ? z.string().min(1, "Issued date is required") : z.string().optional(),
        expirationDate: licenseQuestion === 'no' ? z.string().min(1, "Expiration date is required") : z.string().optional()
    })


    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: INITIAL_VALUES
    })

    const onSubmit = async (data: z.infer<typeof schema>) => {
        setIsLoading(true)
        try {
            const categoryId = Number(categories.find(c => c.name === data.category?.toString())?.id)
            const licenseId = licenseQuestion === 'yes'
                ? (licenses.find(l => l.name === data.existingLicenseName)?.id ?? 0)
                : 0;

            const assetData: Asset = {
                name: data.assetName || '',
                brand: data.brand || '',
                model: data.model || '',
                categoryId: categoryId || 0,
                serialNumber: data.serialNumber || '',
                purchasePrice: Number(data.purchasePrice) || 0,
                datePurchased: new Date().getDate().toString()
            }
            console.log(licenses)
            console.log(assetData)

            createAsset(assetData)
            form.reset({})

        } catch (e) {
            console.error(e)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <section className="w-full bg-white z-50 max-h-[700px] overflow-y-auto p-4">
            <DialogContainer open={isOpen} onOpenChange={closeDialog} title={'New Category'}
                             description={'Add a new Category'}
                             form={<CategoryForm setRefresh={() => {
                         }}/>}
            />


            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>

                    <Card className={'p-3.5'}>
                        <div className={'mt-6 header-2'}>Asset Details</div>

                        <div className={'flex flex-col md:flex-row gap-4 pt-5'}>

                            <div className={'flex-1'}>
                                <CustomInput control={form.control}   {...form.register("assetName")}
                                             label={'Asset Title'}
                                             placeholder={'eg. Keyboard'}
                                             type={'text'}/>
                            </div>

                            <div className={'flex-1'}>

                                <div className={'flex'}>
                                    <div className="flex-none w-9/12">
                                        <CustomSelect control={form.control}   {...form.register("category")}
                                                      label={'Category'}
                                                      data={categories}
                                                      placeholder={'eg. IT Equipment'}/>
                                    </div>
                                    <div className="flex-none w-3/12 mt-6 ml-8">
                                        <Button type={'button'} variant={'secondary'} className={'form-secondary-btn md:w-auto'} onClick={(() => openDialog())}>Add
                                            Category</Button>
                                    </div>
                                </div>


                            </div>
                        </div>
                        <div className={'flex flex-col md:flex-row gap-4  pt-5'}>
                            <div className={'flex-1'}>
                                <CustomInput control={form.control}  {...form.register("brand")} label={'Brand'}
                                             placeholder={'eg. Apple'}
                                             type={'text'}/>
                            </div>
                            <div className={'flex-1'}>
                                <CustomInput control={form.control}
                                             {...form.register("model")}
                                             label={'Model'}
                                             placeholder={'eg. Apple Keyboard'}
                                             type={'text'}/>
                            </div>
                        </div>
                        <div className={'flex flex-col md:flex-row gap-4 pt-5'}>

                            <div className={'flex-1'}>
                                <CustomInput control={form.control}   {...form.register("purchasePrice")}
                                             label={'Purchase Price'}
                                             placeholder={'eg. 1000'} type={'number'}/>
                            </div>

                            <div className={'flex-1'}>
                                <CustomInput control={form.control}   {...form.register("serialNumber")}
                                             label={'Serial Number'}
                                             placeholder={'eg. 1234'} type={'string'}/>
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
