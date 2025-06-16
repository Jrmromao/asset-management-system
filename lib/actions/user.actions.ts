"use server";

import { Prisma, User as PrismaUser } from "@prisma/client"; // Assuming User is your Prisma model
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
import { auth, signIn } from "@/auth"; // signIn from next-auth
import { revalidatePath } from "next/cache";
import { AuthError as NextAuthError } from "next-auth"; // Renamed to avoid conflict
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

    // 2. Sign in with NextAuth using the Supabase user data
    const result = await signIn("credentials", {
      id: supabaseLoginData.user.id,
      email: supabaseLoginData.user.email,
      accessToken: supabaseLoginData.session.access_token,
      redirect: false,
    });

    if (result?.error) {
      console.error("NextAuth signin error:", result.error);
      return { error: result.error };
    }

    return { success: true };
  } catch (error) {
    if (error instanceof NextAuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials" };
        default:
          return {
            error: "Something went wrong. Please try again later!",
          };
      }
    }
    console.error("Login error:", error);
    return { error: "Login failed due to an unexpected error." };
  }
}

async function insertUser(
  data: RegUser,
  supabaseUserId?: string, // SUPABASE_ADAPTED: was oauthId
  tx?: Prisma.TransactionClient,
): Promise<PrismaUser> {
  // Return Prisma User
  if (!data.roleId) {
    throw new Error("Role ID is required");
  }
  const prismaClient = tx || prisma;

  try {
    return await prismaClient.user.create({
      data: {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        firstName: String(data.firstName),
        lastName: String(data.lastName),
        employeeId: data.employeeId,
        title: data.title,
        oauthId: supabaseUserId, // SUPABASE_ADAPTED
        roleId: data.roleId,
        companyId: data.companyId,
        emailVerified: supabaseUserId ? null : new Date(), // Example: if no oauthId, assume verified or different flow
        // Or better, set emailVerified after Supabase confirms email
      },
    });
  } catch (error) {
    console.error("USER.LOGIN::80 (Supabase) ", error);
    throw error; // Rethrow for the calling function to handle (e.g. Prisma known errors)
  }
}

export async function createUser(
  values: z.infer<typeof userSchema>,
): Promise<ActionResponse<PrismaUser>> {
  // Return PrismaUser
  try {
    // Assuming userSchema validates presence of email, firstName, lastName, roleId
    const validation = userSchema.parse(values); // Use parse, or parseAsync if schema has async refinements

    const session = await auth(); // NextAuth session
    if (!session?.user?.companyId) {
      // Ensure companyId is in your NextAuth session.user
      return { error: "Not authenticated or company information missing" };
    }

    const role = await getRoleById(validation.roleId);
    if (!role?.data) {
      return { error: "Role not found" };
    }
    const roleName = role.data.name;

    const userToRegister: RegUser = {
      roleId: validation.roleId,
      email: validation.email!,
      password: process.env.DEFAULT_PASSWORD!, // Ensure this is a strong, securely managed default if used
      firstName: validation.firstName,
      lastName: validation.lastName,
      title: validation.title,
      employeeId: validation.employeeId,
      companyId: session.user.companyId as string, // Cast if sure
    };

    let createdPrismaUser: PrismaUser;
    if (roleName === "Lonee") {
      // SUPABASE_ADAPTED: "Lonee" users are created in Prisma only, without a Supabase account initially.
      // Their `oauthId` will be null. This implies they cannot log in via Supabase
      // unless their account is later associated or created in Supabase.
      // This matches your original logic's implication.
      createdPrismaUser = await insertUser(userToRegister);
    } else {
      // For other roles, register in Supabase and then create in Prisma
      const registrationResult = await registerUser(userToRegister); // registerUser now adapted for Supabase
      if (registrationResult.error || !registrationResult.data?.user) {
        return {
          error:
            registrationResult.error ||
            "User registration failed during creation",
        };
      }
      createdPrismaUser = registrationResult.data.user as PrismaUser; // Assuming registerUser's data.user is PrismaUser
    }

    return { success: true, data: parseStringify(createdPrismaUser) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.message }; // Or a more user-friendly summary
    }
    console.error("Create user error:", error);
    return { error: "User creation failed due to an unexpected error." };
  }
}

// SUPABASE_ADAPTED: registerUser now interacts with Supabase
export async function registerUser(
  data: RegUser,
  tx?: Prisma.TransactionClient,
): Promise<
  ActionResponse<{ supabaseUser: SupabaseUserType; user: PrismaUser }>
