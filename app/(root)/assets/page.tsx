'use client'

import React, {useEffect} from 'react'
import HeaderBox from "@/components/HeaderBox";
import CustomAssetTable from "@/components/tables/CustomAssetTable";
import {useDialogStore} from "@/lib/stores/store";
import {Button} from "@/components/ui/button";
import {useAssetStore} from "@/lib/stores/assetStore";
import {useRouter} from "next/navigation";
import {filterColumns, renameColumns} from "@/lib/utils";

const Assets = () => {

    const [openDialog, closeDialog, isOpen] = useDialogStore(state => [state.onOpen, state.onClose, state.isOpen])

    const [assets, loading, fetchAssets, getAssetById, deleteAsset] = useAssetStore((state) => [state.assets, state.loading, state.fetchAssets, state.getAssetById, state.deleteAsset,]);



    const navigate = useRouter()
    const columnMappings: Record<keyof Asset, string> = {
        categoryId: "categoryId",
        datePurchased: "Date Purchased",
        name: "name",
        purchasePrice: "Price",
        id: "id",
        license: "License",
        createdAt: "Created At",
        updatedAt: "updatedAt",
        assigneeId: "assigneeId",
        certificateUrl: "certificateUrl",
        licenceUrl: "licenceUrl",
        model: "Model",
        brand: "Brand",
        serialNumber: "Serial Number",
        category: "Category"
    };

    useEffect(() => {
        fetchAssets();
    }, []);

    const filteredData = filterColumns(assets, ['id', 'updatedAt', 'categoryId', 'datePurchased', 'certificateUrl', 'assigneeId', 'purchasePrice', 'licenceUrl']);
    const renamedData = renameColumns(filteredData, columnMappings);
    if (renamedData?.length === 0) return <p>No assets found</p>
    const headers = renamedData?.length > 0 ? Object?.keys(renamedData[0]) : []




    return (
        <div className="assets">
            <div className="transactions-header">
                <HeaderBox
                    title="Assets"
                    subtext="Manage your assets."
                />
            </div>
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
                            Export
                        </Button>
                    </div>
                </section>
                <section className="flex w-full flex-col gap-6">
                    <CustomAssetTable assets={assets} deleteAsset={deleteAsset} findById={getAssetById}/>
                </section>
            </div>


        </div>
    )
}
export default Assets
