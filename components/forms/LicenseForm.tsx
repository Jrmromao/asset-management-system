'use client'

import React, { useEffect, useTransition } from 'react'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormLabel } from "@/components/ui/form"
import { InfoIcon, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import CustomInput from "@/components/CustomInput"
import CustomDatePicker from "@/components/CustomDatePicker"
import CustomPriceInput from "@/components/CustomPriceInput"
import Dropzone from "@/components/Dropzone"
import {SelectWithButton} from "@/components/SelectWithButton";
import {useAssetStore} from "@/lib/stores/assetStore";
import {useStatusLabelStore} from "@/lib/stores/statusLabelStore";
import {useModelStore} from "@/lib/stores/modelStore";
import {useLocationStore} from "@/lib/stores/locationStore";
import {useDepartmentStore} from "@/lib/stores/departmentStore";
import {useInventoryStore} from "@/lib/stores/inventoryStore";
import {useSupplierStore} from "@/lib/stores/SupplierStore";
import {useCategoryStore} from "@/lib/stores/categoryStore";

const licenseSchema = z.object({
    licenseName: z.string().min(1, "License name is required"),
    licenseCopiesCount: z.number().min(1, "Number of copies is required"),
    minCopiesAlert: z.number().min(1, "Minimum copies alert is required"),
    licensedEmail: z.string().email("Valid email is required"),
    purchaseDate: z.date(),
    renewalDate: z.date(),
    alertRenewalDays: z.number().min(1, "Alert days is required"),
    purchasePrice: z.number().min(0, "Price must be positive"),
    vendor: z.string().min(1, "Vendor is required"),
    licenseKey: z.string().min(1, "License key is required"),
    notes: z.string().optional(),
    attachments: z.array(z.any()).optional()
});



type LicenseFormValues = z.infer<typeof licenseSchema>;

const LicenseForm = () => {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()



// Stores
    const {create: createAsset, update: updateAsset, findById} = useAssetStore()
    const {
        statusLabels,
        getAll: fetchStatusLabels,
        isOpen: isStatusOpen,
        onOpen: openStatus,
        onClose: closeStatus
    } = useStatusLabelStore()
    const {models, fetchModels, isOpen: isModelOpen, onOpen: openModel, onClose: closeModel} = useModelStore()
    const {
        locations,
        fetchLocations,
        isOpen: isLocationOpen,
        onOpen: openLocation,
        onClose: closeLocation
    } = useLocationStore()
    const {
        departments,
        getAll: fetchDepartments,
        isOpen: isDepartmentOpen,
        onOpen: openDepartment,
        onClose: closeDepartment
    } = useDepartmentStore()
    const {
        inventories,
        getAll: fetchInventories,
        isOpen: isInventoryOpen,
        onOpen: openInventory,
        onClose: closeInventory
    } = useInventoryStore()
    const {
        suppliers,
        getAll: fetchSuppliers,
        isOpen: isSupplierOpen,
        onOpen: openSupplier,
        onClose: closeSupplier
    } = useSupplierStore()

    const {
        categories,
        getAll: fetchCategories,
        isOpen: isCategoryOpen,
        onOpen: openCategory,
        onClose: closeCategory
    } = useCategoryStore()

    const form = useForm<LicenseFormValues>({
        resolver: zodResolver(licenseSchema),
        defaultValues: {
            licenseName: '',
            licenseCopiesCount: 1,
            minCopiesAlert: 1,
            licensedEmail: '',
            purchaseDate: new Date(),
            renewalDate: new Date(),
            alertRenewalDays: 30,
            purchasePrice: 0,
            vendor: '',
            licenseKey: '',
            notes: '',
        }
    })

    const onSubmit = async (data: LicenseFormValues) => {
        startTransition(async () => {
            try {
                // Submit logic here
                toast.success('License created successfully')
                form.reset()
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
                            {/* License Information */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">License Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <CustomInput
                                            name="licenseName"
                                            label="License Name"
                                            control={form.control}
                                            placeholder="e.g. Adobe Creative Cloud"
                                            required
                                        />
                                        <CustomInput
                                            name="licenseKey"
                                            label="License Key"
                                            control={form.control}
                                            placeholder="Enter license key"
                                            required
                                            className="mt-4"
                                        />
                                    </div>
                                    <Alert>
                                        <InfoIcon className="h-4 w-4"/>
                                        <AlertTitle>About License Key</AlertTitle>
                                        <AlertDescription>
                                            Store your license key securely. This will be encrypted in our database.
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            </div>

                            {/* License Management */}
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold mb-4">License Management</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <CustomInput
                                        name="licenseCopiesCount"
                                        label="Total Licenses"
                                        control={form.control}
                                        type="number"
                                        placeholder="Enter total licenses"
                                        required
                                    />
                                    <CustomInput
                                        name="minCopiesAlert"
                                        label="Minimum License Alert"
                                        control={form.control}
                                        type="number"
                                        placeholder="Enter minimum threshold"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="border-t pt-6 sm:flex-row">
                                <h3 className="text-lg font-semibold mb-4">Purchase Information</h3>
                                <div className="space-y-6">
                                    <CustomInput
                                        name="poNumber"
                                        label="PO Number"
                                        control={form.control}
                                        placeholder="Enter PO number"
                                        type="text"
                                    />

                                    <CustomPriceInput
                                        name="price"
                                        label="Price"
                                        control={form.control}
                                        placeholder="0.00"
                                        required
                                    />

                                    <SelectWithButton
                                        isPending
                                        form={form}
                                        name="supplierId"
                                        label="Supplier"
                                        data={suppliers}
                                        onNew={openSupplier}
                                        placeholder="Select supplier"
                                        required
                                    />
                                    <SelectWithButton
                                        isPending
                                        form={form}
                                        name="inventoryId"
                                        label="Inventory"
                                        data={inventories}
                                        onNew={openInventory}
                                        placeholder="Select an inventory"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Purchase Details */}
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold mb-4">Purchase Details</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <CustomPriceInput
                                        name="purchasePrice"
                                        label="Purchase Price"
                                        control={form.control}
                                        placeholder="0.00"
                                        required
                                    />
                                    <CustomInput
                                        name="vendor"
                                        label="Vendor"
                                        control={form.control}
                                        placeholder="Enter vendor name"
                                        required
                                    />
                                    <div className="space-y-2">
                                        <FormLabel>Purchase Date</FormLabel>
                                        <CustomDatePicker
                                            name="purchaseDate"
                                            form={form}
                                            placeholder="Select date"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <FormLabel>Renewal Date</FormLabel>
                                        <CustomDatePicker
                                            name="renewalDate"
                                            form={form}
                                            placeholder="Select date"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Notifications */}
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <CustomInput
                                        name="licensedEmail"
                                        label="Licensed Email"
                                        control={form.control}
                                        type="email"
                                        placeholder="Enter email for notifications"
                                        required
                                    />
                                    <CustomInput
                                        name="alertRenewalDays"
                                        label="Alert Days Before Renewal"
                                        control={form.control}
                                        type="number"
                                        placeholder="e.g. 30"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Attachments */}
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold mb-4">Attachments</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    {/*<Dropzone/>*/}
                                    <Alert>
                                        <InfoIcon className="h-4 w-4"/>
                                        <AlertTitle>Note</AlertTitle>
                                        <AlertDescription>
                                            Upload license documentation, terms, or related files (PDF only, max 10
                                            files)
                                        </AlertDescription>
                                    </Alert>
                                </div>
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
                                    Creating...
                                </>
                            ) : (
                                'Create License'
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </section>
    )
}

export default LicenseForm