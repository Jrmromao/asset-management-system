"use server";

import { Prisma, User as PrismaUser, UserStatus } from "@prisma/client"; // Assuming User is your Prisma model
import { parseStringify, validateEmail } from "@/lib/utils";
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
import type { User as SupabaseUserType } from "@supabase/supabase-js";
import { withAuth } from "@/lib/middleware/withAuth";

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
  return { success: false, error: message };
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

// Login (client-side, no withAuth needed)
export async function login(
  values: z.infer<typeof loginSchema>,
): Promise<ActionResponse<void>> {
  try {
    const validation = loginSchema.safeParse(values);
    if (!validation.success) {
      return { success: false, error: "Invalid email or password" };
    }
    const { email, password } = validation.data;
    const { data: supabaseLoginData, error: supabaseLoginError } =
      await supabase.auth.signInWithPassword({ email, password });
    if (supabaseLoginError || !supabaseLoginData.session) {
      return { success: false, error: "Invalid email or password" };
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: "Login failed due to an unexpected error.",
    };
  }
}

// Create user (server-side, must be tenant-aware)
export const createUser = withAuth(
  async (
    user,
    values: z.infer<typeof userSchema> & { companyId?: string },
  ): Promise<ActionResponse<PrismaUser>> => {
    try {
      const validation = userSchema.parse(values);
      // Use companyId from authenticated user if not provided
      const companyId = values.companyId || user.user_metadata?.companyId;
      if (!companyId) {
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
        companyId,
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
      return actionError("User creation failed due to an unexpected error.");
    }
  },
);

// Resend verification email (client-side, no withAuth needed)
export async function resendVerificationEmail(
  email: string,
): Promise<ActionResponse<void>> {
  try {
    if (!validateEmail(email)) {
      return { success: false, error: "Invalid email address" };
    }
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email: email,
    });
    if (resendError) {
      return {
        success: false,
        error: `Failed to resend verification email: ${resendError.message}`,
      };
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: "Failed to resend verification email due to an unexpected error.",
    };
  }
}

// Forgot password (client-side, no withAuth needed)
export async function forgotPassword(
  values: z.infer<typeof forgotPasswordSchema>,
): Promise<ActionResponse<void>> {
  try {
    console.log("[ForgotPassword] Function called", { email: values.email });
    const validation = forgotPasswordSchema.safeParse(values);
    if (!validation.success) {
      console.warn("[ForgotPassword] Invalid email address", {
        email: values.email,
      });
      return { success: false, error: "Invalid email address." };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(
      validation.data.email,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/forgot-password/confirm`,
      },
    );
    if (error) {
      console.warn("[ForgotPassword] Supabase error", error.message);
      return {
        success: false,
        error:
          "If an account with this email exists, a password reset link has been sent.",
      };
    }
    console.log("[ForgotPassword] Password reset email sent", {
      email: validation.data.email,
    });
    return { success: true };
  } catch (error) {
    console.error("[ForgotPassword] Unexpected error", error);
    return {
      success: false,
      error:
        "Failed to process forgot password request due to an unexpected error.",
    };
  }
}

// Verify account (client-side, no withAuth needed)
export async function verifyAccount(
  values: z.infer<typeof accountVerificationSchema> & { token: string },
): Promise<ActionResponse<void>> {
  try {
    const validation = accountVerificationSchema
      .extend({ token: z.string() })
      .safeParse(values);
    if (!validation.success) {
      return { success: false, error: "Invalid email, code, or token" };
    }
    const { email, token } = validation.data;
    const { data: verifyData, error: verifyError } =
      await supabase.auth.verifyOtp({
        type: "signup",
        email: email,
        token: token,
      });
    if (verifyError || !verifyData.user) {
      return {
        success: false,
        error: `Account verification failed: ${verifyError?.message || "Invalid token or email."}`,
      };
    }
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: "Account could not be verified due to an unexpected error.",
    };
  }
}

// Update user details (server-side, must be tenant-aware)
export const updateUserNonAuthDetails = withAuth(
  async (
    user,
    id: string,
    data: Partial<
      Pick<
        PrismaUser,
        "firstName" | "lastName" | "roleId" | "title" | "employeeId"
      >
    >,
  ): Promise<ActionResponse<PrismaUser>> => {
    try {
      // Only allow update if user belongs to the same company
      const userToUpdate = await prisma.user.findFirst({
        where: { id, companyId: user.user_metadata?.companyId },
      });
      if (!userToUpdate) {
        return { success: false, error: "User not found." };
      }
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          roleId: data.roleId,
          title: data.title,
          employeeId: data.employeeId,
        },
      });
      revalidatePath("/users");
      revalidatePath(`/users/${id}`);
      return { success: true, data: parseStringify(updatedUser) };
    } catch (error) {
      return { success: false, error: "Failed to update user" };
    }
  },
);

type AuthResponse<T> = {
  data?: T;
  error?: string;
  success: boolean;
};

export const getAll = withAuth(async (user): Promise<AuthResponse<User[]>> => {
  try {
    const users = await prisma.user.findMany({
      where: {
        companyId: user.user_metadata?.companyId,
      },
      orderBy: {
        name: "asc",
      },
      include: {
        role: true,
      },
    });
    return { success: true, data: parseStringify(users) };
  } catch (error) {
    console.error("Get users error:", error);
    return { success: false, error: "Failed to fetch users" };
  } finally {
    await prisma.$disconnect();
  }
});

export const getUserById = withAuth(async (user, id: string): Promise<AuthResponse<User>> => {
  try {
    const foundUser = await prisma.user.findFirst({
      where: {
        id,
        companyId: user.user_metadata?.companyId,
      },
      include: {
        role: true,
      },
    });
    if (!foundUser) {
      return { success: false, error: "User not found" };
    }
    return { success: true, data: parseStringify(foundUser) };
  } catch (error) {
    console.error("Get user error:", error);
    return { success: false, error: "Failed to fetch user" };
  } finally {
    await prisma.$disconnect();
  }
});

export const insert = withAuth(async (user, data: UserCreateInput): Promise<AuthResponse<User>> => {
  try {
    const newUser = await prisma.user.create({
      data: {
        ...data,
        companyId: user.user_metadata?.companyId,
      },
      include: {
        role: true,
      },
    });
    revalidatePath("/users");
    return { success: true, data: parseStringify(newUser) };
  } catch (error) {
    console.error("Create user error:", error);
    return { success: false, error: "Failed to create user" };
  } finally {
    await prisma.$disconnect();
  }
});

export const update = withAuth(async (user, id: string, data: UserUpdateInput): Promise<AuthResponse<User>> => {
  try {
    const updatedUser = await prisma.user.update({
      where: { 
        id,
        companyId: user.user_metadata?.companyId,
      },
      data,
      include: {
        role: true,
      },
    });
    revalidatePath("/users");
    return { success: true, data: parseStringify(updatedUser) };
  } catch (error) {
    console.error("Update user error:", error);
    return { success: false, error: "Failed to update user" };
  } finally {
    await prisma.$disconnect();
  }
});

export const remove = withAuth(async (user, id: string): Promise<AuthResponse<User>> => {
  try {
    const deletedUser = await prisma.user.delete({
      where: { 
        id,
        companyId: user.user_metadata?.companyId,
      },
    });
    revalidatePath("/users");
    return { success: true, data: parseStringify(deletedUser) };
  } catch (error) {
    console.error("Delete user error:", error);
    return { success: false, error: "Failed to delete user" };
  } finally {
    await prisma.$disconnect();
  }
});