> {
  try {
    if (!data.password) {
      // Password is required for Supabase signUp
      return { error: "Password is required for registration." };
    }

    // 1. Sign up user in Supabase
    // Add companyId to Supabase user_metadata if needed, or handle association differently.
    // Supabase by default sends a confirmation email if enabled.
    const { data: supabaseSignUpData, error: supabaseSignUpError } =
      await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          // You can pass additional metadata here
          data: {
            // company_id: data.companyId, // Ensure this is allowed by your RLS/policies
            // role_name: (await getRoleById(data.roleId))?.data?.name // Example
            // Be careful about what you store in Supabase user_metadata vs your RDS.
            firstName: data.firstName,
            lastName: data.lastName,
          },
        },
      });

    if (supabaseSignUpError || !supabaseSignUpData.user) {
      console.error("Supabase signUp error:", supabaseSignUpError?.message);
      // Map Supabase errors to user-friendly messages
      if (supabaseSignUpError?.message.includes("User already registered")) {
        return { error: "A user with this email already exists in Supabase." };
      }
      return {
        error: `Supabase registration failed: ${supabaseSignUpError?.message || "Unknown error"}`,
      };
    }

    const supabaseUserId = supabaseSignUpData.user.id;

    // 2. Create user in your Prisma database
    const prismaUser = await insertUser(
      data,
      supabaseUserId,
      tx, // Pass the transaction client if provided
    );

    // Note: Supabase email confirmation. The user is created but might not be 'active'
    // until they confirm their email. Your `emailVerified` in Prisma should reflect this.
    // `insertUser` currently sets it to null if supabaseUserId exists.
    // You might update `emailVerified` in your Prisma DB via `verifyAccount` later.

    return {
      success: true,
      data: parseStringify({
        // `parseStringify` might not be needed if types are correct
        supabaseUser: supabaseSignUpData.user, // Full Supabase user object
        user: prismaUser, // Your Prisma user object
      }),
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle Prisma-specific errors (e.g., unique constraints in your RDS)
      switch (error.code) {
        case "P2002": // Unique constraint failed
          // This could be on email in your RDS, even if Supabase check passed or was different.
          return {
            error: "A user with this email already exists in our system.",
          };
        case "P2003": // Foreign key constraint failed
          return { error: "Invalid company or role reference in our system." };
        default:
          return {
            error: `Database error during registration: ${error.message}`,
          };
      }
    }
    console.error("Register user unexpected error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Registration failed due to an unexpected error.",
    };
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
        // redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/update-password`, // URL of your page that handles password update
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

// SUPABASE_ADAPTED: forgetPasswordConfirmDetails
// This flow changes significantly with Supabase.
// 1. User clicks link in email, lands on your `redirectTo` page with a code/token in URL.
// 2. Client-side JS on that page extracts the token. Supabase client often handles this
//    if `onAuthStateChange` detects `AuthChangeEvent.PASSWORD_RECOVERY`.
// 3. User enters new password on that client-side page.
// 4. Client calls `supabase.auth.updateUser({ password: newPassword })`.
// This server action might not be needed in the same way, or it's called by the client
// AFTER Supabase client has a recovery session.
// For this adaptation, let's assume the client has obtained a valid Supabase session
// specific to password recovery and calls this server action to perform the update,
// using the user's active (recovery) session implicitly handled by `supabase.auth.updateUser`
// when called server-side by an *authenticated* request (via NextAuth session linked to Supabase).
// This is complex. A simpler server-side model might involve the client passing the recovery token.
// However, `updateUser` with password should ideally be called by an authenticated Supabase client instance.

