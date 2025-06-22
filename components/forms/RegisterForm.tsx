"use client";
import React from "react";
import PremiumOnboardingFlowV2 from "./PremiumOnboardingFlowV2";
import { useSearchParams } from "next/navigation";

interface RegisterFormProps {
  assetCount?: number;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ assetCount }) => {
  const searchParams = useSearchParams();
  const assets = searchParams.get("assets");

  return (
    <div className="w-full">
      <PremiumOnboardingFlowV2
        assetCount={assets ? Number(assets) : assetCount}
      />
    </div>
  );
};

export default RegisterForm;
