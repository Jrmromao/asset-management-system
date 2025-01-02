"use client";
import React, { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
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
import { login } from "@/lib/actions/user.actions";
import { signIn } from "next-auth/react";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import ReCAPTCHA from "@/components/ReCAPTCHA";
import HeaderIcon from "@/components/page/HeaderIcon";

const AuthForm = () => {
  const [error, setError] = useState<string>("");
  const [user, setUser] = useState(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const router = useRouter();
  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    if (!recaptchaToken) {
      setError("Please complete the captcha");
      return;
    }

    startTransition(async () => {
      try {
        const response = await login(data);

        if (response?.error) {
          setError(response.error);
        } else {
          router.push(DEFAULT_LOGIN_REDIRECT);
        }
      } catch (e) {
        console.error(e);
      }
    });
  };

  const handleVerify = (token: string) => {
    setRecaptchaToken(token);
    setError(""); // Clear any existing errors
  };

  const handleSocialLogin = async (provider: "github" | "google") => {
    await signIn(provider, { callbackUrl: DEFAULT_LOGIN_REDIRECT });
  };
  return (
    <section className={"auth-form"}>
      <header className={"flex flex-col gap-5 md:gap-8"}>
        <HeaderIcon />

        <div className={"flex flex-col gap-1 md:gap-3"}>
          <h1 className={"text-24 lg:text-36 font-semibold text-gray-900"}>
            {/*{user ? 'Link Account' : type === 'sign-in' ? 'Sign In' : 'Sign Up'}*/}
            <p className={"text-16 font-normal text-gray-600"}>
              {user ? "Link your account" : "Please enter your details"}
            </p>
          </h1>
        </div>
      </header>
      {user ? (
        <div className={"flex flex-col gap-4"}>Joao Filipe Romão</div>
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
            <CustomButton
              className={
                "bg-white border border-gray-300 rounded-md py-2 px-4 flex items-center hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-black-1 w-full"
              }
              size="lg"
              variant="outline"
              action={() => handleSocialLogin("google")}
              value="Sign In with Google"
              Icon={FaGoogle}
              disabled={isPending}
            />
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
