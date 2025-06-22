"use client";
import React from "react";
import RegisterForm from "@/components/forms/RegisterForm";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const SignUp = () => {
  const searchParams = useSearchParams();
  const assets = searchParams.get("assets");

  return (
    <div className="flex flex-col items-center justify-center w-full gap-8 py-8 max-sm:px-6">
      <RegisterForm assetCount={assets ? Number(assets) : 100} />
    </div>
  );
};

export default SignUp;
