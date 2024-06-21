'use client'
import HeaderBox from "@/components/HeaderBox";
import React from "react";
import AssetForm from "@/components/AssetForm";


const CreateNew = () => {

    return (
        <div className="assets">
            <div className="transactions-header">
                <HeaderBox
                    title="Create new asset"
                    subtext="Fill the form to create new asset."
                />
            </div>
            <div className="">
                    <AssetForm />

            </div>
        </div>

    )
}
export default CreateNew
