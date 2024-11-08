'use client'

import React, {useEffect, useState} from 'react'
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form} from "@/components/ui/form";
import {Card} from "@/components/ui/card";
import CustomInput from "@/components/CustomInput";
import {Button} from "@/components/ui/button";
import {InfoIcon, Loader2} from "lucide-react";
import {useUserStore} from "@/lib/stores/userStore";
import {useRoleStore} from "@/lib/stores/roleStore";
import CustomSelect from "@/components/CustomSelect";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {useDialogStore} from "@/lib/stores/store";
import {personSchema} from "@/lib/schemas";
import {toast} from "sonner";
import {sleep} from "@/lib/utils";

const UserForm = () => {

    const INITIAL_VALUES = {
        firstName: '',
        lastName: '',
        email: '',
        title: '',
        employeeId: '',
        roleId: '',
        companyId: ''
    }

    const [isLoading, setIsLoading] = useState(false)
    const [create] = useUserStore(state => [state.create])
    const [roles, fetchRoles] = useRoleStore((state) => [state.roles, state.getAll]);
    const [onClose] = useDialogStore(state => [state.onClose])

    const form = useForm<z.infer<typeof personSchema>>({
        resolver: zodResolver(personSchema),
        defaultValues: INITIAL_VALUES
    })

    useEffect(() => {
        fetchRoles()
    }, []);

    const onSubmit = async (data: z.infer<typeof personSchema>) => {

        setIsLoading(true)
        try {
            const roleSelected = roles?.find((role) => role.name === data.roleId)
            const userData: User = {
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                email: data.email || '',
                roleId: roleSelected?.id || '',
                role: roleSelected,
                title: data.title || '',
                employeeId: data.employeeId || '',
                companyId: data.companyId || '',
            }
            create(userData)
            await sleep().then(_ => {
                onClose()
                form.reset()
                toast.success('User created successfully')
            })
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


                    <div className={'mt-6 header-2'}>Personal Details</div>

                    <div className={'flex flex-col md:flex-row gap-4 pt-5'}>

                        <div className={'flex-1'}>
                            <CustomInput control={form.control}   {...form.register("firstName")}
                                         label={'First Name'}
                                         placeholder={'eg. Joe'}
                                         type={'text'}/>
                        </div>

                    </div>

                    <div className={'flex flex-col md:flex-row gap-4 pt-5'}>
                        <div className={'flex-1'}>
                            <CustomInput control={form.control}  {...form.register("lastName")} label={'Last Name'}
                                         placeholder={'eg. Smith'}
                                         type={'text'}/>
                        </div>
                    </div>

                    <div className={'flex flex-col md:flex-row gap-4  pt-5'}>
                        <div className={'flex-1'}>
                            <CustomInput control={form.control}
                                         {...form.register("email")}
                                         label={'Email Address'}
                                         placeholder={'eg. joe.smith@example.com'}
                                         type={'email'}/>
                        </div>
                    </div>


                    <div className={'flex flex-col md:flex-row gap-4  pt-5'}>
                        <div className={'flex-1'}>
                            <CustomInput control={form.control}   {...form.register("title")}
                                         label={'Title'}
                                         placeholder={'eg. Software Developer'} type={'text'}/>
                        </div>
                    </div>

                    <div className={'flex flex-col md:flex-row gap-4  pt-5'}>
                        <div className={'flex-1'}>
                            <CustomInput control={form.control}   {...form.register("employeeId")}
                                         label={'Employee Id'}
                                         placeholder={'eg. xxxxxxx'} type={'text'}/>
                        </div>
                    </div>


                    <div className={'mt-6 header-2'}>Access Role</div>


                    <div className={'flex flex-col md:flex-row gap-4 pt-5'}>
                        <div className={'flex-1'}>
                            <CustomSelect
                                value={form.watch('roleId')}
                                control={form.control}
                                {...form.register("roleId")} label={'Role'}
                                placeholder={'Select Role'}
                                data={roles}/>

                            <div className={'pt-2'}>
                                <Alert variant={'destructive'} className={'w-full bg-blue-25 text-gray-500'}>
                                    <InfoIcon className="h-4 w-4"/>
                                    <AlertTitle>Role Note</AlertTitle>
                                    <AlertDescription>
                                        Please note that users with the &apos;Loanee&apos; role are not able to log in
                                        to the application.
                                    </AlertDescription>
                                </Alert>
                            </div>


                        </div>
                    </div>


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
export default UserForm
