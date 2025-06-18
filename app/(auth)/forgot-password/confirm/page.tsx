"use client";
import React, { useEffect, useState } from "react";
import PasswordConfirmForm from "@/components/forms/PasswordConfirmForm";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const ConfirmPasswordReset = () => {
  const [sessionChecked, setSessionChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setSessionChecked(true);
      } else {
        // Listen for session changes
        const { data: listener } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (session) {
              setSessionChecked(true);
              listener?.subscription.unsubscribe();
              clearTimeout(timeout);
            }
          },
        );
        // Fallback: after 2 seconds, redirect if still no session
        timeout = setTimeout(() => {
          router.replace(
            "/forgot-password?error=Auth%20session%20missing.%20Please%20use%20the%20reset%20link%20from%20your%20email.",
          );
          listener?.subscription.unsubscribe();
        }, 2000);
      }
    };
    checkSession();
    return () => clearTimeout(timeout);
  }, [router]);

  if (!sessionChecked) return <div>Loading...</div>;

  return (
    <div className={"flex-center size-full max-sm:px-6"}>
      <PasswordConfirmForm />
    </div>
  );
};

export default ConfirmPasswordReset;
