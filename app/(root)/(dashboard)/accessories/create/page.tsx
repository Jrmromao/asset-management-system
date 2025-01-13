"use client";
import React from "react";
import HeaderBox from "@/components/HeaderBox";
import AccessoryForm from "@/components/forms/AccessoryForm";

const Create = () => {
  return (
    <div className="p-6 space-y-6">
      <HeaderBox
        title="Create an Accessory"
        subtext="Fill the form to create an Accessory."
      />

      <AccessoryForm />
    </div>
  );
};
export default Create;
