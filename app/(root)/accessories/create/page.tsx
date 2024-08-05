'use client'
import HeaderBox from "@/components/HeaderBox";
import React from "react";
import AssetForm from "@/components/forms/AssetForm";
import LicenseForm from "@/components/forms/LicenseForm";


const Create = () => {

    return (
        <div className="assets">
            <div>
                <HeaderBox
                    title="Create an Accessory"
                    subtext="Fill the form to create an Accessory."
                />
            </div>
            <LicenseForm/>
        </div>
    )
}
export default Create