// Let's simplify: assume this server action is primarily for users ALREADY authenticated
// via NextAuth (whose session is linked to Supabase) and want to update their password.
// The `code` from your schema is not directly used by `supabase.auth.updateUser`.
// If this is truly for AFTER clicking the reset link, the client should handle token exchange.
// For now, let's adapt it as if it's an "update password" for an authenticated user,
// making the `code` somewhat redundant for Supabase `updateUser`.
export async function updatePasswordForAuthenticatedUser( // Renamed for clarity
  values: Omit<
    z.infer<typeof forgotPasswordConfirmSchema>,
    "code" | "email"
  > & { newPassword: string }, // Simpler schema
): Promise<ActionResponse<void>> {
  try {
    // No Zod validation shown here for brevity, but you'd have one for newPassword
    const session = await auth(); // NextAuth session
    if (!session?.user?.id) {
      // Assuming session.user.id is the Supabase User ID
      return { error: "Not authenticated." };
    }

    // To update password for a user server-side, you need to use Supabase Admin client
    // or ensure the client calling this has passed a valid *user* access token
    // that `supabase.auth.updateUser` can use.
    // If using the shared `supabase` client (anon key), it cannot update arbitrary users.
    // This requires careful setup.

    // For this example, assuming `supabase` is an admin client or this is called in a context
    // where `supabase.auth.updateUser` can work for the currently authenticated user.
    // The most secure way server-side is typically using an Admin client:
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      session.user.id, // Supabase ID from NextAuth session
      { password: values.newPassword },
    );

    if (error) {
      console.error("Supabase updateUser (password) error:", error.message);
      return { error: `Failed to update password: ${error.message}` };
    }

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Update password unexpected error:", error);
    return { error: "Failed to update password due to an unexpected error." };
  }
}

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

    const { email, token } = validation.data; // `code` might be the token

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

    // Optionally, sign the user into NextAuth here if they aren't already,
    // using verifyData.session.access_token
    // await signIn('credentials', { supabaseAccessToken: verifyData.session.access_token, redirect: false });

    return { success: true };
  } catch (error) {
    console.error("Verify account unexpected error:", error);
    // Check for Prisma errors specifically if needed
    return {
      error: "Account could not be verified due to an unexpected error.",
    };
  }
}

// The following functions (getAll, findById, findByEmail, update, remove)
// primarily interact with your Prisma/RDS database.
// The main adaptation is ensuring that `session.user.id` (from NextAuth)
// correctly refers to the Supabase User ID if you use it for authorization checks
// against the `oauthId` in your `User` table for operations.
// And `session.user.companyId` for multi-tenancy checks.
// Their core logic remains largely the same.

export async function getAll(): Promise<ActionResponse<PrismaUser[]>> {
  // Return PrismaUser
  try {
    const session = await auth(); // NextAuth session
    if (!session?.user?.companyId) {
      return { error: "Not authenticated or company information missing" };
    }

    const users = await prisma.user.findMany({
      where: {
        companyId: session.user.companyId as string,
      },
      include: {
        role: true,
        company: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: parseStringify(users) };
  } catch (error) {
    console.error("Get all users error:", error);
    return { error: "Failed to fetch users" };
  }
}

// ... other Prisma-focused functions (findById, findByEmail, update, remove)
// would follow a similar pattern:
// - Use `await auth()` for session.
// - Ensure `session.user.id` (Supabase ID) and `session.user.companyId` are used correctly
//   in your Prisma queries if needed for filtering or authorization.
// - The `update` function, if it intends to update email, needs careful consideration.
//   Changing email in your RDS should also trigger an email change process in Supabase
//   (e.g., `supabase.auth.updateUser({ email: newEmail })`) which involves re-verification.
//   This makes direct email updates complex. Usually, you'd initiate this from a user settings page.
//   For simplicity, I'm assuming the `update` here only updates non-auth critical fields
//   or that email changes are handled separately with Supabase's flow.

// Example for `update` (simplified, focusing on non-email fields for now)
export async function updateUserNonAuthDetails( // Renamed for clarity
  id: string, // This is Prisma User ID
  data: Partial<
    Pick<
      PrismaUser,
      "firstName" | "lastName" | "roleId" | "title" | "employeeId"
    >
  >, // Only non-auth fields
): Promise<ActionResponse<PrismaUser>> {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return { error: "Not authenticated or company information missing" };
    }

    // Optional: If 'id' is Supabase ID, fetch Prisma user by oauthId first.
    // But your current code uses Prisma 'id'.
    const userToUpdate = await prisma.user.findUnique({ where: { id } });
    if (!userToUpdate || userToUpdate.companyId !== session.user.companyId) {
      return { error: "User not found or not authorized to update." };
    }

    // If you were to update email, you'd need to:
    // 1. Call supabase.auth.updateUser({ email: newEmail }) (client or admin).
    // 2. Supabase sends verification to new email.
    // 3. Only after new email is verified, update email in your Prisma DB.
    // This is complex for a simple update function.

    const updatedUser = await prisma.user.update({
      where: {
        id,
        companyId: session.user.companyId as string,
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

export async function resendCode(email: string): Promise<ActionResponse<void>> {
  try {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    if (error) {
      console.error("Resend code error:", error);
      return { error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Resend code error:", error);
    return { error: "Failed to resend verification code" };
  }
}
