'use client'
import HeaderBox from "@/components/HeaderBox";
import React, {useEffect, useState} from "react";
import AssetForm from "@/components/forms/AssetForm";
import LicenseForm from "@/components/forms/LicenseForm";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import CategoryForm from "@/components/forms/CategoryForm";
import CategoryTable from "@/components/tables/CategoryTable";
import {Form} from "@/components/ui/form";
import CustomInput from "@/components/CustomInput";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {InfoIcon, Loader2} from "lucide-react";
import CustomDatePicker from "@/components/CustomDatePicker";
import {Button} from "@/components/ui/button";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {AssetSchema, kitSchema} from "@/lib/schemas";
import {zodResolver} from "@hookform/resolvers/zod";
import {useStatusLabelStore} from "@/lib/stores/statusLabelStore";
import {useKitStore} from "@/lib/stores/kitStore";
import {DialogContainer} from "@/components/dialogs/DialogContainer";
import StatusLabelForm from "@/components/forms/StatusLabelForm";
import CustomSelect from "@/components/CustomSelect";
import {useAssetStore} from "@/lib/stores/assetStore";
import {useLicenseStore} from "@/lib/stores/licenseStore";
import {useCategoryStore} from "@/lib/stores/categoryStore";
import {toast} from "sonner";
import {sleep} from "@/lib/utils";
import KitItemForm from "@/components/forms/KitItemForm";
import { useRef } from 'react';

const Create = () => {
    const [isLoading, setIsLoading] = useState()

    const [allKits, isAssetOpen, onAssetClose, onAssetOpen, isLicenseOpen, onLicenseOpen, onLicenseClose, isAccessoryOpen, onAccessoryClose, onAccessoryOpen] = useKitStore((state) => [state.kits, state.isAssetOpen, state.onAssetClose, state.onAssetOpen, state.isLicenseOpen, state.onLicenseOpen, state.onLicenseClose,
        state.isAccessoryOpen, state.onAccessoryClose, state.onAccessoryOpen]);
    const [allAssets] = useAssetStore((state) => [state.assets]);
    const [allLicenses] = useLicenseStore((state) => [state.licenses]);
    const [allCategories] = useCategoryStore((state) => [state.categories]);

    const form = useForm<z.infer<typeof kitSchema>>({
        resolver: zodResolver(kitSchema),
        defaultValues: {
            name: '',
            assetId: '',
            accessoryId: '',
            licenseId: '',
        }
    })

    const assetIdRef = useRef<string | undefined>('');
    const licenseIdRef = useRef<string | undefined>('');
    const accessoryIdRef = useRef<string | undefined>('');

    const assetId = form.watch('assetId');
    const licenseId = form.watch('licenseId');
    const accessoryId = form.watch('accessoryId');

    useEffect(() => {
        assetIdRef.current = assetId;
        licenseIdRef.current = licenseId;
        accessoryIdRef.current = accessoryId;

    }, [assetId, licenseId, accessoryId]);

    const onSubmit = async (data: z.infer<typeof kitSchema>) => {

        try {
            console.log(data)


        } catch (e) {
            console.error(e)
        } finally {

        }
    }

    return (
        <div className="assets">


            <div>
                <HeaderBox
                    title="Create Pre-defined Kit"
                    subtext="Create a new kit using the form below"
                />
            </div>
            <section className="w-full bg-white z-50 max-h-[900px] overflow-y-auto p-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <Card className={'p-3.5 mb-5'}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white p-4">
                                    <div className="flex flex-col gap-4 pt-5">
                                        <div className="flex-1">
                                            <CustomInput
                                                control={form.control}
                                                {...form.register("name")}
                                                label="Kit Title"
                                                placeholder="e.g. IT Onboarding Kit"
                                                type="text"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-4 md:mt-11 ">
                                    <Alert>
                                        <InfoIcon className="h-4 w-4"/>
                                        <AlertTitle>Note</AlertTitle>
                                        <AlertDescription>
                                            Add something meaningful.
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            </div>
                        </Card>

                        <hr/>
                        <Tabs defaultValue="assets">
                            <div className="flex items-center">
                                <TabsList>
                                    <TabsTrigger value="assets">Assets</TabsTrigger>
                                    <TabsTrigger value="accessories">Accessories</TabsTrigger>
                                    <TabsTrigger value="licenses">Licenses</TabsTrigger>
                                </TabsList>
                                <div className="ml-auto flex items-center gap-2">

                                </div>
                            </div>
                            <div className={'w-full bg-white p-4 h-[340px] overflow-auto'}>


                                <TabsContent value="assets">

                                    <div className="text-right">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={onAssetOpen}
                                        >
                                            Add Asset
                                        </Button>
                                    </div>


                                    <div className="w-full md:w-full lg:w-1/3">
                                        <DialogContainer open={isAssetOpen} onOpenChange={onAssetClose}
                                                         title={'Select an Asset'} description={''}
                                                         form={<KitItemForm label={'Add Asset'}
                                                                            onClose={onAssetClose}
                                                                            data={allAssets}
                                                                            control={form.control} name={'assetId'}
                                                                            placeholder={'eg. Keyboard'}
                                                                            value={form.watch('assetId')}/>}/>
                                    </div>
                                </TabsContent>
                                <TabsContent value="accessories">
                                    <h2 className="header-2">Accessories</h2>
                                    <div className="text-right">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={onAccessoryOpen}
                                        >
                                            Add Accessory
                                        </Button>
                                    </div>
                                    
                                    <div className="w-full md:w-full lg:w-1/3">
                                        <DialogContainer open={isAccessoryOpen} onOpenChange={onAccessoryClose}
                                                         title={'Select an Asset'} description={''}
                                                         form={<KitItemForm label={'Add Asset'}
                                                                            onClose={onAssetClose}
                                                                            data={allAssets}
                                                                            control={form.control} name={'assetId'}
                                                                            placeholder={'eg. Keyboard'}
                                                                            value={form.watch('assetId')}/>}/>
                                    </div>
                                </TabsContent>
                                <TabsContent value="licenses">
                                    <h2 className="header-2">Licenses</h2>
                                    <div className="text-right">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={onLicenseOpen}
                                        >
                                            Add License
                                        </Button>
                                    </div>


                                    <div className="w-full md:w-full lg:w-1/3">
                                        <DialogContainer open={isLicenseOpen} onOpenChange={onLicenseClose}
                                                         title={'Select an Asset'} description={''}
                                                         form={<KitItemForm label={'Add License'}
                                                                            onClose={onLicenseClose}
                                                                            data={allAssets}
                                                                            control={form.control} name={'assetId'}
                                                                            placeholder={'eg. Keyboard'}
                                                                            value={form.watch('assetId')}/>}/>
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>
                        <Button type="submit" className={'form-btn mt-6 w-full  md:w-auto'} disabled={isLoading}>
                            {isLoading ? (
                                    <>
                                        <Loader2 size={20} className={'animate-spin'}/>&nbsp;
                                        Loading...
                                    </>
                                ) :
                                'Submit Kit'}
                        </Button>
                    </form>

                </Form>
            </section>
        </div>
    )
}
export default Create
