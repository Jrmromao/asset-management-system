"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import CustomInput from "@/components/CustomInput";
import { forgotPasswordSchema } from "@/lib/schemas";
import { FormError } from "@/components/forms/form-error";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import useEmailStore from "@/lib/stores/emailStore";
import HeaderIcon from "@/components/page/HeaderIcon";
import { useSignIn } from "@clerk/nextjs";
import { toast } from "sonner";
import z from "zod";

const ForgotPasswordForm = () => {
  const [error, setError] = useState<string>("");
  const [errorForm, setErrorForm] = useState("");
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathError = searchParams.get("error");
  const { setEmail } = useEmailStore();
  const { isLoaded, signIn } = useSignIn();

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof forgotPasswordSchema>) => {
    if (!isLoaded) return;

    setIsPending(true);
    setError("");

    try {
      const result = await signIn.create({
        strategy: "reset_password_email_code",
        identifier: data.email,
      });

      if (result.status === "needs_first_factor") {
        setEmail(data.email);
        toast.success("Password reset email sent. Please check your inbox.");
        router.push("/forgot-password/reset");
      } else {
        setError("Failed to send password reset email.");
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.message || "An unexpected error occurred.");
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    if (pathError) {
      setErrorForm(decodeURIComponent(pathError));
    } else {
      setErrorForm("");
    }
  }, [pathError]);

  return (
    <section className={"auth-form"}>
      <header className={"flex flex-col gap-5 md:gap-8"}>
        <HeaderIcon />

        <div className={"flex flex-col gap-1 md:gap-3"}>
          <Alert className={"w-full bg-teal-50"}>
            <AlertTitle className={"mb-3"}>
              Request a password reset code
            </AlertTitle>
            <AlertDescription className={""}>
              If we find an account with the email you entered, your password
              reset code is going to be sent to your email.
            </AlertDescription>
          </Alert>
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
            </>
            <FormError message={error || errorForm} />
            <div className={"flex flex-col gap-4"}>
              <Button type="submit" className={"form-btn"} disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 size={20} className={"animate-spin"} />
                    &nbsp; Loading...{" "}
                  </>
                ) : (
                  "Request code"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </>
    </section>
  );
};

export default ForgotPasswordForm;
