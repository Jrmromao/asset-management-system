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

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string(),
    code: z.string().min(6, { message: "Reset code must be 6 characters." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export default function ResetPasswordPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
      code: "",
    },
  });

  async function onSubmit(data: z.infer<typeof resetPasswordSchema>) {
    if (!isLoaded) return;

    setIsPending(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: data.code,
        password: data.password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success("Password has been reset successfully.");
        router.push("/");
      } else {
        console.log(result);
        toast.error("Failed to reset password. The code may be invalid.");
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      toast.error(err.errors?.[0]?.message || "An unexpected error occurred.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <section className="auth-form">
      <header className="flex flex-col gap-5 md:gap-8">
        <HeaderIcon />
        <div className="flex flex-col gap-1 md:gap-3">
          <h1 className="text-24 lg:text-36 font-semibold text-gray-900">
            Reset Your Password
            <p className="text-16 font-normal text-gray-600">
              Enter the 6-digit code and your new password.
            </p>
          </h1>
        </div>
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <CustomInput
            control={form.control}
            name="code"
            label="Reset Code"
            placeholder="123456"
            type="text"
            disabled={isPending}
          />
          <CustomInput
            control={form.control}
            name="password"
            label="New Password"
            placeholder="********"
            type="password"
            disabled={isPending}
          />
          <CustomInput
            control={form.control}
            name="confirmPassword"
            label="Confirm New Password"
            placeholder="********"
            type="password"
            disabled={isPending}
          />
          <div className="flex flex-col gap-4">
            <Button type="submit" className="form-btn" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  &nbsp; Resetting...
                </>
              ) : (
                "Reset Password"
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
