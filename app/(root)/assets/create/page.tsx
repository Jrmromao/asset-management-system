'use client'
import HeaderBox from "@/components/HeaderBox";
import React from "react";
import AssetForm from "@/components/forms/AssetForm";


const CreateNew = () => {

    return (
        <div className="assets">
            <div>
                <HeaderBox
                    title="Create new asset"
                    subtext="Fill the form to create new asset."
                />
            </div>

                    <AssetForm />

        </div>

    )
}
export default CreateNew
