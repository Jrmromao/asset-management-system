'use client'

import React, {useMemo, useState} from 'react'
import HeaderBox from "@/components/HeaderBox";
import {useRouter, useSearchParams} from "next/navigation"
import {get} from "@/lib/actions/assets.actions";
import CustomAssetTable from "@/components/tables/CustomAssetTable";
import {AssetDialog} from "@/components/modals/AssetDialog";
import {useDialogStore} from "@/lib/stores/store";
import {Pagination} from "@/components/Pagination";
import {Button} from "@/components/ui/button";

const Assets = ({page = 1}) => {
    const [open, setOpen] = useState(false);
    const [assetList, setAssetList] = useState([])
    const navigate = useRouter()

    const [openDialog, closeDialog, isOpen] = useDialogStore(state => [state.onOpen, state.onClose, state.isOpen
    ])
    const searchParams = useSearchParams()
    // const page = searchParams.get('page')

    const rowsPerPage = 10;
    const totalPages = Math.ceil(assetList.length / rowsPerPage);

    const indexOfLastTransaction = page * rowsPerPage;
    const indexOfFirstTransaction = indexOfLastTransaction - rowsPerPage;

    const currentAssets = assetList.slice(
        indexOfFirstTransaction, indexOfLastTransaction
    )

    const memoAssetList = useMemo(() => get().then(assets => setAssetList(assets)), [setAssetList, isOpen, page]);


    return (
        <div className="assets">


            <div className="transactions-header">
                <HeaderBox
                    title="Assets"
                    subtext="Manage your assets."
                />
            </div>
            <AssetDialog open={isOpen} onOpenChange={closeDialog} />

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
                    <CustomAssetTable assets={currentAssets}/>
                    {totalPages > 1 && (
                        <div className="my-4 w-full">
                            <Pagination totalPages={totalPages} page={page} />
                        </div>
                    )}
                </section>
            </div>


        </div>
    )
}
export default Assets
