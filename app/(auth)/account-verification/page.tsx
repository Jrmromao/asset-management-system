"use client";
import React from "react";
import LoginForm from "@/components/forms/LoginForm";
import AccountVerificationForm from "@/components/forms/AccountVerificationForm";

const AccountVerification = () => {
  return (
    <div className={"flex-center size-full max-sm:px-6"}>
      <AccountVerificationForm />
    </div>
  );
};

export default AccountVerification;
