'use client'

import React, {useEffect, useState} from 'react'
import HeaderBox from "@/components/HeaderBox";
import {get, remove, findById} from "@/lib/actions/assets.actions";
import CustomAssetTable from "@/components/tables/CustomAssetTable";
import {AssetDialog} from "@/components/modals/AssetDialog";
import {useDialogStore} from "@/lib/stores/store";
import {Button} from "@/components/ui/button";
import {useAssetStore} from "@/lib/stores/assetStore";
import {a} from "@aws-amplify/data-schema";
import CustomTable from "@/components/tables/CustomTable";
import {useRouter} from "next/navigation";
import {filterColumns, renameColumns} from "@/lib/utils";
import AssetWizard from "@/components/Wizard/AssetWizard";

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
            <AssetDialog open={isOpen} onOpenChange={closeDialog}/>
            <div className="space-y-6">
                <section className="flex">
                    <div className="flex justify-end">
                        <Button
                            variant={'link'}
                            onClick={() => openDialog()}>Add Asset
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


            <AssetWizard />

        </div>
    )
}
export default Assets
