"use client";
import React from "react";
import LoginForm from "@/components/forms/LoginForm";
import ForgotPasswordForm from "@/components/forms/ForgotPasswordForm";

const SignIn = () => {
  return (
    <div className={"flex-center size-full max-sm:px-6"}>
      <ForgotPasswordForm />
    </div>
  );
};

export default SignIn;
