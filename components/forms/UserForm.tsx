'use client'

import React, {useTransition} from 'react'
import {z} from "zod"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {Form} from "@/components/ui/form"
import {Button} from "@/components/ui/button"
import {toast} from "sonner"
import {useRouter} from "next/navigation"

import CustomInput from "@/components/CustomInput"
import CustomSelect from "@/components/CustomSelect"
import {useRoleStore} from "@/lib/stores/roleStore"
import {userSchema} from "@/lib/schemas"
import {createUser} from "@/lib/actions/user.actions"
import {useUserStore} from "@/lib/stores/userStore";
import {useDialogStore} from "@/lib/stores/store";

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormProps {
    id?: string;
    isUpdate?: boolean;
}

const UserForm = ({id, isUpdate = false}: UserFormProps) => {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()
    const {roles} = useRoleStore()
    const [fetchUsers] = useUserStore(state => [state.getAll])
    const [ closeDialog] = useDialogStore(state => [state.onClose])




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
        },
        mode: 'onChange'

    })

    async function onSubmit(data: UserFormValues) {
        startTransition(async () => {
            try {
                await createUser(data)
                form.reset()
                toast.success('User created successfully')
            } catch (error) {
                toast.error('Something went wrong')
                console.error(error)
            } finally {
                closeDialog()
                fetchUsers()
            }
        })
    }

    return (
        <div className="flex flex-col h-full">
            <div className="w-full bg-white">
                <div className="p-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Personal Information */}
                            <div className="space-y-4">
                                <h3 className="font-medium">Personal Information</h3>
                                <div className="grid grid-cols-2 gap-4">
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

                            {/* Contact Information */}
                            <div className="space-y-4">
                                <h3 className="font-medium">Contact Information</h3>
                                <div className="grid grid-cols-2 gap-4">
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
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
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
                                </div>
                                <div>
                                    <CustomSelect
                                        label="Role"
                                        value={form.watch('roleId')}
                                        name="roleId"
                                        required
                                        control={form.control}
                                        data={roles}
                                        placeholder="Select role"
                                    />
                                    <p className="mt-2 text-sm text-gray-500">
                                        Users with the Loanee role cannot access the application dashboard.
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={closeDialog}
                                    className="px-4 py-2 h-9"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isPending}
                                    className="px-4 py-2 h-9"
                                >
                                    Create User
                                </Button>
                            </div>

                        </form>
                    </Form>
                </div>
            </div>
        </div>
    )
}

export default UserForm