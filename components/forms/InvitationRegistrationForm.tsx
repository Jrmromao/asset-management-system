"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSignUp } from "@clerk/nextjs";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import CustomInput from "@/components/CustomInput";
import { completeInvitationRegistration } from "@/lib/actions/invitation.actions";

const registrationSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    phone: z.string().optional(),
    title: z.string().optional(),
    employeeId: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegistrationFormValues = z.infer<typeof registrationSchema>;

interface InvitationRegistrationFormProps {
  invitationData: {
    email: string;
    companyId: string;
    roleId: string;
    companyName: string;
    roleName: string;
    invitationId: string;
  };
  token: string;
}

export function InvitationRegistrationForm({
  invitationData,
  token,
}: InvitationRegistrationFormProps) {
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const { signUp, setActive } = useSignUp();

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      title: "",
      employeeId: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegistrationFormValues) => {
    if (!signUp) return;

    startTransition(async () => {
      try {
        // Clerk expects only these fields for sign up. Do NOT send firstName/lastName here!
        const clerkPayload = {
          emailAddress: invitationData.email,
          password: data.password,
        };
        const allowedKeys = ["emailAddress", "password"];
        Object.keys(clerkPayload).forEach((key) => {
          if (!allowedKeys.includes(key)) {
            throw new Error(`Unexpected field in Clerk payload: ${key}`);
          }
        });
        console.log("Clerk payload (signUp.create):", clerkPayload);
        const signUpAttempt = await signUp.create(clerkPayload);
        console.log("Clerk signUp.create result:", signUpAttempt);

        // After sign up, update firstName and lastName if possible
        if (signUpAttempt.status === "complete") {
          if (signUpAttempt.createdUserId) {
            try {
              await fetch("/api/clerk-update-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  userId: signUpAttempt.createdUserId,
                  firstName: data.firstName,
                  lastName: data.lastName,
                }),
              });
              console.log("Clerk user updated with firstName and lastName");
            } catch (updateError) {
              console.error(
                "Failed to update Clerk user with name fields:",
                updateError,
              );
            }
          }
          console.log("Calling completeInvitationRegistration with:", {
            clerkUserId: signUpAttempt.createdUserId,
            invitationId: invitationData.invitationId,
            userData: {
              firstName: data.firstName,
              lastName: data.lastName,
              phone: data.phone,
              title: data.title,
              employeeId: data.employeeId,
              email: invitationData.email,
              roleId: invitationData.roleId,
              companyId: invitationData.companyId,
            },
            token,
          });
          const registrationResult = await completeInvitationRegistration({
            clerkUserId: signUpAttempt.createdUserId!,
            invitationId: invitationData.invitationId,
            userData: {
              firstName: data.firstName,
              lastName: data.lastName,
              phone: data.phone,
              title: data.title,
              employeeId: data.employeeId,
              email: invitationData.email,
              roleId: invitationData.roleId,
              companyId: invitationData.companyId,
            },
            token,
          });
          console.log(
            "completeInvitationRegistration result:",
            registrationResult,
          );

          if (registrationResult.success) {
            await setActive({ session: signUpAttempt.createdSessionId });
            toast.success("Registration completed successfully!");
            window.location.href = "/dashboard";
          } else {
            toast.error(
              registrationResult.error || "Failed to complete registration",
            );
          }
        } else {
          toast.error("Please verify your email address");
        }
      } catch (error: any) {
        console.error("Registration error:", error);
        const message =
          error?.errors?.[0]?.message ||
          error?.message ||
          (typeof error === "string" ? error : null) ||
          "Registration failed";
        toast.error(message);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <CustomInput
              name="firstName"
              label="First Name"
              control={form.control}
              required
              disabled={isPending}
            />
            <CustomInput
              name="lastName"
              label="Last Name"
              control={form.control}
              required
              disabled={isPending}
            />
          </div>

          <CustomInput
            name="phone"
            label="Phone Number"
            control={form.control}
            type="tel"
            disabled={isPending}
          />

          <CustomInput
            name="title"
            label="Job Title"
            control={form.control}
            disabled={isPending}
          />

          <CustomInput
            name="employeeId"
            label="Employee ID"
            control={form.control}
            disabled={isPending}
          />

          <div className="grid grid-cols-2 gap-4">
            <CustomInput
              name="password"
              label="Password"
              control={form.control}
              type="password"
              required
              disabled={isPending}
            />
            <CustomInput
              name="confirmPassword"
              label="Confirm Password"
              control={form.control}
              type="password"
              required
              disabled={isPending}
            />
          </div>
        </div>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Creating Account..." : "Complete Registration"}
        </Button>
      </form>
    </Form>
  );
}
