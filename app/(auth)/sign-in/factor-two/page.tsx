"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSignIn } from "@clerk/nextjs";
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

const factorTwoSchema = z.object({
  code: z.string().min(6, { message: "Verification code must be 6 digits." }),
});

export default function FactorTwoPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<z.infer<typeof factorTwoSchema>>({
    resolver: zodResolver(factorTwoSchema),
    defaultValues: {
      code: "",
    },
  });

  async function onSubmit(data: z.infer<typeof factorTwoSchema>) {
    if (!isLoaded) return;

    setIsPending(true);
    try {
      const result = await signIn.attemptSecondFactor({
        strategy: "totp",
        code: data.code,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success("Successfully signed in!");
        router.push("/");
      } else {
        console.log(result);
        toast.error("Invalid verification code. Please try again.");
      }
    } catch (err: any) {
      console.error("Error:", JSON.stringify(err, null, 2));
      toast.error(err.errors?.[0]?.message || "An unexpected error occurred.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <section className="auth-form flex-center size-full max-sm:px-6">
      <header className="flex flex-col gap-5 md:gap-8">
        <HeaderIcon />
        <div className="flex flex-col gap-1 md:gap-3">
          <h1 className="text-24 lg:text-36 font-semibold text-gray-900">
            Two-Factor Authentication
            <p className="text-16 font-normal text-gray-600">
              Enter the code from your authenticator app.
            </p>
          </h1>
        </div>
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <CustomInput
            control={form.control}
            name="code"
            label="Verification Code"
            placeholder="123456"
            type="text"
            disabled={isPending}
          />
          <div className="flex flex-col gap-4">
            <Button type="submit" className="form-btn" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  &nbsp; Verifying...
                </>
              ) : (
                "Verify"
              )}
            </Button>
          </div>
        </form>
      </Form>

      <footer className="flex justify-center gap-1">
        <p className="text-16 font-normal text-gray-600">Not your account?</p>
        <Link href="/sign-in" className="form-link">
          Back to Sign In
        </Link>
      </footer>
    </section>
  );
}
