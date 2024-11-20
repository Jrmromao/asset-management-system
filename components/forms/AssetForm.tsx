'use client'

import React, {useEffect, useTransition} from 'react'
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {Button} from "@/components/ui/button"
import {Form, FormLabel} from "@/components/ui/form"
import {Loader2, Plus} from "lucide-react"
import {Card} from "@/components/ui/card"
import {useRouter} from "next/navigation"
import {toast} from "sonner"

// Components
import CustomInput from "@/components/CustomInput"
import CustomSelect from "@/components/CustomSelect"
import {DialogContainer} from "@/components/dialogs/DialogContainer"
import CustomDatePicker from "@/components/CustomDatePicker"

// Forms
import ModelForm from "@/components/forms/ModelForm"
import StatusLabelForm from "@/components/forms/StatusLabelForm"

// Stores
import {useAssetStore} from "@/lib/stores/assetStore"
import {useStatusLabelStore} from "@/lib/stores/statusLabelStore"
import {useModelStore} from "@/lib/stores/modelStore"
import {useLocationStore} from "@/lib/stores/locationStore";
import DepartmentForm from "@/components/forms/DepartmentForm";
import {useDepartmentStore} from "@/lib/stores/departmentStore";
import LocationForm from "@/components/forms/LocationForm";
import {useSupplierStore} from "@/lib/stores/SupplierStore";
import SupplierForm from "@/components/forms/SupplierForm";
import {useInventoryStore} from "@/lib/stores/inventoryStore";
import InventoryForm from "@/components/forms/InventoryForm";
import {create} from "@/lib/actions/assets.actions";
import CategoryForm from "@/components/forms/CategoryForm";
import {useCategoryStore} from "@/lib/stores/categoryStore";
import CustomPriceInput from '../CustomPriceInput'
import {SelectWithButton} from "@/components/SelectWithButton";
import ManufacturerForm from "@/components/forms/ManufacturerForm";
import {useManufacturerStore} from "@/lib/stores/manufacturerStore";

const assetSchema = z.object({
    name: z.string().min(1, "Asset name is required"),
    purchaseDate: z.date({
        message: "Purchase Date is required."
    }),
    serialNumber: z.string().min(1, "Serial number is required"),
    modelId: z.string().min(1, "Model is required"),
    statusLabelId: z.string().min(1, "Status is required"),
    departmentId: z.string().min(1, "Department is required"),
    inventoryId: z.string().min(1, "Inventory is required"),
    locationId: z.string().min(1, "Location is required"),
    supplierId: z.string().min(1, "Supplier is required"),
    price: z.string({ required_error: "Price is required" })
        .transform((value) => Number(value)),
    poNumber: z.string().min(1, 'PO Number is required'),
    endOfLife: z.date({
        required_error: "End of life date is required",
    }),
    material: z.string().optional(),
    weight: z.string().optional()
        .transform((value) => Number(value)),
});

type AssetFormValues = z.infer<typeof assetSchema>;

interface AssetFormProps {
    id?: string;
    isUpdate?: boolean;
}

