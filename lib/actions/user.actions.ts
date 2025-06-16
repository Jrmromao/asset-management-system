"use server";

import { Prisma, User as PrismaUser, UserStatus } from "@prisma/client"; // Assuming User is your Prisma model
import { parseStringify, validateEmail } from "@/lib/utils";
// SUPABASE_ADAPTED: Remove Cognito service imports
// import {
//   forgetPasswordConfirm,
//   forgetPasswordRequestCode,
//   signUpUser,
//   verifyCognitoAccount,
// } from "@/services/aws/Cognito";
import {
  accountVerificationSchema,
  forgotPasswordConfirmSchema,
  forgotPasswordSchema,
  loginSchema,
  userSchema,
} from "@/lib/schemas"; // Assuming these are Zod schemas
import { revalidatePath } from "next/cache";
import { getRoleById } from "@/lib/actions/role.actions";
import { z } from "zod";
import { prisma } from "@/app/db";
import { supabase } from "@/lib/supabaseClient"; // Your client-side capable Supabase client
import { createClient } from "@supabase/supabase-js";
import type { User as SupabaseUserType } from "@supabase/supabase-js";
// import type { AuthError as SupabaseAuthError, User as SupabaseUserType } from "@supabase/supabase-js";
// You might need a server-side Supabase client for admin tasks if not passing tokens
// import { createClient } from '@supabase/supabase-js';
// const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// Define your ActionResponse if not already globally typed
interface ActionResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
}

// Define RegUser based on your needs, example:
interface RegUser {
  email: string;
  password?: string; // Password might not always be present if created by admin
  firstName: string;
  lastName: string;
  title?: string;
  employeeId?: string;
  roleId: string;
  companyId: string;
  // oauthId?: string; // This will be the Supabase User ID
}

// Utility for standardized error responses
function actionError(message: string): ActionResponse<any> {
  return { error: message };
}

// Utility for extracting user metadata safely
function extractUserMetadata(user: any) {
  return {
    firstName: user?.user_metadata?.firstName || "",
    lastName: user?.user_metadata?.lastName || "",
    name: user?.user_metadata?.name || user?.email || "",
  };
}

// Shared user creation logic (Prisma)
async function createPrismaUser({
  data,
  supabaseUserId,
  tx,
}: {
  data: RegUser;
  supabaseUserId?: string;
  tx?: Prisma.TransactionClient;
}): Promise<PrismaUser> {
  if (!data.roleId) throw new Error("Role ID is required");
  const prismaClient = tx || prisma;
  return await prismaClient.user.create({
    data: {
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      firstName: String(data.firstName),
      lastName: String(data.lastName),
      employeeId: data.employeeId,
      title: data.title,
      oauthId: supabaseUserId,
      roleId: data.roleId,
      companyId: data.companyId,
      emailVerified: supabaseUserId ? null : new Date(),
    },
  });
}

