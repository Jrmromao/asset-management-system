'use client'

import React, {useCallback, useEffect, useMemo} from 'react'
import HeaderBox from "@/components/HeaderBox";
import {useDialogStore} from "@/lib/stores/store";
import {Button} from "@/components/ui/button";
import {useAssetStore} from "@/lib/stores/assetStore";
import {useRouter} from "next/navigation";
import {DialogContainer} from "@/components/dialogs/DialogContainer";
import FileUploadForm from "@/components/forms/FileUploadForm";
import {DataTable} from "@/components/tables/DataTable/data-table";
import {assetColumns} from "@/components/tables/AssetColumns";
import {toast} from "sonner";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import Link from "next/link";

const Assets = () => {

    const [openDialog, closeDialog, isOpen] = useDialogStore(state => [state.onOpen, state.onClose, state.isOpen])
    const [assets, loading, fetchAssets, getAssetById, deleteAsset] = useAssetStore((state) => [state.assets, state.loading, state.getAll, state.findById, state.delete,]);
    const navigate = useRouter()

    const handleDelete = async (id: string) => {
        await deleteAsset(id).then(_ => {
            fetchAssets()
            toast.success('Event has been created')
        }).catch(err =>{
            toast.error(err)
        });

    }

    const handleView = async (id: string) => {
        navigate.push(`/assets/view/${id}`)
    }
    const onDelete = useCallback((asset: Asset) => handleDelete(asset?.id!), [])
    const onView = useCallback((asset: Asset) => handleView(asset?.id!), [])
    const columns = useMemo(() => assetColumns({onDelete, onView}), []);

    useEffect(() => {
        fetchAssets();
    }, []);

    return (
        <div className="assets">
            <Breadcrumb className="hidden md:flex">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/assets">Assets</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator/>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="transactions-header">
                <HeaderBox
                    title="Assets"
                    subtext="Manage your assets."
                />
            </div>
            <DialogContainer open={isOpen} onOpenChange={closeDialog} title={'Import Assets'}
                             description={'Import assets from a CSV file'}
                             form={<FileUploadForm dataType={'assets'}/>}
            />
            <div className="space-y-6">
                <section className="flex">
                    <div className="flex justify-end">
                        <Button
                            variant={'link'}
                            onClick={() => navigate.push('/assets/create')}>Add Asset
                        </Button>
                        <Button
                            variant={"link"}
                            onClick={() => openDialog()}>
                            Import
                        </Button>
                    </div>
                </section>
                <section className="flex w-full flex-col gap-6">
                    <DataTable columns={columns} data={assets}/>
                </section>
            </div>
        </div>
    )
}
export default Assets
