'use client'
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import HeaderBox from "@/components/HeaderBox";
import RecentTransactions from "@/components/RecentTransactions";
import React from "react";
import CustomInput from "@/components/CustomInput";
import {Form} from "@/components/ui/form";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {assetFormSchema} from "@/lib/utils";


const CreateNew = () => {


    const formSchema = assetFormSchema('create')

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: '',
            firstName: '',
            lastName: '',
            address1: '',
            city: '',
            state: '',
            postalCode: '',
            dateOfBirth: '',
            ssn: ''
        },
    })

    return (
        <div className="transactions">
            <div className="transactions-header">
                <HeaderBox
                    title="Create new asset"
                    subtext="Fill the form to create new asset."
                />
            </div>
            <div className="space-y-6">
                <section className="flex w-full flex-col gap-6">


                    <Form {...form}>
                        <div className={'flex gap-4'}>
                            <CustomInput control={form.control} name={'firstName'} label={'First Name'}
                                         placeholder={'ex: Joe'} type={'text'}/>
                            <CustomInput control={form.control} name={'lastName'} label={'Last Name'}
                                         placeholder={'ex: Doe'} type={'text'}/>
                        </div>
                        <CustomInput control={form.control} name={'address1'} label={'Address'}
                                     placeholder={'Enter you Address'} type={'text'}/>

                        <CustomInput control={form.control} name={'city'} label={'City'} placeholder={'Enter you City'}
                                     type={'text'}/>
                        <div className={'flex gap-4'}>
                            <CustomInput control={form.control} name={'state'} label={'State'} placeholder={'ex: NY'}
                                         type={'text'}/>
                            <CustomInput control={form.control} name={'postalCode'} label={'Postal Code'}
                                         placeholder={'ex: 11101'} type={'text'}/>
                        </div>
                        <div className={'flex gap-4'}>
                            <CustomInput control={form.control} name={'dateOfBirth'} label={'Date of Birth'}
                                         placeholder={'ex: YYYY-MM-DD'} type={'text'}/>
                            <CustomInput control={form.control} name={'ssn'} label={'SSN'} placeholder={'ex: 1234'}
                                         type={'text'}/>
                        </div>
                    </Form>.
                </section>
            </div>
        </div>

    )
}
export default CreateNew
