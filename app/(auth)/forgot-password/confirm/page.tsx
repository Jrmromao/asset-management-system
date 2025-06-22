"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const ConfirmPasswordReset = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (isLoaded && !isSignedIn) {
      toast.error(
        "Authentication session missing. Please use the reset link from your email.",
      );
      router.replace("/forgot-password");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="flex-center size-full max-sm:px-6">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex-center size-full max-sm:px-6">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-semibold mb-4">
          Password Reset Successful
        </h1>
        <p className="text-gray-600 mb-6">
          Your password has been successfully reset. You can now sign in with
          your new password.
        </p>
        <Button onClick={() => router.push("/sign-in")} className="form-btn">
          Sign In
        </Button>
      </div>
    </div>
  );
};

export default ConfirmPasswordReset;
