"use client";
import HeaderBox from "@/components/HeaderBox";
import React from "react";
import LicenseForm from "@/components/forms/LicenseForm";

const Create = () => {
  return (
    <div className="">
      <div>
        <HeaderBox
          title="Create new License"
          subtext="Fill the form to create new License."
        />
      </div>
      <LicenseForm />
    </div>
  );
};
export default Create;
