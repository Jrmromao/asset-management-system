'use client'
import React, {useEffect, useState} from 'react'
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {Button} from "@/components/ui/button"
import {Form,} from "@/components/ui/form"
import {Loader2} from "lucide-react";
import {useAssetStore} from "@/lib/stores/assetStore";
import CustomSelect from "@/components/CustomSelect";
import {Card} from "@/components/ui/card";
import {useCategoryStore} from "@/lib/stores/categoryStore";
import CustomInput from "@/components/CustomInput";
import {useDialogStore} from "@/lib/stores/store";
import {DialogContainer} from "@/components/dialogs/DialogContainer";
import CategoryForm from "@/components/forms/CategoryForm";
import {useStatusLabelStore} from "@/lib/stores/statusLabelStore";
import StatusLabelForm from "@/components/forms/StatusLabelForm";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {revalidatePath} from "next/cache";


interface AssetFormProps {
    asset?: Asset | null | undefined
    isUpdate?: boolean
}

const AssetForm = ({asset, isUpdate = false}: AssetFormProps) => {

    const INITIAL_VALUES = {
        assetName: asset?.name,
        brand: asset?.brand,
        model: asset?.model,
        categoryId: asset?.categoryId,
        statusLabelId: asset?.statusLabelId,
        serialNumber: asset?.serialNumber,
        price: asset?.price,
        category: asset?.category?.name,
        statusLabel: asset?.statusLabel?.name,
        datePurchased: new Date().getDate().toString()


    }
    const navigate = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [openDialog, closeDialog, isOpen] = useDialogStore(state => [state.onOpen, state.onClose, state.isOpen])
    const [createAsset, updateAsset] = useAssetStore((state) => [state.create, state.update]);
    const [categories, fetchAll] = useCategoryStore((state) => [state.categories, state.getAll]);
    const [statusLabels, fetchAllStatusLabels, closeSL, openSL, isOpenSL] = useStatusLabelStore((state) => [state.statusLabels, state.getAll, state.onClose, state.onOpen, state.isOpen]);


    useEffect(() => {
        if (isUpdate) {
            form.setValue('assetName', asset?.name!);
            form.setValue('brand', asset?.brand!);
            form.setValue('model', asset?.model!);
            form.setValue('serialNumber', asset?.serialNumber!);
            form.setValue('category', asset?.category?.name!);
            form.setValue('statusLabel', asset?.statusLabel?.name!);
            form.setValue('price', asset?.price!);
            form.setValue('category', asset?.category?.name!);
        }
        closeDialog()
        fetchAll()
        fetchAllStatusLabels()
    }, [asset]);

    const schema = z.object({

        id: z.string().optional(),
        assetName: z.string().min(1, "Asset name is required"),
        brand: z.string().min(1, "Brand is required"),
        model: z.string().min(1, "Model is required"),
        serialNumber: z.string().min(1, "Serial number is required"),
        category: z.string().min(1, "Category is required"),
        statusLabel: z.string().min(1, "Status label is required"),
        price: z
            .string({ required_error: "Price is required" })
            .transform((value) => Number(value))
            .refine((value) => value >= 1, { message: "Price must be at least 1" })

    })


    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: INITIAL_VALUES
    })


    const onSubmit = async (data: z.infer<typeof schema>) => {
        setIsLoading(true)
        try {
            const categoryId = categories.find(c => c.name === data.category?.toString())?.id
            const statusLabelId = statusLabels.find(c => c.name === data.statusLabel?.toString())?.id

            const assetData: Asset = {
                name: data.assetName,
                brand: data.brand,
                model: data.model,
                categoryId: categoryId!,
                statusLabelId: statusLabelId,
                serialNumber: data.serialNumber,
                price: data.price,
                datePurchased: new Date().getDate().toString()
            }

            if (isUpdate) {
                updateAsset(String(asset?.id), assetData).then(_ => {
                    toast.success('Asset updated successfully', {
                        position: 'top-right',
                    })
                    navigate.back()
                })
            } else {
                createAsset(assetData)
            }
            form.reset(INITIAL_VALUES)
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
                             }}/>}/>

            <DialogContainer open={isOpenSL} onOpenChange={closeSL} title={'New Status Label'}
                             description={'Add a new Status Label'}
                             form={<StatusLabelForm setRefresh={() => {
                             }}/>}/>


            <Form {...form}>

                <form onSubmit={form.handleSubmit(onSubmit)}>

                    <Card className={'flex flex-col gap-4 p-3.5 mb-5'}>

                        <CustomInput control={form.control} {...form.register("assetName")}
                                     label={'Asset Title'}
                                     placeholder={'eg. Keyboard'}
                                     type={'text'}/>


                        <div className={'flex '}>
                            <div className="flex-none w-9/12">
                                <CustomSelect control={form.control}   {...form.register("category")}
                                              label={'Category'}
                                              data={categories}
                                              placeholder={'eg. IT Equipment'}
                                              value={form.watch('category')}

                                />
                            </div>
                            <div className="flex-none w-3/12 mt-6 ml-8">
                                <Button type={'button'} variant={'secondary'}
                                        className={'form-secondary-btn md:w-auto'}
                                        onClick={openDialog}>Add
                                    Category</Button>
                            </div>
                        </div>

                        <CustomInput control={form.control}  {...form.register("brand")} label={'Brand'}
                                     placeholder={'eg. Apple'}
                                     type={'text'}/>


                        <CustomInput control={form.control}
                                     {...form.register("model")}
                                     label={'Model'}
                                     placeholder={'eg. Apple Keyboard'}
                                     type={'text'}/>

                        <CustomInput control={form.control}   {...form.register("price")}
                                     label={'Purchase Price'}
                                     placeholder={'eg. 1000'} type={'number'}/>


                        <CustomInput control={form.control}   {...form.register("serialNumber")}
                                     label={'Serial Number'}
                                     placeholder={'eg. 1234'} type={'text'}/>

                        <div className={'flex'}>
                            <div className="flex-none w-9/12">
                                <CustomSelect control={form.control}   {...form.register("statusLabel")}
                                              label={'Status Label'}
                                              data={statusLabels}
                                              placeholder={'eg. Available'}
                                              value={form.watch('statusLabel')}

                                />
                            </div>
                            <div className="flex-none w-3/12 mt-6 ml-8">
                                <Button type={'button'} variant={'secondary'}
                                        className={'form-secondary-btn md:w-auto'}
                                        onClick={(() => openSL())}>Add Status Label</Button>
                            </div>
                        </div>

                    </Card>
                    <Button type="submit" className={'form-btn mt-6 w-full  md:w-auto'} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 size={20} className={'animate-spin'}/>&nbsp;
                                Loading...
                            </>
                        ) : isUpdate ? 'Update' : 'Submit'}
                    </Button>
                </form>
            </Form>

        </section>
    )
}
export default AssetForm
