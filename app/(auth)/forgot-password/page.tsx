"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSignIn, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import HeaderIcon from "@/components/page/HeaderIcon";
import CustomInput from "@/components/CustomInput";

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export default function ForgotPasswordPage() {
  const { isLoaded, signIn } = useSignIn();
  const { isSignedIn, signOut } = useAuth();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // Handle the case when user is already signed in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      toast.info(
        "You're already signed in. Please sign out first to reset your password.",
      );
    }
  }, [isLoaded, isSignedIn]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      toast.success(
        "Signed out successfully. You can now reset your password.",
      );
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  };

  async function onSubmit(data: z.infer<typeof forgotPasswordSchema>) {
    if (!isLoaded) return;

    // If user is signed in, prevent password reset
    if (isSignedIn) {
      toast.error("Please sign out first to reset your password.");
      return;
    }

    setIsPending(true);
    try {
      const result = await signIn.create({
        strategy: "reset_password_email_code",
        identifier: data.email,
      });

      if (result.status === "needs_first_factor") {
        toast.success("Password reset email sent. Please check your inbox.");
        router.push("/forgot-password/reset");
      } else {
        console.log(result);
        toast.error("Failed to send password reset email.");
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));

      // Handle specific Clerk errors
      if (err.errors?.[0]?.code === "session_exists") {
        toast.error(
          "You're already signed in. Please sign out first to reset your password.",
        );
      } else {
        toast.error(
          err.errors?.[0]?.message || "An unexpected error occurred.",
        );
      }
    } finally {
      setIsPending(false);
    }
  }

  // Show different UI when user is signed in
  if (isLoaded && isSignedIn) {
    return (
      <section className="auth-form">
        <header className="flex flex-col gap-5 md:gap-8">
          <HeaderIcon />
          <div className="flex flex-col gap-1 md:gap-3">
            <h1 className="text-24 lg:text-36 font-semibold text-gray-900">
              Already Signed In
              <p className="text-16 font-normal text-gray-600">
                You need to sign out first to reset your password.
              </p>
            </h1>
          </div>
        </header>

        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              To reset your password, you must first sign out of your current
              session.
            </p>
            <Button
              onClick={handleSignOut}
              className="form-btn"
              disabled={isSigningOut}
            >
              {isSigningOut ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  &nbsp; Signing Out...
                </>
              ) : (
                "Sign Out"
              )}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-gray-600 mb-2">Or</p>
            <Link href="/dashboard" className="form-link">
              Go to Dashboard
            </Link>
          </div>
        </div>

        <footer className="flex justify-center gap-1">
          <p className="text-16 font-normal text-gray-600">
            Remember your password?
          </p>
          <Link href="/sign-in" className="form-link">
            Sign In
          </Link>
        </footer>
      </section>
    );
  }

  return (
    <section className="auth-form">
      <header className="flex flex-col gap-5 md:gap-8">
        <HeaderIcon />
        <div className="flex flex-col gap-1 md:gap-3">
          <h1 className="text-24 lg:text-36 font-semibold text-gray-900">
            Forgot Password
            <p className="text-16 font-normal text-gray-600">
              Enter your email to receive a password reset code.
            </p>
          </h1>
        </div>
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <CustomInput
            control={form.control}
            name="email"
            label="Email Address"
            placeholder="you@example.com"
            type="email"
            disabled={isPending}
          />
          <div className="flex flex-col gap-4">
            <Button type="submit" className="form-btn" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  &nbsp; Sending...
                </>
              ) : (
                "Send Reset Code"
              )}
            </Button>
          </div>
        </form>
      </Form>

      <footer className="flex justify-center gap-1">
        <p className="text-16 font-normal text-gray-600">
          Remember your password?
        </p>
        <Link href="/sign-in" className="form-link">
          Sign In
        </Link>
      </footer>
    </section>
  );
}
