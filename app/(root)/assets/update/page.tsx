'use client'

import React, {useEffect, useState} from 'react'
import HeaderBox from "@/components/HeaderBox";
import AssetForm from "@/components/forms/AssetForm";
import {useSearchParams} from "next/navigation";
import {useAccessoryStore} from "@/lib/stores/accessoryStore";
import {useCategoryStore} from "@/lib/stores/categoryStore";

const Update = () => {


    const searchParams = useSearchParams()
    const id = +searchParams.get('id')!

    const [categories, fetchAll] = useCategoryStore((state) => [state.categories, state.getAll]);
    const [asset, setAsset] = useState<Asset | null>()
   const [findById] =  useAccessoryStore((state) => [state.findById])

    useEffect(()=>{
        const asset = findById(id)
        // setAsset(asset | null)

    })

    return (
        <div className="assets">
            <div>
                <HeaderBox
                    title="Create new asset"
                    subtext="Fill the form to create new asset."
                />
            </div>
            <AssetForm asset={{
                name: 'test',
                categoryId: 0,
                brand: '', model: 'Tesla', datePurchased: ' ', purchasePrice: 0, serialNumber: ''

            }}/>
        </div>)

}
export default Update
