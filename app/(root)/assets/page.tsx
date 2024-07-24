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

const Assets = () => {

    const [openDialog, closeDialog, isOpen] = useDialogStore(state => [state.onOpen, state.onClose, state.isOpen])

    const [assets, loading, fetchAssets, getAssetById, deleteAsset] = useAssetStore((state) => [state.assets, state.loading, state.fetchAssets, state.getAssetById, state.deleteAsset,]);


    useEffect(() => {
        fetchAssets();
    }, []);

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
        </div>
    )
}
export default Assets
