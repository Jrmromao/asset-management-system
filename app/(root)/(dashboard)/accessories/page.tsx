'use client'
import React, {useCallback, useEffect, useMemo, useState} from 'react'
import HeaderBox from "@/components/HeaderBox";
import {useAccessoryStore} from "@/lib/stores/accessoryStore";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import {DataTable} from "@/components/tables/DataTable/data-table";
import {accessoriesColumns} from "@/components/tables/AccessoriesColumns";
import {toast} from "sonner";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import {DialogContainer} from "@/components/dialogs/DialogContainer";
import FileUploadForm from "@/components/forms/FileUploadForm";
import {useDialogStore} from "@/lib/stores/store";


const Consumables = () => {
    const [licensesList, setLicenseList] = useState<[]>()
    const [accessories, getAll, deleteAccessory] = useAccessoryStore((state) => [state.accessories, state.getAll, state.delete])
    const [openDialog, closeDialog, isOpen] = useDialogStore(state => [state.onOpen, state.onClose, state.isOpen])

    useEffect(()=>{
        getAll()
    }, [])

    const handleDelete = async (id: string) => {
        await deleteAccessory(id).then(_ => {
            getAll()
            toast.success('Accessory has been created')
        })
    }

    const handleView = async (id: string) => {
        navigate.push(`/accessories/view/?id=${id}`)
    }
    const onDelete = useCallback((accessory: any) => handleDelete(accessory?.id!), [])
    const onView = useCallback((accessory: any) => handleView(accessory?.id!), [])


    const columns = useMemo(() => accessoriesColumns({onDelete, onView}), []);

    const navigate = useRouter()

    return (
        <div className="assets">
            <Breadcrumb className="hidden md:flex">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/accessories">Accessories</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator/>
                </BreadcrumbList>
            </Breadcrumb>

            <DialogContainer open={isOpen} onOpenChange={closeDialog} title={'Import Accessories'}
                             description={'Import assets from a CSV file'}
                             form={<FileUploadForm dataType={'accessories'}/>}
            />

            <div className="transactions-header">
                <HeaderBox
                    title="Accessories"
                    subtext="Manage your accessories."
                />
            </div>
            <div className="space-y-6">
                <section className="flex">
                    <div className="flex justify-end">
                        <Button
                            variant={'link'}
                            onClick={() => navigate.push('/accessories/create')}>Create Accessory
                        </Button>

                        <Button
                            variant={"link"}
                            onClick={() => openDialog()}>
                            Import
                        </Button>
                    </div>
                </section>
                <section className="flex w-full flex-col gap-6">
                    <DataTable columns={columns} data={accessories}/>
                </section>
            </div>
        </div>)
}
export default Consumables
