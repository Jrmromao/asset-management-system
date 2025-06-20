"use client";
import React from "react";
import PasswordConfirmForm from "@/components/forms/PasswordConfirmForm";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/SessionProvider";

const ConfirmPasswordReset = () => {
  const { session } = useSession();
  const router = useRouter();

  if (!session) {
    if (typeof window !== "undefined") {
      router.replace(
        "/forgot-password?error=Auth%20session%20missing.%20Please%20use%20the%20reset%20link%20from%20your%20email.",
      );
    }
    return <div>Loading...</div>;
  }

  return (
    <div className={"flex-center size-full max-sm:px-6"}>
      <PasswordConfirmForm />
    </div>
  );
};

export default ConfirmPasswordReset;