export async function login(
  values: z.infer<typeof loginSchema>,
): Promise<ActionResponse<void>> {
  try {
    // Validate the input data
    const validation = loginSchema.safeParse(values);
    if (!validation.success) {
      console.error("Login validation failed:", validation.error);
      return { error: "Invalid email or password" };
    }

    const { email, password } = validation.data;
    console.log("USER.LOGIN::34 (Supabase) ", { email });

    // 1. Sign in with Supabase directly
    const { data: supabaseLoginData, error: supabaseLoginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (supabaseLoginError || !supabaseLoginData.session) {
      console.error(
        "Supabase direct login error:",
        supabaseLoginError?.message,
      );
      return { error: "Invalid email or password" };
    }

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Login failed due to an unexpected error." };
  }
}

export async function createUser(
  values: z.infer<typeof userSchema> & { companyId: string }, // Require companyId from caller
): Promise<ActionResponse<PrismaUser>> {
  try {
    const validation = userSchema.parse(values);
    // companyId is not in userSchema, so require it from values
    if (!values.companyId) {
      return actionError("Company information missing");
    }
    const role = await getRoleById(validation.roleId);
    if (!role?.data) {
      return actionError("Role not found");
    }
    const roleName = role.data.name;
    const userToRegister: RegUser = {
      roleId: validation.roleId,
      email: validation.email!,
      password: process.env.DEFAULT_PASSWORD!,
      firstName: validation.firstName,
      lastName: validation.lastName,
      title: validation.title,
      employeeId: validation.employeeId,
      companyId: values.companyId, // Use from values
    };
    let createdPrismaUser: PrismaUser;
    if (roleName === "Lonee") {
      createdPrismaUser = await createPrismaUser({ data: userToRegister });
    } else {
      // Use a transaction for atomicity
      const result = await prisma.$transaction(async (tx) => {
        // 1. Register in Supabase
        const { data: supabaseSignUpData, error: supabaseSignUpError } =
          await supabase.auth.signUp({
            email: userToRegister.email,
            password: userToRegister.password!,
            options: {
              data: {
                firstName: userToRegister.firstName,
                lastName: userToRegister.lastName,
                companyId: userToRegister.companyId,
                role: roleName,
              },
            },
          });
        if (supabaseSignUpError || !supabaseSignUpData.user) {
          throw new Error(
            supabaseSignUpError?.message || "Supabase registration failed",
          );
        }
        // 2. Create in Prisma
        const prismaUser = await createPrismaUser({
          data: userToRegister,
          supabaseUserId: supabaseSignUpData.user.id,
          tx,
        });
        return prismaUser;
      });
      createdPrismaUser = result;
    }
    return { success: true, data: parseStringify(createdPrismaUser) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return actionError(error.message);
    }
    console.error("Create user error:", error);
    return actionError("User creation failed due to an unexpected error.");
  }
}

// SUPABASE_ADAPTED: resendCode for what? Email verification or Password Reset?
// Assuming for Email Verification (Supabase handles resending confirmation emails)
export async function resendVerificationEmail(
  email: string,
): Promise<ActionResponse<void>> {
  try {
    if (!validateEmail(email)) {
      return { error: "Invalid email address" };
    }

    // Optional: Check if user exists in your Prisma DB first, though Supabase will error if not found.
    // const user = await findByEmail(email);
    // if (!user.data) { // findByEmail returns ActionResponse
    //   return { error: "Your account does not exist in our system." };
    // }

    const { error: resendError } = await supabase.auth.resend({
      type: "signup", // Or other types like 'email_change'
      email: email,
    });

    if (resendError) {
      console.error("Supabase resend verification error:", resendError.message);
      return {
        error: `Failed to resend verification email: ${resendError.message}`,
      };
    }

    return { success: true, data: undefined }; // `data` might not be needed for void
  } catch (error) {
    console.error("Resend verification email unexpected error:", error);
    return {
      success: false,
      error: "Failed to resend verification email due to an unexpected error.",
    };
  }
}

// SUPABASE_ADAPTED: forgotPassword
export async function forgotPassword(
  values: z.infer<typeof forgotPasswordSchema>,
): Promise<ActionResponse<void>> {
  try {
    const validation = forgotPasswordSchema.safeParse(values);
    if (!validation.success) {
      // Zod errors can be formatted for better UX
      return { error: "Invalid email address." };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(
      validation.data.email,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/forgot-password/confirm`,
      },
    );

    if (error) {
      console.error("Supabase resetPasswordForEmail error:", error.message);
      // Don't reveal if email exists or not for security, typically.
      // But Supabase might return specific errors you want to handle or log.
      return {
        error:
          "If an account with this email exists, a password reset link has been sent.",
      }; // Or a more generic error
    }

    return { success: true };
  } catch (error) {
    console.error("Forgot password unexpected error:", error);
    return {
      error:
        "Failed to process forgot password request due to an unexpected error.",
    };
  }
}

// SUPABASE_ADAPTED: Password Reset Confirmation (code-based, for unauthenticated users)
// NOTE: Supabase password reset is handled client-side. After the user clicks the reset link in their email, they are authenticated and can call:
// await supabase.auth.updateUser({ password: newPassword });
// directly from the client. No server action is needed for this step.

// SUPABASE_ADAPTED: verifyAccount (Email Verification)
// Supabase email verification links usually contain a `token` and `type=signup`.
// When the user clicks, they land on a redirect URL you specified in Supabase settings.
// Your page at that URL should handle this.
export async function verifyAccount(
  values: z.infer<typeof accountVerificationSchema> & { token: string }, // Add token
): Promise<ActionResponse<void>> {
  try {
    // The schema now needs to include the token from the verification link.
    // `email` might also be passed for redundancy or if token isn't self-contained for email.
    const validation = accountVerificationSchema
      .extend({ token: z.string() })
      .safeParse(values);
    if (!validation.success) {
      return { error: "Invalid email, code, or token" };
    }

    const { email, token } = validation.data;

    // Verify with Supabase
    const { data: verifyData, error: verifyError } =
      await supabase.auth.verifyOtp({
        type: "signup", // Or 'email_change', etc.
        email: email,
        token: token, // Use the token from the URL
      });

    if (verifyError || !verifyData.user) {
      // verifyOtp returns user and session on success
      console.error("Supabase verifyOtp error:", verifyError?.message);
      return {
        error: `Account verification failed: ${verifyError?.message || "Invalid token or email."}`,
      };
    }

    // If Supabase verification is successful, update your Prisma DB
    await prisma.user.update({
      where: { email }, // Or preferably where: { oauthId: verifyData.user.id } if email can change
      data: { emailVerified: new Date() },
    });

    return { success: true };
  } catch (error) {
    console.error("Verify account unexpected error:", error);
    // Check for Prisma errors specifically if needed
    return {
      error: "Account could not be verified due to an unexpected error.",
    };
  }
}

export async function updateUserNonAuthDetails(
  id: string, // This is Prisma User ID
  data: Partial<
    Pick<
      PrismaUser,
      "firstName" | "lastName" | "roleId" | "title" | "employeeId"
    >
  >, // Only non-auth fields
): Promise<ActionResponse<PrismaUser>> {
  try {
    // Optional: If 'id' is Supabase ID, fetch Prisma user by oauthId first.
    // But your current code uses Prisma 'id'.
    const userToUpdate = await prisma.user.findUnique({ where: { id } });
    if (!userToUpdate) {
      return { error: "User not found." };
    }
    const updatedUser = await prisma.user.update({
      where: {
        id,
      },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        roleId: data.roleId,
        title: data.title,
        employeeId: data.employeeId,
        // DO NOT update email here directly without Supabase flow
      },
    });
    revalidatePath("/users");
    revalidatePath(`/users/${id}`);
    return { success: true, data: parseStringify(updatedUser) };
  } catch (error) {
    // Handle Prisma errors like P2002 if you made other fields unique
    console.error("Update user error:", error);
    return { error: "Failed to update user" };
  }
}
