'use client'

import React, {useEffect, useState} from 'react'
import HeaderBox from "@/components/HeaderBox";
import AssetForm from "@/components/forms/AssetForm";
import {useSearchParams} from "next/navigation";
import {useAccessoryStore} from "@/lib/stores/accessoryStore";
import {useCategoryStore} from "@/lib/stores/categoryStore";
import {useAssetStore} from "@/lib/stores/assetStore";

const Update = () => {


    const searchParams = useSearchParams()
    const id = +searchParams.get('id')!
    const [asset, setAsset] = useState<Asset | null>()
    const [findById] = useAssetStore((state) => [state.findById])

    useEffect(() => {
        findById(id).then(assetResult => setAsset(assetResult))
    }, [findById, id])

    return (
        <div className="assets">
            <div>
                <HeaderBox
                    title={`Update asset with id: ${id}`}
                    subtext="Change the fileds you'd like to update."
                />
            </div>
            <AssetForm asset={asset} isUpdate={true}/>
        </div>)

}
export default Update
