"use client";
import React, { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import CustomInput from "@/components/CustomInput";
import { registerSchema } from "@/lib/schemas";
import HeaderIcon from "@/components/page/HeaderIcon";
import ReCAPTCHA from "@/components/ReCAPTCHA";
import { UserContext } from "@/components/providers/UserContext";
import { useRouter } from "next/navigation";
import { createCheckoutSession } from "@/lib/actions/stripe.actions";
import { useRegistrationStore } from "@/lib/stores/useRegistrationStore";
import { useCompanyQuery } from "@/hooks/queries/useCompanyQuery";

interface RegisterFormProps {
  assetCount?: number;
}

const RegisterForm = ({ assetCount = 0 }: RegisterFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { registrationData, setRegistrationData } = useContext(UserContext);
  const { user, setUser } = useContext(UserContext);
  const router = useRouter();
  const { isCreating, createCompany } = useCompanyQuery();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      companyName: "",
      repeatPassword: "",
      recaptchaToken: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    setIsLoading(true);
    setError("");

    try {
      // 1. Create company first
      const companyResult = await createCompany({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        companyName: data.companyName,
        assetCount,
        password: data.password,
        status: "inactive",
      });

      if (!companyResult.success || !companyResult.data) {
        throw new Error(companyResult.error || "Failed to create company");
      }

      const company = companyResult.data;

      // 2. Store registration data
      useRegistrationStore.getState().setRegistrationData({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        companyName: data.companyName,
        assetCount,
        companyId: companyResult?.id,
      });

      // 3. Create Stripe session
      const session = await createCheckoutSession({
        email: data.email,
        assetCount,
        companyId: companyResult.id,
        metadata: {
          companyId: companyResult.id,
        },
      });

      if (session?.url) {
        window.location.href = session.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Registration failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // In useEffect for handling checkout
  useEffect(() => {
    const handleCheckout = async () => {
      if (registrationData) {
        try {
          setIsLoading(true);
          // Use the data from context directly
          const session = await createCheckoutSession({
            email: registrationData.email,
            assetCount: registrationData.assetCount,
          });

          if (session?.url) {
            window.location.href = session.url;
          } else {
            throw new Error("No checkout URL received");
          }
        } catch (e) {
          setError(
            e instanceof Error
              ? e.message
              : "Checkout failed. Please try again.",
          );
          setIsLoading(false);
        }
      }
    };

    handleCheckout();
  }, [registrationData]);

  return (
    <section className="auth-form">
      <header className="flex flex-col gap-5 md:gap-8">
        <HeaderIcon />
        <div className="flex flex-col gap-1 md:gap-3">
          <h1 className="text-24 lg:text-36 font-semibold text-gray-900">
            <p className="text-16 font-normal text-gray-600">
              {user ? "Link your account" : "Please enter your details"}
            </p>
          </h1>
        </div>
      </header>

      {user ? (
        <div className="flex flex-col gap-4">
          {user.firstName} {user.lastName}
        </div>
      ) : (
        <>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div>
                <CustomInput
                  label="Company Name"
                  placeholder="ex: Qlientel"
                  required
                  control={form.control}
                  {...form.register("companyName")}
                  type="text"
                />
                <div className="text-12 text-gray-500 mt-4">
                  The company name will be used as a domain for your account.
                  For example, your account might be qlientel.pdfintel.com
                </div>
              </div>

              <div className="flex gap-4">
                <CustomInput
                  label="First Name"
                  placeholder="ex: Joe"
                  required
                  control={form.control}
                  {...form.register("firstName")}
                  type="text"
                />
                <CustomInput
                  control={form.control}
                  label="Last Name"
                  required
                  {...form.register("lastName")}
                  placeholder="ex: Doe"
                  type="text"
                />
              </div>

              <CustomInput
                control={form.control}
                {...form.register("password")}
                label="Password"
                placeholder="eg: **********"
                required
                type="password"
              />

              <CustomInput
                control={form.control}
                required
                {...form.register("repeatPassword")}
                label="Repeat Password"
                placeholder="eg: **********"
                type="password"
              />

              <CustomInput
                control={form.control}
                {...form.register("email")}
                label="Email address"
                required
                placeholder="Enter your email"
                type="text"
              />

              <CustomInput
                control={form.control}
                {...form.register("phoneNumber")}
                label="Phone Number"
                required
                placeholder="Enter your phone number"
                type="text"
              />

              <div className="flex flex-col items-center gap-2">
                <ReCAPTCHA
                  siteKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                  onVerify={(token) => {
                    form.setValue("recaptchaToken", token);
                    form.clearErrors("recaptchaToken");
                  }}
                  onExpire={() => {
                    form.setValue("recaptchaToken", "");
                    form.setError("recaptchaToken", {
                      type: "manual",
                      message: "reCAPTCHA has expired, please verify again",
                    });
                  }}
                />
                {form.formState.errors.recaptchaToken && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.recaptchaToken.message}
                  </p>
                )}
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}

              <div className="flex flex-col gap-4">
                <Button
                  type="submit"
                  className="text-16 rounded-lg border bg-emerald-600 hover:bg-emerald-700 font-semibold text-white shadow-for"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      &nbsp; Loading...
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </div>
            </form>
          </Form>

          <div className="relative">
            <div
              className="absolute inset-0 flex items-center"
              aria-hidden="true"
            >
              <div className="w-full border-t border-gray-300"></div>
            </div>
          </div>
        </>
      )}

      <footer className="flex justify-center gap-1">
        <p>Already have an account?</p>
        <Link href="/sign-in" className="form-link">
          Sign In
        </Link>
      </footer>
    </section>
  );
};

export default RegisterForm;
