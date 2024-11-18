'use client'

import React, { useEffect, useTransition } from 'react'
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormLabel } from "@/components/ui/form"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { InfoIcon, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import CustomInput from "@/components/CustomInput"
import CustomSelect from "@/components/CustomSelect"
import { useUserStore } from "@/lib/stores/userStore"
import { useRoleStore } from "@/lib/stores/roleStore"
import { userSchema } from "@/lib/schemas"

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormProps {
    id?: string;
    isUpdate?: boolean;
}

const UserForm = ({ id, isUpdate = false }: UserFormProps) => {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const { create: createUser, update: updateUser, findById } = useUserStore()
    const { roles, getAll: fetchRoles } = useRoleStore()

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            phoneNum: '',
            email: '',
            title: '',
            employeeId: '',
            roleId: '',
            companyId: ''
        }
    })

    useEffect(() => {
        fetchRoles()
        if (isUpdate && id) {
            startTransition(async () => {
                const user = await findById(id)
                if (user) {
                    form.reset(user)
                } else {
                    toast.error('User not found')
                    router.back()
                }
            })
        }
    }, [isUpdate, id, fetchRoles, findById, router])

    async function onSubmit(data: UserFormValues) {
        startTransition(async () => {
            try {
                if (isUpdate && id) {
                    await updateUser(id, data)
                    toast.success('User updated successfully')
                } else {
                    await createUser(data)
                    form.reset()
                    toast.success('User created successfully')
                }
            } catch (error) {
                toast.error('Something went wrong')
                console.error(error)
            }
        })
    }

    return (
        <section className="w-full mx-auto p-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Card className="p-6">
                        <div className="space-y-6">
                            {/* Personal Information */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <CustomInput
                                        required
                                        name="firstName"
                                        label="First Name"
                                        control={form.control}
                                        type="text"
                                        placeholder="Enter first name"
                                    />
                                    <CustomInput
                                        required
                                        name="lastName"
                                        label="Last Name"
                                        control={form.control}
                                        type="text"
                                        placeholder="Enter last name"
                                    />
                                </div>
                            </div>

                            {/* Contact Details */}
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold mb-4">Contact Details</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <CustomInput
                                        required
                                        name="email"
                                        label="Email Address"
                                        control={form.control}
                                        type="email"
                                        placeholder="Enter email address"
                                    />
                                    <CustomInput
                                        required
                                        name="phoneNum"
                                        label="Phone Number"
                                        control={form.control}
                                        type="text"
                                        placeholder="Enter phone number"
                                    />
                                </div>
                            </div>

                            {/* Employment Information */}
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold mb-4">Employment Information</h3>
                                <div className="grid grid-cols-3 gap-6">
                                    <CustomInput
                                        required
                                        name="employeeId"
                                        label="Employee ID"
                                        control={form.control}
                                        type="text"
                                        placeholder="Enter employee ID"
                                    />
                                    <CustomInput
                                        required
                                        name="title"
                                        label="Job Title"
                                        control={form.control}
                                        type="text"
                                        placeholder="Enter job title"
                                    />
                                    <CustomSelect
                                        label="Role"
                                        value={form.watch('roleId')}
                                        name="roleId"
                                        required
                                        control={form.control}
                                        data={roles}
                                        placeholder="Select role"
                                    />
                                </div>
                                <Alert className="mt-4">
                                    <InfoIcon className="h-4 w-4"/>
                                    <AlertTitle>Role Access Note</AlertTitle>
                                    <AlertDescription>
                                        Users with the Loanee role cannot access the application dashboard.
                                    </AlertDescription>
                                </Alert>
                            </div>
                        </div>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 sticky bottom-0 bg-white p-4 border-t shadow-lg">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="min-w-[120px]"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                                    {isUpdate ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                isUpdate ? 'Update User' : 'Create User'
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </section>
    )
}

export default UserForm