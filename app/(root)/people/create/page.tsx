import HeaderBox from "@/components/HeaderBox";
import AssetForm from "@/components/forms/AssetForm";
import React from "react";
import PersonForm from "@/components/forms/PersonForm";

const CreateNew = () => {

    return (
        <div className="assets">
            <div>
                <HeaderBox
                    title="Register a new employee"
                    subtext="Fill the form to register a new employee."
                />
            </div>

            <PersonForm />



        </div>

    )
}
export default CreateNew