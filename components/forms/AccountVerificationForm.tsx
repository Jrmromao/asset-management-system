"use client";
import React, { useContext, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import CustomInput from "@/components/CustomInput";
import { accountVerificationSchema } from "@/lib/schemas";
import { FormError } from "@/components/forms/form-error";
import { resendCode, verifyAccount } from "@/lib/actions/user.actions";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import HeaderIcon from "@/components/page/HeaderIcon";
import { UserContext } from "@/components/providers/UserContext";
import { useRegistrationStore } from "@/lib/stores/useRegistrationStore";

const AuthForm = () => {
  const [error, setError] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [companyCreated, setCompanyCreated] = useState(false);
  const router = useRouter();
  const { user } = useContext(UserContext);
  const { registrationData, clearRegistrationData } = useRegistrationStore();

  const email = user?.email || registrationData?.email;

  const form = useForm<z.infer<typeof accountVerificationSchema>>({
    resolver: zodResolver(accountVerificationSchema),
    defaultValues: {
      code: "",
      email: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof accountVerificationSchema>) => {
    startTransition(async () => {
      try {
        // Only verify the account since company is already created
        await verifyAccount(data);
        form.reset();
        router.push("/sign-in");
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Verification failed. Please try again.");
        }
      }
    });
  };

  const handleResendCode = async () => {
    if (!email) {
      setError("Email is required to resend code");
      return;
    }

    try {
      setIsLoading(true);
      await resendCode(email);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to resend code. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!companyCreated && error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Setup Failed</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // if (!registrationData && !email) {
  //   return (
  //     <section className="auth-form">
  //       <header className="flex flex-col gap-5 md:gap-8">
  //         <HeaderIcon />
  //         <Alert className="w-full bg-red-50">
  //           <AlertTitle className="mb-3">Missing Registration Data</AlertTitle>
  //           <AlertDescription>
  //             Please complete the registration process first.
  //           </AlertDescription>
  //           <AlertDialogFooter>
  //             <Button
  //               type="button"
  //               className="bg-auto bg-gray-100"
  //               onClick={() => router.push("/sign-up")}
  //             >
  //               Sign up
  //             </Button>
  //           </AlertDialogFooter>
  //         </Alert>
  //       </header>
  //     </section>
  //   );
  // }

  return (
    <section className="auth-form">
      <header className="flex flex-col gap-5 md:gap-8">
        <HeaderIcon />
        <div className="flex flex-col gap-1 md:gap-3">
          <Alert className="w-full bg-teal-50">
            <AlertTitle className="mb-3">We sent you an email</AlertTitle>
            <AlertDescription>
              Your code is on the way. To log in, enter the code we emailed to{" "}
              {email}. It may take a minute to arrive.
            </AlertDescription>
          </Alert>
        </div>
      </header>

      {user ? (
        <div className="flex flex-col gap-4">
          {user.firstName} {user.lastName}
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <CustomInput
              control={form.control}
              {...form.register("email")}
              label="Email"
              placeholder="Enter your email"
              type="email"
              disabled={isPending || !!email}
            />

            <CustomInput
              control={form.control}
              {...form.register("code")}
              label="Verification code"
              placeholder="Enter your verification code"
              type="text"
              disabled={isPending}
            />

            <FormError message={error} />

            <div className="flex flex-col gap-4">
              <Button type="submit" className="form-btn" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    &nbsp; Loading...
                  </>
                ) : (
                  "Confirm"
                )}
              </Button>

              <Button
                type="button"
                className="bg-auto bg-gray-100"
                disabled={isPending || isLoading}
                onClick={handleResendCode}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    &nbsp; Loading...
                  </>
                ) : (
                  "Resend code"
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </section>
  );
};

export default AuthForm;
