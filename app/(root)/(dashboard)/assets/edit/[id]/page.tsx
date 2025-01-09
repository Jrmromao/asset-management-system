"use client";

import React from "react";
import HeaderBox from "@/components/HeaderBox";
import AssetForm from "@/components/forms/AssetForm";
import { useSearchParams } from "next/navigation";
import { Laptop } from "lucide-react";

interface EditPageProps {
  params: {
    id: string;
  };
}

const Edit = ({ params }: EditPageProps) => {
  const searchParams = useSearchParams();

  const { id } = params;
  return (
    <div className="p-6 space-y-6">
      <div>
        <HeaderBox
          title={`Update asset with id: ${id}`}
          subtext="Change the fileds you'd like to update."
          icon={<Laptop className="h-6 w-6" />}
        />
      </div>

      <AssetForm id={id} isUpdate={true} />
    </div>
  );
};
export default Edit;
