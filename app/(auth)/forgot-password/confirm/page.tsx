"use client";
import React, { useEffect, useState } from "react";
import PasswordConfirmForm from "@/components/forms/PasswordConfirmForm";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const ConfirmPasswordReset = () => {
  const [sessionChecked, setSessionChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace(
          "/forgot-password?error=Auth%20session%20missing.%20Please%20use%20the%20reset%20link%20from%20your%20email.",
        );
      } else {
        setSessionChecked(true);
      }
    });
  }, [router]);

  if (!sessionChecked) return <div>Loading...</div>;

  return (
    <div className={"flex-center size-full max-sm:px-6"}>
      <PasswordConfirmForm />
    </div>
  );
};

export default ConfirmPasswordReset;
