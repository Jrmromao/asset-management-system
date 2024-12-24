'use client'

import React, { useEffect, useState } from 'react'
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
import { z } from "zod"

interface Props {
    assetId: string;
    onOptimisticUpdate: (data: { userId: string; userName: string }) => void;
    onSuccess?: () => void;
    onError?: (previousData?: { userId: string; userName: string }) => void;
    isAssigned?: boolean
}

const AssignAssetForm = ({
                             assetId,
                             onOptimisticUpdate,
                             onSuccess,
                             onError
                         }: Props) => {
    const [error, setError] = useState<string>('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    type AssignFormValues = z.infer<typeof assetAssignSchema>;

    const form = useForm<AssignFormValues>({
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

    const onSubmit = async (data: AssignFormValues) => {
        const selectedUser = users.find(user => user.id === data.userId)

        if (!selectedUser || !selectedUser.name) {
            setError('Selected user not found or user name is missing')
            return
        }

        setIsSubmitting(true)
        setError('')

        const optimisticData = {
            userId: data.userId,
            userName: selectedUser.name // Now TypeScript knows userName is defined
        }

        try {
            // Perform optimistic update
            onOptimisticUpdate(optimisticData)

            // Perform actual server update
            const response = await assign(data)

            if (response?.error) {
                throw new Error(response.error)
            }

            onSuccess?.()
        } catch (e) {
            console.error('Assignment error:', e)
            setError(typeof e === 'string' ? e : 'Failed to assign asset')
            // Rollback optimistic update
            onError?.(optimisticData)
        } finally {
            setIsSubmitting(false)
        }
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
                        disabled={isSubmitting}
                        name="userId"
                        data={users || []}
                        value={form.watch('userId')}
                        required
                    />

                    <FormError message={error} />

                    <div className="flex flex-col gap-4">
                        <Button
                            type="submit"
                            className="form-btn"
                            disabled={isSubmitting || !form.watch('userId')}
                        >
                            {isSubmitting ? (
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