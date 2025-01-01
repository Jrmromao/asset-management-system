"use client";
import React, { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import CustomInput from "@/components/CustomInput";
import { forgotPasswordConfirmSchema } from "@/lib/schemas";
import { FormError } from "@/components/forms/form-error";
import {
  forgetPasswordConfirmDetails,
  resendCode,
} from "@/lib/actions/user.actions";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { hideEmailAddress } from "@/lib/utils";
import { toast } from "sonner";
import useEmailStore from "@/lib/stores/emailStore";
import { revalidatePath } from "next/cache";
import HeaderIcon from "@/components/page/HeaderIcon";

const PasswordConfirmForm = () => {
  const [error, setError] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [hiddenEmail, setHiddenEmail] = useState("");
  const { email } = useEmailStore();

  useEffect(() => {
    const localHiddenEmail = hideEmailAddress(String(email));
    localHiddenEmail
      ? setHiddenEmail(localHiddenEmail)
      : router.push("/forgot-password?error=Please%20resubmit%20the%20form");
  }, []);

  const form = useForm<z.infer<typeof forgotPasswordConfirmSchema>>({
    resolver: zodResolver(forgotPasswordConfirmSchema),
    defaultValues: {
      code: "",
      email: String(email),
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const handleResend = async () => {
    await resendCode(email!)
      .then((_) => {
        toast.success("Code resent successfully", {
          position: "top-right",
        });
      })
      .catch((error) => {
        revalidatePath("/forgot-password");
      });
  };

  const onSubmit = async (
    data: z.infer<typeof forgotPasswordConfirmSchema>,
  ) => {
    startTransition(async () => {
      try {
        const result = await forgetPasswordConfirmDetails(data);

        if (result.success === true) {
          toast.message("Password reset successful, please log in!");
          router.push("/sign-in");
        } else {
          setError("Invalid code");
        }
      } catch (e) {
        console.error(e);
      }
    });
  };

  return (
    <section className={"auth-form"}>
      <header className={"flex flex-col gap-5 md:gap-8"}>
        <HeaderIcon />
        <div className={"flex flex-col gap-1 md:gap-3"}>
          <Alert className={"w-full bg-teal-50"}>
            <AlertTitle className={"mb-3"}>We send you an email</AlertTitle>
            <AlertDescription className={""}>
              Your code is on the way. To log in, enter the code we emailed to{" "}
              {hiddenEmail}. It may take a minute to arrive.
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
                {...form.register("email")}
                label={String()}
                placeholder={"Enter your email"}
                type={"hidden"}
              />

              <CustomInput
                control={form.control}
                {...form.register("code")}
                label={"Verification code"}
                placeholder={"Enter your verification code"}
                type={"text"}
                disabled={isPending}
              />

              <CustomInput
                control={form.control}
                {...form.register("newPassword")}
                label={"New Password"}
                placeholder={"Enter your new password"}
                type={"password"}
                disabled={isPending}
              />

              <CustomInput
                control={form.control}
                {...form.register("confirmNewPassword")}
                label={"Confirm Password"}
                placeholder={"Confirm your new password"}
                type={"password"}
                disabled={isPending}
              />
            </>
            <FormError message={error} />

            <div className={"flex flex-col"}>
              <Button type="submit" className={"form-btn"} disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 size={20} className={"animate-spin"} />
                    &nbsp; Loading...{" "}
                  </>
                ) : (
                  "Confirm"
                )}
              </Button>
            </div>
          </form>
        </Form>
        <Button
          className={"bg-auto bg-gray-100"}
          disabled={isPending}
          onClick={handleResend}
        >
          {isPending ? (
            <>
              <Loader2 size={20} className={"animate-spin"} />
              &nbsp; Loading...{" "}
            </>
          ) : (
            "Resend code"
          )}
        </Button>
      </>
    </section>
  );
};
export default PasswordConfirmForm;