const AssetForm = ({id, isUpdate = false}: AssetFormProps) => {
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

    const {
        manufacturers,
        isOpen: isManufacturerOpen,
        onOpen: openManufacturer,
        onClose: closeManufacturer,
        getAll: fetchManufacturers
    } = useManufacturerStore()

    // Form
    const form = useForm<AssetFormValues>({
        resolver: zodResolver(assetSchema),
        defaultValues: {
            name: '',
            serialNumber: '',
            modelId: '',
            price: 0,
            statusLabelId: '',
            departmentId: '',
            inventoryId: '',
            locationId: '',
            supplierId: '',
            poNumber: '',
            weight: 0,
            // endOfLife: new Date(),
            material: '',
        },
    })


    useEffect(() => {
        fetchStatusLabels()
        fetchModels()
        fetchLocations()
        fetchDepartments()
        fetchInventories()
        fetchSuppliers()

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
    }, [isUpdate, id, fetchStatusLabels, fetchModels, fetchLocations, fetchDepartments, fetchInventories, fetchSuppliers])

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
                //     const result = await createAsset({
                //         ...data,
                //         endOfLife: data.endOfLife.toISOString()
                //     })

                await create({
                    datePurchased: data.purchaseDate,
                    price: data.price,
                    name: data.name,
                    serialNumber: data.serialNumber,
                    material: data.material,
                    modelId: data.modelId,
                    endOfLife: data.endOfLife,
                    licenseId: '33333333-ae07-4531-a801-ede53fb31f04',
                    statusLabelId: data.statusLabelId,
                    supplierId: data.supplierId,
                    companyId: 'bf40528b-ae07-4531-a801-ede53fb31f04',
                    inventoryId: data.inventoryId,
                    departmentId: data.departmentId,
                    locationId: data.locationId,
                    weigh: data.weight,
                    poNumber: data.poNumber,

                }).then(r => {
                    form.reset()
                    toast.success('Asset created successfully')
                })

            } catch (error) {
                toast.error('Something went wrong')
                form.reset()
                console.error(error)
            }
        })
    }


    return (
        <section className="w-full mx-auto p-6">
            {/* Modals */}
            <DialogContainer
                description={''}
                open={isModelOpen}
                onOpenChange={closeModel}
                title="Add Model"
                form={<ModelForm/>}
            />
            <DialogContainer
                description={''}
                open={isStatusOpen}
                onOpenChange={closeStatus}
                title="Add Status"
                form={<StatusLabelForm/>}
            />
            <DialogContainer
                description={''}
                open={isLocationOpen}
                onOpenChange={closeLocation}
                title="Add Location"
                form={<LocationForm/>}
            />

            <DialogContainer
                description={''}
                open={isDepartmentOpen}
                onOpenChange={closeDepartment}
                title="Add Department"
                form={<DepartmentForm/>}
            />

            <DialogContainer
                description={''}
                open={isSupplierOpen}
                onOpenChange={closeSupplier}
                title="Add Supplier"
                form={<SupplierForm/>}
            />
            <DialogContainer
                description={''}
                open={isInventoryOpen}
                onOpenChange={closeInventory}
                title="Add Inventory"
                form={<InventoryForm/>}
            />

            <DialogContainer
                description={''}
                open={isCategoryOpen}
                onOpenChange={closeCategory}
                title="Add Inventory"
                form={<CategoryForm/>}
            />

            <DialogContainer
                description=""
                open={isManufacturerOpen}
                onOpenChange={closeManufacturer}
                title="Add Manufacturer"
                form={<ManufacturerForm/>}
            />

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Base Info Card */}
                    <Card className="p-6">
                        <div className="space-y-6">
                            {/* Form Section Headers with Visual Separation */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <CustomInput
                                        required
                                        name="name"
                                        label="Asset Name"
                                        control={form.control}
                                        type="text"
                                        placeholder="Enter asset name"
                                    />
                                    <CustomInput
                                        required
                                        name="serialNumber"
                                        label="Tag Number"
                                        control={form.control}
                                        type="text"
                                        placeholder="Enter tag number"
                                    />
                                </div>
                                <SelectWithButton
                                    name="modelId"
                                    form={form}
                                    isPending
                                    label="Model"
                                    data={models}
                                    onNew={openModel}
                                    placeholder="Select model"
                                    required
                                />
                            </div>

                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold mb-4">Status & Location</h3>
                                <div className="space-y-6">
                                    <SelectWithButton
                                        name="statusLabelId"
                                        form={form}
                                        isPending
                                        label="Status Label"
                                        data={statusLabels}
                                        onNew={openStatus}
                                        placeholder="Select status"
                                        required
                                    />
                                    <SelectWithButton
                                        form={form}
                                        isPending
                                        name="departmentId"
                                        label="Department"
                                        data={departments}
                                        onNew={openDepartment}
                                        placeholder="Select department"
                                        required
                                    />
                                    <SelectWithButton
                                        isPending
                                        form={form}
                                        name="locationId"
                                        label="Location"
                                        data={locations}
                                        onNew={openLocation}
                                        placeholder="Select location"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold mb-4">Purchase Information</h3>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <CustomInput
                                            name="poNumber"
                                            label="PO Number"
                                            control={form.control}
                                            placeholder="Enter PO number"
                                        />
                                        <CustomPriceInput
                                            name="price"
                                            label="Unit Price"
                                            control={form.control}
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        {/*<CustomDatePicker*/}
                                        {/*    name="purchaseDate"*/}
                                        {/*    form={form}*/}
                                        {/*    label="Purchase Date"*/}
                                        {/*    placeholder="Select date"*/}
                                        {/*/>*/}
                                        {/*<CustomDatePicker*/}
                                        {/*    name="endOfLife"*/}
                                        {/*    form={form}*/}
                                        {/*    label="End of Life"*/}
                                        {/*    placeholder="Select date"*/}
                                        {/*/>*/}

                                        <CustomDatePicker
                                            label="Purchase Date"
                                            name="purchaseDate"
                                            form={form}
                                            placeholder="Select purchase date"
                                            required
                                            disablePastDates
                                            tooltip="Select the date your asset was purchased"
                                            minDate={new Date()}
                                            maxDate={new Date(2025, 0, 1)}
                                            formatString="dd/MM/yyyy"
                                        />

                                        <CustomDatePicker
                                            label="End of Life"
                                            name="endOfLife"
                                            form={form}
                                            placeholder="Select end of life"
                                            required
                                            disablePastDates
                                            tooltip="Select the date your asset will no longer be used"
                                            minDate={new Date()}
                                            maxDate={new Date(2100, 0, 1)}
                                            formatString="dd/MM/yyyy"
                                        />
                                    </div>
                                    <SelectWithButton
                                        name="supplierId"
                                        label="Supplier"
                                        data={suppliers}
                                        onNew={openSupplier}
                                        placeholder="Select supplier"
                                        required
                                        form={form}
                                        isPending
                                    />
                                    <SelectWithButton
                                        form={form}
                                        isPending
                                        name="inventoryId"
                                        label="Inventory"
                                        data={inventories}
                                        onNew={openInventory}
                                        placeholder="Select an inventory"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold mb-4">Physical Properties</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <CustomInput
                                        name="material"
                                        label="Material"
                                        control={form.control}
                                        placeholder="Enter material"
                                    />
                                    <CustomInput
                                        name="weight"
                                        label="Weight (kg)"
                                        control={form.control}
                                        type="number"
                                        placeholder="Enter weight"
                                    />
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