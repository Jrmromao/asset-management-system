'use client'
import React, {useEffect, useState} from 'react'
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {Button} from "@/components/ui/button"
import {Form,} from "@/components/ui/form"
import {InfoIcon, Loader2} from "lucide-react";
import {useAssetStore} from "@/lib/stores/assetStore";
import {Card} from "@/components/ui/card";
import {useLicenseStore} from "@/lib/stores/licenseStore";
import CustomInput from "@/components/CustomInput";
import {useDialogStore} from "@/lib/stores/store";
import {DialogContainer} from "@/components/dialogs/DialogContainer";
import CategoryForm from "@/components/forms/CategoryForm";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert"
import CustomTextarea from "@/components/CustomTextarea";
import CustomDatePicker from "@/components/CustomDatePicker";
import {licenseSchema} from "@/lib/schemas";


interface LicenseFormProps {
    license?: License
}


const LicenseForm = ({license}: LicenseFormProps) => {

    const INITIAL_VALUES = {
        licenseName: license?.name,
        licenseCopiesCount: license?.licenseCopiesCount.toString(),
        minCopiesAlert: license?.minCopiesAlert.toString(),
        licensedEmail: license?.licensedEmail,

        purchaseDate: license?.purchaseDate,
        renewalDate: license?.renewalDate,

        alertRenewalDays: license?.alertRenewalDays.toString(),
        purchasePrice: license?.purchasePrice.toString(),
        vendor: license?.vendor,
        licenseKey: license?.licenseKey,
        notes: license?.purchaseNotes,
    }


    const [isLoading, setIsLoading] = useState(false)
    const [licenseQuestion, setLicenseQuestion] = useState('')
    const [needLicense, setNeedLicense] = useState('')
    const [openDialog, closeDialog, isOpen] = useDialogStore(state => [state.onOpen, state.onClose, state.isOpen])

    const [createAsset] = useAssetStore((state) => [state.create]);
    const [licenses, createLicense] = useLicenseStore((state) => [state.licenses, state.create]);
    const [purchaseDate, setPurchaseDate] = useState<Date>()
    const [renewalDate, setRenewalDate] = useState<Date>()


    useEffect(() => {
        closeDialog()
    }, []);


    const form = useForm<z.infer<typeof licenseSchema>>({
        resolver: zodResolver(licenseSchema),
        defaultValues: INITIAL_VALUES
    })

    const onSubmit = async (data: z.infer<typeof licenseSchema>) => {
        setIsLoading(true)

        try {
            createLicense({
                name: data.licenseName,
                licenseCopiesCount: Number(data.licenseCopiesCount),
                minCopiesAlert: Number(data.minCopiesAlert),
                licensedEmail: data.licensedEmail,
                renewalDate: new Date(data.renewalDate),
                alertRenewalDays: Number(data.alertRenewalDays),
                purchasePrice: Number(data.purchasePrice),
                vendor: data.vendor,
                licenseKey: data.licenseKey,
                purchaseDate: new Date(data.purchaseDate),
                purchaseNotes: data.notes || '',
            })

            form.reset(INITIAL_VALUES)
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
                        <div className={'mt-6 header-2'}>License Title and Copies count</div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-4">
                                <div className="flex flex-col gap-4 pt-5">
                                    <div className="flex-1">
                                        <CustomInput
                                            control={form.control}
                                            {...form.register("licenseName")}
                                            label="License Title"
                                            placeholder="e.g. MS Office"
                                            type="text"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 pt-5">
                                    <div className="flex-1">
                                        <CustomInput
                                            control={form.control}
                                            {...form.register("licenseCopiesCount")}
                                            label="License Copies purchased"
                                            placeholder="e.g. 50"
                                            type="number"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 pt-5">
                                    <div className="flex-1">
                                        <CustomInput
                                            control={form.control}
                                            {...form.register("minCopiesAlert")}
                                            label="Min. Copies"
                                            placeholder="e.g. 15"
                                            type="number"
                                        />
                                    </div>
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
                        <div className={'mt-6 header-2'}>Notification Settings</div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-4">


                                <div className="flex flex-col gap-4 pt-5">
                                    <div className="flex-1">
                                        <CustomDatePicker control={form.control}   {...form.register("purchaseDate")}
                                                          label={'Purchase Date'}
                                                          placeholder={'eg. 2023-12-31'}
                                                          name={'purchaseDate'}
                                                          date={purchaseDate}
                                                          setDate={setPurchaseDate}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 pt-5">
                                    <div className="flex-1">
                                        <CustomDatePicker control={form.control}   {...form.register("renewalDate")}
                                                          label={'Renewal Date'}
                                                          placeholder={'eg. 2025-12-31'}
                                                          name={'renewalDate'}
                                                          date={renewalDate}
                                                          setDate={setRenewalDate}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 pt-5">
                                    <div className="flex-1">
                                        <CustomInput control={form.control}   {...form.register("licensedEmail")}
                                                     label={'Licensed To Email'}
                                                     placeholder={'eg. joe@ecokeepr.com'}
                                                     type={'text'}/>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 pt-5">
                                    <div className="flex-1">
                                        <CustomInput control={form.control}   {...form.register("alertRenewalDays")}
                                                     label={'Alert Notification Days'}
                                                     placeholder={'eg. 4'}
                                                     type={'number'}/>
                                    </div>
                                </div>


                            </div>


                        </div>

                    </Card>

                    <Card className={'p-3.5 mb-5'}>
                        <div className={'mt-6 header-2'}>Vendor & License Key</div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-4">
                                <div className="flex flex-col gap-4 pt-5">
                                    <div className="flex-1">
                                        <CustomInput control={form.control}
                                                     {...form.register("vendor")}
                                                     label={'Vendor Name'}
                                                     placeholder={'eg. EcoKeepr'}
                                                     type={'text'}/>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 pt-5">
                                    <div className="flex-1">
                                        <CustomInput control={form.control}   {...form.register("licenseKey")}
                                                     label={'Licensed Key'}
                                                     placeholder={'eg. 1234-1234-1234-1234'}
                                                     type={'text'}/>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 pt-5">
                                    <div className="flex-1">
                                        <CustomInput control={form.control}   {...form.register("purchasePrice")}
                                                     label={'Purchase Price'}
                                                     placeholder={'eg. $15.00'}
                                                     type={'number'}/>
                                    </div>
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
export default LicenseForm
