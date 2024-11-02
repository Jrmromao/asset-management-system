'use client'

import React from 'react'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormLabel } from "@/components/ui/form"
import { Loader2, Plus } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useTransition } from 'react'

// Components
import CustomInput from "@/components/CustomInput"
import CustomSelect from "@/components/CustomSelect"
import { DialogContainer } from "@/components/dialogs/DialogContainer"
import CustomDatePicker from "@/components/CustomDatePicker"

// Forms
import ModelForm from "@/components/forms/ModelForm"
import StatusLabelForm from "@/components/forms/StatusLabelForm"
// import LocationForm from "@/components/forms/LocationForm"
// import DepartmentForm from "@/components/forms/DepartmentForm"
// import InventoryForm from "@/components/forms/InventoryForm"
// import SupplierForm from "@/components/forms/SupplierForm"

// Stores
import { useAssetStore } from "@/lib/stores/assetStore"
import { useStatusLabelStore } from "@/lib/stores/statusLabelStore"
import { useModelStore } from "@/lib/stores/modelStore"
import {useLocationStore} from "@/lib/stores/locationStore";
// import { useLocationStore } from "@/lib/stores/locationStore"
// import { useDepartmentStore } from "@/lib/stores/departmentStore"
// import { useInventoryStore } from "@/lib/stores/inventoryStore"
// import { useSupplierStore } from "@/lib/stores/supplierStore"

const assetSchema = z.object({
    name: z.string().min(1, "Asset name is required"),
    serialNumber: z.string().min(1, "Serial number is required"),
    modelId: z.string().min(1, "Model is required"),
    statusLabelId: z.string().min(1, "Status is required"),
    departmentId: z.string().min(1, "Department is required"),
    inventoryId: z.string().min(1, "Inventory is required"),
    locationId: z.string().min(1, "Location is required"),
    supplierId: z.string().min(1, "Supplier is required"),
    endOfLife: z.date({
        required_error: "End of life date is required",
    }),
    material: z.string().optional(),
});

type AssetFormValues = z.infer<typeof assetSchema>;

interface AssetFormProps {
    id?: string;
    isUpdate?: boolean;
}

