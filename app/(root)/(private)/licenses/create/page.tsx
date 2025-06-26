"use client";
import HeaderBox from "@/components/HeaderBox";
import React from "react";
import LicenseForm from "@/components/forms/LicenseForm";
import { FileText } from "lucide-react";

const Create = () => {
  return (
    <div className="p-6 space-y-6">
      <HeaderBox
        title="Create new License"
        subtitle="Fill the form to create new License."
        icon={<FileText className="w-5 h-5" />}
      />

      <LicenseForm />
    </div>
  );
};
export default Create;
