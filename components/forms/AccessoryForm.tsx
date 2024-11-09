'use client'
import React, {useState} from 'react'
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
import CustomDatePicker from "@/components/CustomDatePicker";
import {AssetSchema} from "@/lib/schemas";
import {insert} from "@/lib/actions/category.actions";

interface AccessoryFormProps {
    accessory?: Accessory
}

const AccessoryForm = ({accessory}: AccessoryFormProps) => {

    const INITIAL_VALUES = {
        title: accessory?.title,
        totalQuantityCount: accessory?.totalQuantityCount,
        minQuantityAlert: accessory?.minQuantityAlert,
        alertEmail: accessory?.alertEmail,
        vendor: accessory?.vendor,
        purchaseDate: accessory?.purchaseDate,
        description: accessory?.description,
    }

    const [date, setDate] = useState<Date>()
    const [isLoading, setIsLoading] = useState(false)
    const [createAccessory] = useAccessoryStore((state) => [state.create]);


    const form = useForm<z.infer<typeof AssetSchema>>({
        resolver: zodResolver(AssetSchema),
        defaultValues: INITIAL_VALUES
    })

    const onSubmit = async (data: z.infer<typeof AssetSchema>) => {
        setIsLoading(true)

        try {
            // await insert()


            form.reset({})

        } catch (e) {
            console.error(e)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <section className="w-full bg-white z-50 max-h-[900px] overflow-y-auto p-4">
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
                                        {/*<CustomDatePicker control={form.control}   {...form.register("purchaseDate")}*/}
                                        {/*                  label={'Purchase Date'}*/}
                                        {/*                  placeholder={'eg. 2023-12-31'}*/}
                                        {/*                  // date={new Date()}*/}
                                        {/*                  // setDate={setDate}*/}
                                        {/*/>*/}
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
