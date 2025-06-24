"use client";
import React, { useEffect } from "react";
import LoginForm from "@/components/forms/LoginForm";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

const SignIn = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSignedIn, isLoaded } = useAuth();
  
  const isFromInvitation = searchParams?.get('invitation') === 'true';

  useEffect(() => {
    // Wait for auth to load
    if (!isLoaded) return;
    
    if (isFromInvitation && isSignedIn) {
      router.push('/dashboard?welcome=true');
    }
  }, [isFromInvitation, isSignedIn, isLoaded, router]);

  return (
    <div className={"flex-center size-full max-sm:px-6"}>
      <LoginForm />
    </div>
  );
};

export default SignIn;
