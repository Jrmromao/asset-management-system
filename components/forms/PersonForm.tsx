'use client'

import React, {useEffect, useState} from 'react'
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form} from "@/components/ui/form";
import {Card} from "@/components/ui/card";
import CustomInput from "@/components/CustomInput";
import {Button} from "@/components/ui/button";
import {Loader2} from "lucide-react";
import {usePeopleStore} from "@/lib/stores/userStore";
import {useRoleStore} from "@/lib/stores/roleStore";
import CustomSelect from "@/components/CustomSelect";

const PersonForm = () => {

    const INITIAL_VALUES = {
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        roleId: '',
        companyId: 0
    }

    const [isLoading, setIsLoading] = useState(false)
    const [licenseQuestion, setLicenseQuestion] = useState('')


    const [create] = usePeopleStore((state) => [state.create, state.getAll]);
    const [roles, fetchRoles] = useRoleStore((state) => [state.roles, state.getAll]);


    const schema = z.object({

        id: z.string().optional(),
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        email: z.string().email("Invalid email"),
        phoneNumber: z.string().min(1, "Phone number is required"),
        roleId: z.string().min(1, "Role is required"),
        companyId: z.number().optional(),
    })

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: INITIAL_VALUES
    })


    useEffect(() => {
        fetchRoles()
    }, []);


    const onSubmit = async (data: z.infer<typeof schema>) => {

        setIsLoading(true)
        try {
            console.log(roles.find((role) => role.id === String(data.roleId)))

            const userData: User = {
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                email: data.email || '',
                phoneNumber: data.phoneNumber || '',
                roleId: 1,
                companyId: Number(data.companyId),
            }

            create(userData)
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
                        <div className={'mt-6 header-2'}>Personal Details</div>

                        <div className={'flex flex-col md:flex-row gap-4 pt-5'}>

                            <div className={'flex-1'}>
                                <CustomInput control={form.control}   {...form.register("firstName")}
                                             label={'First Name'}
                                             placeholder={'eg. Joe'}
                                             type={'text'}/>
                            </div>

                            <div className={'flex-1'}>
                                <CustomInput control={form.control}  {...form.register("lastName")} label={'Last Name'}
                                             placeholder={'eg. Smith'}
                                             type={'text'}/>
                            </div>
                        </div>
                        <div className={'flex flex-col md:flex-row gap-4  pt-5'}>
                            <div className={'flex-1'}>
                                <CustomInput control={form.control}   {...form.register("phoneNumber")}
                                             label={'Phone Number'}
                                             placeholder={'eg. xxx xxx xxxx'} type={''}/>
                            </div>
                            <div className={'flex-1'}>
                                <CustomInput control={form.control}
                                             {...form.register("email")}
                                             label={'Email Address'}
                                             placeholder={'eg. joe.smith@example.com'}
                                             type={'enail'}/>
                            </div>
                        </div>


                    </Card>


                    <Card className={'p-3.5'}>
                        <div className={'mt-6 header-2'}>Access</div>


                        <div className={'flex flex-col md:flex-row gap-4 pt-5'}>
                            <div className={'flex-1'}>
                                <CustomSelect control={form.control}  {...form.register("roleId")} label={'Role'}
                                              placeholder={'Select Role'}
                                              data={roles}/>
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
export default PersonForm
