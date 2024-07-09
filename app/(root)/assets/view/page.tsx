'use client'

import React, {useEffect, useState} from 'react'
import HeaderBox from "@/components/HeaderBox";
import {useRouter, useSearchParams} from "next/navigation"
import {findById, get} from "@/lib/actions/assets.actions";
import {AssetDialog} from "@/components/modals/AssetDialog";
import {useDialogStore} from "@/lib/stores/store";
import {json} from "node:stream/consumers";

const View = () => {
    const [asset, setAsset] = useState([])
    const [openDialog, closeDialog, isOpen] = useDialogStore(state => [state.onOpen, state.onClose, state.isOpen])

    const searchParams = useSearchParams()
    const navigate = useRouter()
    const id = +searchParams.get('id')!
    const tile = `Asset ${searchParams.get('id')}`

    useEffect(() => {
        if (!id) {
            navigate.back()
            return
        }
        findById(id).then(asset => setAsset(asset))

    }, [setAsset, findById]);


    return (
        <div className="assets">
            <div className="transactions-header">
                <HeaderBox
                    title={tile}
                    subtext="Manage your assets."
                />
            </div>
            <div className="space-y-6">
                <section className="flex">
                    <div className="flex justify-end">
                    </div>
                </section>
                <section className="flex w-full flex-col gap-6">
                    {JSON.stringify(asset, null, 2)}
                </section>
            </div>


        </div>
    )
}
export default View
