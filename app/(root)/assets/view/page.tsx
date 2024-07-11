'use client'

import React, {useEffect, useState} from 'react'
import HeaderBox from "@/components/HeaderBox";
import {useRouter, useSearchParams} from "next/navigation"
import {findById, get} from "@/lib/actions/assets.actions";
import {AssetDialog} from "@/components/modals/AssetDialog";
import {useDialogStore} from "@/lib/stores/store";
import {json} from "node:stream/consumers";
import {Card, CardHeader} from "@/components/ui/card";

const View = () => {
    const [asset, setAsset] = useState({})
    const [openDialog, closeDialog, isOpen] = useDialogStore(state => [state.onOpen, state.onClose, state.isOpen])

    const searchParams = useSearchParams()
    const navigate = useRouter()
    const id = +searchParams.get('id')!
    const tile = `Asset ID: ${searchParams.get('id')}`

    useEffect(() => {
        if (!id) {
            navigate.back()
            return
        }
        findById(id).then(asset => setAsset(asset))

    }, [setAsset, findById]);


    return (
        <div className="assets">
            <div className="space-y-6">
                <section className="flex w-full flex-col gap-6">

                    <Card className={'w-full mx-auto py-2'}>
                        <CardHeader className="px-4 text-xl" >MacBook M1 Pro</CardHeader>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-4 ">
                                <h2 className="text-gray-500 mb-2">Name</h2>
                                <p className="font-semibold text-gray-600">{asset?.name}</p>
                            </div>
                            <div className="p-4">
                                <h2 className="text-gray-500 mb-2">Price</h2>
                                <p className="font-semibold text-gray-600">{asset?.price}</p>
                            </div>
                            <div className="p-4">
                                <h2 className="text-gray-500 mb-2">Created At</h2>
                                <p className="font-semibold text-gray-600">{asset?.createdAt}</p>
                            </div>
                            <div className="p-4">
                                <h2 className="text-gray-500 mb-2">CColumn 4 Header</h2>
                                <p className="font-semibold text-gray-600">This is the description for column 4.</p>
                            </div>
                        </div>
                    </Card>
                </section>
            </div>
            <section className="flex w-full">

                <Card className={'w-full mx-auto py-3'}>
                    <CardHeader className="px-4">Activity </CardHeader>


                </Card>
            </section>

        </div>
    )
}
export default View
