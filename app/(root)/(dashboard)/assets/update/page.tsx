"use client";

import React, { useEffect, useState } from "react";
import HeaderBox from "@/components/HeaderBox";
import AssetForm from "@/components/forms/AssetForm";
import { useRouter, useSearchParams } from "next/navigation";

const Update = () => {
  const searchParams = useSearchParams();
  const id = String(searchParams.get("id"));

  return (
    <div className="assets">
      <div>
        <HeaderBox
          title={`Update asset with id: ${id}`}
          subtext="Change the fileds you'd like to update."
        />
      </div>
      <AssetForm id={id} isUpdate={true} />
    </div>
  );
};
export default Update;
