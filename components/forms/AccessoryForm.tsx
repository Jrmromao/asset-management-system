'use client'
import React, {useEffect, useState} from 'react'
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {Button} from "@/components/ui/button"
import {Form,} from "@/components/ui/form"
import {InfoIcon, Loader2} from "lucide-react";
import {Card} from "@/components/ui/card";
import CustomInput from "@/components/CustomInput";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert"
import {useAccessoryStore} from "@/lib/stores/accessoryStore";

interface AccessoryFormProps {
    accessory?: Accessory
}

const AccessoryForm = ({accessory}: AccessoryFormProps) => {

    const INITIAL_VALUES = {
        title: accessory?.title || '',
        totalQuantityCount: accessory?.totalQuantityCount || 0,
        minQuantityAlert: accessory?.minQuantityAlert || 0,
        alertEmail: accessory?.alertEmail || '',
        vendor: accessory?.vendor || '',
        purchaseDate: accessory?.purchaseDate,
        description: accessory?.description || '',
    }


    const [isLoading, setIsLoading] = useState(false)
    const [licenseQuestion, setLicenseQuestion] = useState('')
    const [needLicense, setNeedLicense] = useState('')
    // const [openDialog, closeDialog, isOpen] = useDialogStore(state => [state.onOpen, state.onClose, state.isOpen])

    const [createAccessory] = useAccessoryStore((state) => [state.create]);


    useEffect(() => {
        // closeDialog()
    }, []);

    const schema = z.object({

        title: z.string().min(1, "Title name is required"),

        totalQuantityCount: z.string({required_error: "Quantity count is required"})
            .transform((value) => Number(value))
            .refine((value) => value >= 1, {message: "Quantity count must be at least 1"}),
        minQuantityAlert: z.string({required_error: "Min. quantity is required"})
            .transform((value) => Number(value))
            .refine((value) => value >= 1, {message: "Min. quantity must be at least 1"}),


        alertEmail: z.string().email().min(1, "Alert email is required"),


        vendor: z.string().min(1, "Vendor is required"),
        purchaseDate: z.date().optional(),//z.date().min(new Date(1900, 0, 1), 'Date must be after January 1, 1900').max(new Date(), 'Date must be before today'),
        description: z.string().optional()

    })
        .refine((data) => data.totalQuantityCount <= data.minQuantityAlert, {
            message: "Min. quantity must be less than or equal to quantity count.",
            path: ["minQuantityAlert"],
        })


    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: INITIAL_VALUES
    })

    const onSubmit = async (data: z.infer<typeof schema>) => {
        setIsLoading(true)

        console.log('data')
        try {
            createAccessory({
                title: data.title || '',
                totalQuantityCount: Number(data.totalQuantityCount),
                minQuantityAlert: Number(data.minQuantityAlert),
                alertEmail: data.alertEmail || '',
                vendor: data.vendor || '',
                purchaseDate: new Date(), // data.purchaseDate || '',
                description: data.description || '',
                categoryId: 0,
                companyId: 0
            })
            form.reset({})

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
                    <Card className={'p-3.5 mb-5'}>
                        <div className={'mt-6 header-2'}>Accessory Title and Quantity count</div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-4">
                                <div className="flex flex-col gap-4 pt-5">
                                    <div className="flex-1">
                                        <CustomInput
                                            control={form.control}
                                            {...form.register("title")}
                                            label="Accessory Title"
                                            placeholder="e.g. Office Keyboard"
                                            type="text"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 pt-5">
                                    <div className="flex-1">
                                        <CustomInput
                                            control={form.control}
                                            {...form.register("totalQuantityCount", {valueAsNumber: true})}
                                            label="Quantity Count"
                                            placeholder="e.g. 50"
                                            type="number"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 pt-5">
                                    <div className="flex-1">
                                        <CustomInput
                                            control={form.control}
                                            {...form.register("minQuantityAlert", {valueAsNumber: true, min: 1})}
                                            label="Min. Quantity Alert"
                                            placeholder="e.g. 15"
                                            type="number"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 pt-5">
                                    <div className="flex-1">
                                        <CustomInput control={form.control}   {...form.register("alertEmail")}
                                                     label={'Licensed To Email'}
                                                     placeholder={'e.g. joe@ecokeepr.com'}
                                                     type={'text'}/>
                                    </div>
                                    <div className={'flex-1'}/>
                                </div>
                            </div>

                            <div className="bg-white p-4 md:mt-11 ">
                                <Alert>
                                    <InfoIcon className="h-4 w-4"/>
                                    <AlertTitle>Note</AlertTitle>
                                    <AlertDescription>
                                        An automatic email will be sent when the number of available licenses reaches
                                        the minimum required count.
                                    </AlertDescription>
                                </Alert>
                            </div>
                        </div>
                    </Card>

                    <Card className={'p-3.5 mb-5'}>
                        <div className={'mt-6 header-2'}>Vendor & Purchase details</div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-4">
                                <div className="flex flex-col gap-4 pt-5">
                                    <div className="flex-1">
                                        <CustomInput control={form.control}   {...form.register("vendor")}
                                                     label={'Vendor'}
                                                     placeholder={'eg. Microsoft'}
                                                     type={'text'}/>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-4 pt-5">
                                    <div className="flex-1">
                                        <CustomInput control={form.control}   {...form.register("purchaseDate")}
                                                     label={'Purchase Date'}
                                                     placeholder={'eg. 2023-12-31'}
                                                     type={'date'}/>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 pt-5">
                                    <div className="flex-1">
                                        <CustomInput control={form.control}   {...form.register("description")}
                                                     label={'Description'}
                                                     placeholder={'eg. This is a description'}
                                                     type={'text'}/>
                                    </div>
                                    <div className={'flex-1'}/>
                                </div>
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
                            'Submit License'}
                    </Button>
                </form>
            </Form>

        </section>
    )
}
export default AccessoryForm
