'use client'

import React, {useEffect, useState} from 'react'
import HeaderBox from "@/components/HeaderBox";
import CustomTable from "@/components/CustomTable";
import {useRouter} from "next/navigation"
import {getAssets} from "@/lib/actions/assets.actions";

const Assets = () => {
    const [open, setOpen] = useState(false);
    const [assetList, setAssetList] = useState()
    const navigate = useRouter()

    useEffect(() => {
        getAssets().then(assets => setAssetList(assets))
    }, [getAssets, setAssetList]);


    return (
        <div className="assets">

            <div className="transactions-header">
                <HeaderBox
                    title="Assets"
                    subtext="Manage your assets."
                />
            </div>


            <div className="space-y-6">
                <section className="flex w-full flex-col gap-6">
                    <div className="flex space-x-4 items-center">
                        <button className=" py-2 px-4 rounded" onClick={() => navigate.push('/assets/create-new')}>Add
                            Asset
                        </button>
                        {/*<span className="text-black">|</span>*/}
                        {/*<button className=" py-2 px-4 rounded">Add Asset</button>*/}
                        {/*<span className="text-black">|</span>*/}
                        {/*<button className=" py-2 px-4 rounded">Add Asset</button>*/}
                    </div>

                </section>
                <section className="flex w-full flex-col gap-6">
                    <CustomTable assets={assetList || []}/>
                </section>


            </div>
        </div>
    )
}
export default Assets
