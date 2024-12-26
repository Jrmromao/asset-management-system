'use client'

import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { FormError } from "@/components/forms/form-error"
import CustomSelect from "@/components/CustomSelect"
import { useUserStore } from "@/lib/stores/userStore"
import * as z from "zod"
import {assignmentSchema} from "@/lib/schemas";

// Define supported asset types
export type AssetType = 'asset' | 'license' | 'accessory' | 'consumable';

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

interface Props {
    itemId: string;
    type: AssetType;
    onOptimisticUpdate: (data: { userId: string; userName: string }) => void;
    onSuccess?: () => void;
    onError?: (previousData?: { userId: string; userName: string }) => void;
    assignAction: (data: AssignmentFormValues) => Promise<{ error?: string }>;
}

const AssignmentForm = ({
                            itemId,
                            type,
                            onOptimisticUpdate,
                            onSuccess,
                            onError,
                            assignAction
                        }: Props) => {
    const [error, setError] = useState<string>('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<AssignmentFormValues>({
        resolver: zodResolver(assignmentSchema),
        defaultValues: {
            userId: '',
            itemId: itemId,
            type: type
        },
    })

    const [getAllUsers, users] = useUserStore((state) => [state.getAll, state.users])

    useEffect(() => {
        getAllUsers()
    }, [getAllUsers])

    const onSubmit = async (data: AssignmentFormValues) => {
        const selectedUser = users.find(user => user.id === data.userId)

        if (!selectedUser || !selectedUser.name) {
            setError('Selected user not found or user name is missing')
            return
        }

        setIsSubmitting(true)
        setError('')

        const optimisticData = {
            userId: data.userId,
            userName: selectedUser.name
        }

        try {
            onOptimisticUpdate(optimisticData)

            const response = await assignAction(data)

            if (response?.error) {
                throw new Error(response.error)
            }

            onSuccess?.()
        } catch (e) {
            console.error(`${type} assignment error:`, e)
            setError(typeof e === 'string' ? e : `Failed to assign ${type}`)
            onError?.(optimisticData)
        } finally {
            setIsSubmitting(false)
        }
    }

    const getSubmitButtonText = () => {
        if (isSubmitting) return `Assigning ${type}...`
        return `Assign ${type}`
    }

    return (
        <section className="w-full bg-white z-50 max-h-700 overflow-y-auto p-4">
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
                                    &nbsp; {getSubmitButtonText()}
                                </>
                            ) : (
                                getSubmitButtonText()
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </section>
    )
}

export default AssignmentForm