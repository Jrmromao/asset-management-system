"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import CustomInput from "@/components/CustomInput";
import { loginSchema } from "@/lib/schemas";
import { FormError } from "@/components/forms/form-error";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import HeaderIcon from "@/components/page/HeaderIcon";
import { useSignIn } from "@clerk/nextjs";

const AuthForm = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [error, setError] = useState<string>("");
  const searchParams = useSearchParams();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    if (!isLoaded) {
      return;
    }

    setIsPending(true);
    setError("");

    try {
      const result = await signIn.create({
        identifier: data.email,
        password: data.password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
      } else {
        console.log(result);
        setError("Invalid email or password");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "An unexpected error occurred.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <section className={"auth-form"}>
      <header className={"flex flex-col gap-5 md:gap-8"}>
        <HeaderIcon />

        <div className={"flex flex-col gap-1 md:gap-3"}>
          <h1 className={"text-24 lg:text-36 font-semibold text-gray-900"}>
            Sign In
            <p className={"text-16 font-normal text-gray-600"}>
              Please enter your details
            </p>
          </h1>
        </div>
      </header>
      <>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <>
              <CustomInput
                control={form.control}
                name="email"
                label={"Email"}
                placeholder={"Enter your email"}
                type={"email"}
                disabled={isPending}
              />
              <CustomInput
                control={form.control}
                name="password"
                label={"Password"}
                disabled={isPending}
                placeholder={"Password"}
                type={"password"}
              />

              <Link
                href={"/forgot-password"}
                className={"text-12 text-gray-500"}
              >
                Forgot Password
              </Link>
            </>
            <FormError message={error} />
            <div className={"flex flex-col gap-4"}>
              <Button type="submit" className={"form-btn"} disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 size={20} className={"animate-spin"} />
                    &nbsp; Loading...{" "}
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </div>
          </form>
        </Form>

        <>
          <div className="relative">
            <div
              className="absolute inset-0 flex items-center"
              aria-hidden="true"
            >
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">OR</span>
            </div>
          </div>
        </>
        <footer className={"flex justify-center gap-1"}>
          <p>{"Don't have an account?"}</p>
          <Link href={"/sign-up"} className={"form-link"}>
            Register
          </Link>
        </footer>
      </>
    </section>
  );
};
export default AuthForm;
