'use client'

import React, {useEffect, useMemo, useState} from 'react'
import HeaderBox from "@/components/HeaderBox";
import {useRouter} from "next/navigation"
import {getAssets} from "@/lib/actions/assets.actions";
import CustomAssetTable from "@/components/tables/CustomAssetTable";
import {AssetModal} from "@/components/modals/AssetModal";
import {useDialogStore} from "@/lib/stores/store";
import {Pagination} from "@/components/Pagination";

const Assets = () => {
    const [open, setOpen] = useState(false);
    const [assetList, setAssetList] = useState([])
    const navigate = useRouter()

    const [openDialog, closeDialog, isOpen] = useDialogStore(state => [state.onOpen, state.onClose, state.isOpen
    ])



    const rowsPerPage = 10;
    const totalPages = Math.ceil(assetList.length / rowsPerPage);

    const indexOfLastTransaction = 1 * rowsPerPage;
    const indexOfFirstTransaction = indexOfLastTransaction - rowsPerPage;

    const currentAssets = assetList.slice(
        indexOfFirstTransaction, indexOfLastTransaction
    )

    const memoAssetList = useMemo(() => getAssets().then(assets => setAssetList(assets)), [setAssetList, isOpen]);


    return (
        <div className="assets">

            <div className="transactions-header">
                <HeaderBox
                    title="Assets"
                    subtext="Manage your assets."
                />
            </div>
            <AssetModal open={isOpen} onOpenChange={closeDialog} />
            <div className="space-y-6">
                <section className="flex w-full flex-col gap-6">
                    <div className="flex space-x-4 items-center">
                        <button
                            className=" py-2 px-4 rounded  border-2 border-red-500 hover:bg-red-500 hover:text-white"
                            onClick={() => openDialog()}>Add
                            Asset
                        </button>
                        <button
                            className=" py-2 px-4 rounded  border-2 border-red-500 hover:bg-red-500 hover:text-white"
                            onClick={() => openDialog()}>
                            Export
                        </button>
                    </div>
                </section>
                <section className="flex w-full flex-col gap-6">
                    <CustomAssetTable assets={currentAssets}/>
                    {totalPages > 1 && (
                        <div className="my-4 w-full">
                            <Pagination totalPages={totalPages} page={1} />
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}
export default Assets