const AssetForm = ({ id, isUpdate = false }: AssetFormProps) => {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    // Stores
    const { create: createAsset, update: updateAsset, findById } = useAssetStore()
    const { statusLabels, getAll: fetchStatusLabels, isOpen: isStatusOpen, onOpen: openStatus, onClose: closeStatus } = useStatusLabelStore()
    const { models, fetchModels, isOpen: isModelOpen, onOpen: openModel, onClose: closeModel } = useModelStore()
    const { locations, fetchLocations, isOpen: isLocationOpen, onOpen: openLocation, onClose: closeLocation } = useLocationStore()
    // const { departments, fetchDepartments, isOpen: isDepartmentOpen, onOpen: openDepartment, onClose: closeDepartment } = useDepartmentStore()
    // const { inventories, fetchInventories, isOpen: isInventoryOpen, onOpen: openInventory, onClose: closeInventory } = useInventoryStore()
    // const { suppliers, fetchSuppliers, isOpen: isSupplierOpen, onOpen: openSupplier, onClose: closeSupplier } = useSupplierStore()

    // Form
    const form = useForm<AssetFormValues>({
        resolver: zodResolver(assetSchema),
        defaultValues: {
            name: '',
            serialNumber: '',
            modelId: '',
            statusLabelId: '',
            departmentId: '',
            inventoryId: '',
            locationId: '',
            supplierId: '',
            endOfLife: undefined,
            material: '',
        },
    })

    // Load data
    React.useEffect(() => {
        fetchStatusLabels()
        fetchModels()
        fetchLocations()
        // fetchDepartments()
        // fetchInventories()
        // fetchSuppliers()

        if (isUpdate && id) {
            startTransition(async () => {
                const asset = await findById(id)
                if (asset) {
                    form.reset(asset)
                } else {
                    toast.error('Asset not found')
                    router.back()
                }
            })
        }
    }, [isUpdate, id])

    async function onSubmit(data: AssetFormValues) {
        startTransition(async () => {
            try {
                // if (isUpdate) {
                //     const result = await updateAsset(id!, data)
                //     if (result.error) {
                //         toast.error(result.error)
                //         return
                //     }
                //     toast.success('Asset updated successfully')
                // } else {
                //     const result = await createAsset(data)
                //     if (result.error) {
                //         toast.error(result.error)
                //         return
                //     }
                //     toast.success('Asset created successfully')
                // }
                router.back()
            } catch (error) {
                toast.error('Something went wrong')
                console.error(error)
            }
        })
    }

    const SelectWithButton = ({
                                  name,
                                  label,
                                  data,
                                  onNew,
                                  placeholder,
                              }: {
        name: keyof AssetFormValues;
        label: string;
        data: any[];
        onNew: () => void;
        placeholder: string;
    }) => (
        <div className="flex gap-2">
            <div className="flex-1">
                <CustomSelect
                    value={form.watch(name)}
                    name={name}
                    label={label}
                    control={form.control}
                    data={data}
                    placeholder={placeholder}
                />
            </div>
            <Button
                type="button"
                variant="outline"
                onClick={onNew}
                className="self-end h-10"
                disabled={isPending}
            >
                <Plus className="h-4 w-4" />
            </Button>
        </div>
    );

    return (
        <section className="w-full mx-auto p-6">
            {/* Modals */}
            <DialogContainer
                description={''}
                open={isModelOpen}
                onOpenChange={closeModel}
                title="Add Model"
                form={<ModelForm />}
            />
            <DialogContainer
                description={''}
                open={isStatusOpen}
                onOpenChange={closeStatus}
                title="Add Status"
                form={<StatusLabelForm />}
            />
            {/* Add other modals */}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Card className="p-6 space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-2 gap-6">
                            <CustomInput
                                name="name"
                                label="Asset Name"
                                control={form.control}
                                type="text"
                                placeholder="Enter asset name"
                            />

                            <CustomInput
                                name="serialNumber"
                                label="Serial Number"
                                control={form.control}
                                type="text"
                                placeholder="Enter serial number"
                            />
                        </div>

                        {/* Selections */}
                        <div className="space-y-6">
                            <SelectWithButton
                                name="modelId"
                                label="Model"
                                data={models}
                                onNew={openModel}
                                placeholder="Select model"
                            />

                            <SelectWithButton
                                name="statusLabelId"
                                label="Status"
                                data={statusLabels}
                                onNew={openStatus}
                                placeholder="Select status"
                            />

                            <SelectWithButton
                                name="departmentId"
                                label="Department"
                                data={[]}
                                onNew={() => {
                                }}
                                placeholder="Select department"
                            />

                            <SelectWithButton
                                name="locationId"
                                label="Location"
                                data={locations}
                                onNew={openLocation}
                                placeholder="Select location"
                            />

                            <SelectWithButton
                                name="supplierId"
                                label="Supplier"
                                data={[]}
                                onNew={() => {
                                }}
                                placeholder="Select supplier"
                            />
                        </div>

                        {/* Additional Information */}
                        <div className="grid grid-cols-2 gap-6">
                            {/* Each form field gets its own container with consistent heights */}
                            <div className="flex flex-col space-y-2">
                                <FormLabel>End of Life</FormLabel>
                                <CustomDatePicker
                                    name="endOfLife"
                                    form={form}
                                    placeholder="Select date"
                                />
                            </div>

                            <div className="flex flex-col space-y-2">
                                <FormLabel>Material</FormLabel>
                                <CustomInput
                                    name="material"
                                    label=""  // Remove label from component as we're handling it above
                                    control={form.control}
                                    placeholder="Enter material"
                                    type="text"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-4">
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
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {isUpdate ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                isUpdate ? 'Update Asset' : 'Create Asset'
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </section>
    );
};

export default AssetForm;