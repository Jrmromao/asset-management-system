'use client'
import HeaderBox from "@/components/HeaderBox";
import React from "react";
import AccessoryForm from "@/components/forms/AccessoryForm";


const Create = () => {

    return (
        <div className="">
            <div>
                <HeaderBox
                    title="Create an Accessory"
                    subtext="Fill the form to create an Accessory."
                />
            </div>
            <AccessoryForm />
        </div>
    )
}
export default Create
