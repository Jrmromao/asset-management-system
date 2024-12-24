'use client'

import React, { useEffect, useState, useTransition } from 'react'
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { FormError } from "@/components/forms/form-error"
import { assign } from "@/lib/actions/assets.actions"
import CustomSelect from "@/components/CustomSelect"
import { useUserStore } from "@/lib/stores/userStore"
import { assetAssignSchema } from "@/lib/schemas"

interface Props {
    assetId: string;
    onBeforeSubmit?: (data: { userId: string; userName: string }) => void;
    onError?: () => void;
}

const AssignAssetForm = ({ assetId, onBeforeSubmit, onError }: Props) => {
    const [error, setError] = useState<string>('')
    const [isPending, startTransition] = useTransition()

    const form = useForm({
        resolver: zodResolver(assetAssignSchema),
        defaultValues: {
            userId: '',
            assetId: assetId,
        },
    })

    const [getAllUsers, users] = useUserStore((state) => [state.getAll, state.users])

    useEffect(() => {
        getAllUsers()
    }, [getAllUsers])

    const onSubmit = async (data: any) => {
        const selectedUser = users.find(user => user.id === data.userId)

        // Update UI first
        onBeforeSubmit?.({
            userId: data.userId,
            userName: selectedUser?.name || 'Unknown User'
        })

        startTransition(async () => {
            try {
                setError('')
                const response = await assign(data)

                if (response?.error) {
                    setError(response.error)
                    onError?.()
                }
            } catch (e) {
                console.error(e)
                setError('Failed to assign asset')
                onError?.()
            }
        })
    }

    return (
        <section className="w-full bg-white z-50 max-h-[700px] overflow-y-auto p-4">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <CustomSelect
                        control={form.control}
                        {...form.register("userId")}
                        label="Name"
                        placeholder="Select User"
                        disabled={isPending}
                        name="userId"
                        data={users || []}
                        value={form.watch('userId')}
                    />

                    <FormError message={error} />

                    <div className="flex flex-col gap-4">
                        <Button type="submit" className="form-btn" disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    &nbsp; Assigning...
                                </>
                            ) : (
                                'Assign'
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </section>
    )
}

export default AssignAssetForm