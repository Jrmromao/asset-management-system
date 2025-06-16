"use client";
import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import CustomInput from "@/components/CustomInput";
import { forgotPasswordConfirmSchema } from "@/lib/schemas";
import { FormError } from "@/components/forms/form-error";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import HeaderIcon from "@/components/page/HeaderIcon";

const PasswordConfirmForm = () => {
  const [error, setError] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<z.infer<typeof forgotPasswordConfirmSchema>>({
    resolver: zodResolver(forgotPasswordConfirmSchema),
    defaultValues: {
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onSubmit = async (
    data: z.infer<typeof forgotPasswordConfirmSchema>,
  ) => {
    startTransition(async () => {
      try {
        const { newPassword } = data;
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (!error) {
          toast.message("Password reset successful, please log in!");
          router.push("/sign-in");
        } else {
          setError(error.message || "Password reset failed");
        }
      } catch (e) {
        setError("Unexpected error during password reset");
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
            <AlertTitle className={"mb-3"}>Reset your password</AlertTitle>
            <AlertDescription className={""}>
              Please enter your new password below. If you did not request a
              password reset, you can ignore this message.
            </AlertDescription>
          </Alert>
        </div>
      </header>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
    </section>
  );
};
export default PasswordConfirmForm;
