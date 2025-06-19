"use client";
import React, { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import CustomButton from "@/components/CustomButton";
import { FaGoogle } from "react-icons/fa";
import CustomInput from "@/components/CustomInput";
import { loginSchema } from "@/lib/schemas";
import { FormError } from "@/components/forms/form-error";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import ReCAPTCHA from "@/components/ReCAPTCHA";
import HeaderIcon from "@/components/page/HeaderIcon";

const AuthForm = () => {
  const [error, setError] = useState<string>("");
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl");
  const validCallbackUrl =
    callbackUrl && callbackUrl.startsWith("/")
      ? callbackUrl
      : DEFAULT_LOGIN_REDIRECT;

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    console.log("[Login] Form submitted", { email: data.email });
    if (!recaptchaToken) {
      setError("Please complete the captcha");
      console.warn("[Login] Submission blocked: missing recaptcha");
      return;
    }

    setError("");
    startTransition(async () => {
      try {
        console.log("[Login] Sending login request to /api/auth/login");
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
          }),
        });

        const result = await response.json();
        console.log("[Login] API response", result);

        if (!response.ok) {
          setError(result.error || "Invalid email or password");
          console.warn("[Login] Login failed", result.error);
        } else {
          console.log(
            "[Login] Login successful, redirecting to",
            validCallbackUrl,
          );
          router.push(validCallbackUrl);
        }
      } catch (e) {
        setError("Unexpected error during login");
        console.error("[Login] Unexpected error", e);
      }
    });
  };

  return (
    <section className={"auth-form"}>
      <header className={"flex flex-col gap-5 md:gap-8"}>
        <HeaderIcon />

        <div className={"flex flex-col gap-1 md:gap-3"}>
          <h1 className={"text-24 lg:text-36 font-semibold text-gray-900"}>
            Sign In
            <p className={"text-16 font-normal text-gray-600"}>
              {user ? "Link your account" : "Please enter your details"}
            </p>
          </h1>
        </div>
      </header>
      {user ? (
        <div className={"flex flex-col gap-4"}>Joao Filipe Romão</div>
      ) : (
        <>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <>
                <CustomInput
                  control={form.control}
                  {...form.register("email")}
                  label={"Email"}
                  placeholder={"Enter your email"}
                  type={"email"}
                  disabled={isPending}
                />
                <CustomInput
                  control={form.control}
                  {...form.register("password")}
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
              <ReCAPTCHA
                siteKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                onVerify={(token) => {
                  setRecaptchaToken(token);
                  setError("");
                }}
                onExpire={() => {
                  setRecaptchaToken(""); // Clear the token when expired
                  setError("ReCAPTCHA has expired. Please verify again.");
                }}
              />
              <FormError message={error} />
              <div className={"flex flex-col gap-4"}>
                <Button
                  type="submit"
                  className={"form-btn"}
                  disabled={isPending}
                >
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
      )}
    </section>
  );
};
export default AuthForm;
