"use client";
import React from "react";
import RegisterForm from "@/components/forms/RegisterForm";
import { useSearchParams } from "next/navigation";

const SignUp = () => {
  const searchParams = useSearchParams();
  const assets = searchParams.get("assets");

  return (
    <div className="flex items-center justify-center w-full h-full max-sm:px-6">
      <RegisterForm assetCount={assets ? Number(assets) : 100} />
    </div>
  );
};

export default SignUp;
