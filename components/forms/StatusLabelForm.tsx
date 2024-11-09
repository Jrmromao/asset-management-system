'use client'

import React from 'react'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useTransition } from 'react'

// Components
import CustomInput from "@/components/CustomInput"
import CustomColorPicker from "@/components/CustomColorPicker"
import CustomSwitch from "@/components/CustomSwitch"

// Store and Schema
import { useStatusLabelStore } from "@/lib/stores/statusLabelStore"
import { statusLabelSchema } from "@/lib/schemas"
import {insert} from "@/lib/actions/statusLabel.actions";

type FormValues = z.infer<typeof statusLabelSchema>

const StatusLabelForm = () => {
    const [isPending, startTransition] = useTransition()
    const { onClose, create: createStatusLabel, getAll: fetchStatusLabels } = useStatusLabelStore()

    const form = useForm<FormValues>({
        resolver: zodResolver(statusLabelSchema),
        defaultValues: {
            name: '',
            description: '',
            colorCode: '#000000', // Add a default color
            isArchived: false,
            allowLoan: true,
        },
    })

    async function onSubmit(data: FormValues) {
        startTransition(async () => {
            try {
                const result = createStatusLabel({
                    name: data.name,
                    description: data.description,
                    colorCode: data.colorCode!,
                    isArchived: data.isArchived ?? false,
                    allowLoan: data.allowLoan ?? true,
                })

                // if (result?.error) {
                //     toast.error(result.error)
                //     return
                // }

                insert

                fetchStatusLabels()
                toast.success('Status Label created successfully')
                form.reset()
                onClose()
            } catch (error) {
                console.error('Create status label error:', error)
                toast.error('Failed to create status label')
            }
        })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    <CustomInput
                        name="name"
                        label="Name"
                        control={form.control}
                        placeholder="eg. Available"
                    />

                    <CustomInput
                        type="textarea"
                        name="description"
                        label="Description"
                        control={form.control}
                        placeholder="eg. Asset is available for use"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <CustomSwitch
                            name="isArchived"
                            label="Is Archivable"
                            control={form.control}
                        />

                        <CustomSwitch
                            name="allowLoan"
                            label="Allow Loan"
                            control={form.control}
                        />
                    </div>

                    <CustomColorPicker
                        name="colorCode"
                        label="Status Color"
                        control={form.control}
                    />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            form.reset()
                            onClose()
                        }}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        disabled={isPending || !form.formState.isValid}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            'Create Status'
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    )
}

export default StatusLabelForm