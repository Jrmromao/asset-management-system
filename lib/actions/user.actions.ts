"use server";

import { Prisma, User as PrismaUser } from "@prisma/client";
import { parseStringify, validateEmail } from "@/lib/utils";
import {
  accountVerificationSchema,
  forgotPasswordConfirmSchema,
  forgotPasswordSchema,
  loginSchema,
  userSchema,
} from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { getRoleById } from "@/lib/actions/role.actions";
import { z } from "zod";
import { prisma } from "@/app/db";
import { createClient } from "@/utils/supabase/server";
import { withAuth, AuthResponse } from "@/lib/middleware/withAuth";

type UserCreateInput = Prisma.UserCreateInput;
type UserUpdateInput = Prisma.UserUpdateInput;

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
): Promise<AuthResponse<null>> {
  try {
    const validation = loginSchema.safeParse(values);
    if (!validation.success) {
      return { success: false, error: "Invalid email or password", data: null };
    }
    const { email, password } = validation.data;
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      return { success: false, error: "Invalid email or password", data: null };
    }
    return { success: true, data: null };
  } catch (error) {
    return {
      success: false,
      error: "Login failed due to an unexpected error.",
      data: null,
    };
  }
}

// Create user (server-side, must be tenant-aware)
export const createUser = withAuth(
  async (
    user,
    values: z.infer<typeof userSchema> & { companyId?: string },
  ): Promise<AuthResponse<PrismaUser | undefined>> => {
    try {
      const validation = userSchema.parse(values);
      // Use companyId from authenticated user if not provided
      const companyId = values.companyId || user.user_metadata?.companyId;
      if (!companyId) {
        return {
          success: false,
          error: "Company information missing",
          data: undefined,
        };
      }
      const role = await getRoleById(validation.roleId);
      if (!role?.data) {
        return { success: false, error: "Role not found", data: undefined };
      }
      const roleName = (role.data as { name: string }).name;
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
      const supabase = await createClient();
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
        return { success: false, error: error.message, data: undefined };
      }
      return {
        success: false,
        error: "User creation failed due to an unexpected error.",
        data: undefined,
      };
    }
  },
);

// Resend verification email (client-side, no withAuth needed)
export async function resendVerificationEmail(
  email: string,
): Promise<AuthResponse<null>> {
  try {
    if (!validateEmail(email)) {
      return { success: false, error: "Invalid email address", data: null };
    }
    const supabase = await createClient();
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email: email,
    });
    if (resendError) {
      return {
        success: false,
        error: `Failed to resend verification email: ${resendError.message}`,
        data: null,
      };
    }
    return { success: true, data: null };
  } catch (error) {
    return {
      success: false,
      error: "Failed to resend verification email due to an unexpected error.",
      data: null,
    };
  }
}

// Forgot password (client-side, no withAuth needed)
export async function forgotPassword(
  values: z.infer<typeof forgotPasswordSchema>,
): Promise<AuthResponse<null>> {
  try {
    const validation = forgotPasswordSchema.safeParse(values);
    if (!validation.success) {
      return { success: false, error: "Invalid email address.", data: null };
    }
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(
      validation.data.email,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/forgot-password/confirm`,
      },
    );
    if (error) {
      return {
        success: false,
        error:
          "If an account with this email exists, a password reset link has been sent.",
        data: null,
      };
    }
    return { success: true, data: null };
  } catch (error) {
    return {
      success: false,
      error:
        "Failed to process forgot password request due to an unexpected error.",
      data: null,
    };
  }
}

// Verify account (client-side, no withAuth needed)
export async function verifyAccount(
  values: z.infer<typeof accountVerificationSchema> & { token: string },
): Promise<AuthResponse<null>> {
  try {
    const validation = accountVerificationSchema
      .extend({ token: z.string() })
      .safeParse(values);
    if (!validation.success) {
      return {
        success: false,
        error: "Invalid email, code, or token",
        data: null,
      };
    }
    const { email, token } = validation.data;
    const supabase = await createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      type: "signup",
      email: email,
      token: token,
    });
    if (verifyError) {
      return {
        success: false,
        error: `Account verification failed: ${verifyError?.message || "Invalid token or email."}`,
        data: null,
      };
    }
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });
    return { success: true, data: null };
  } catch (error) {
    return {
      success: false,
      error: "Account could not be verified due to an unexpected error.",
      data: null,
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
  ): Promise<AuthResponse<PrismaUser | undefined>> => {
    try {
      // Only allow update if user belongs to the same company
      const userToUpdate = await prisma.user.findFirst({
        where: { id, companyId: user.user_metadata?.companyId },
      });
      if (!userToUpdate) {
        return { success: false, error: "User not found.", data: undefined };
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
      return {
        success: false,
        error: "Failed to update user",
        data: undefined,
      };
    }
  },
);

export const getAll = withAuth(
  async (user): Promise<AuthResponse<PrismaUser[] | undefined>> => {
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
      return {
        success: false,
        error: "Failed to fetch users",
        data: undefined,
      };
    }
  },
);

export const getUserById = withAuth(
  async (user, id: string): Promise<AuthResponse<PrismaUser | undefined>> => {
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
        return { success: false, error: "User not found", data: undefined };
      }
      return { success: true, data: parseStringify(foundUser) };
    } catch (error) {
      console.error("Get user error:", error);
      return { success: false, error: "Failed to fetch user", data: undefined };
    }
  },
);

export const insert = withAuth(
  async (
    user,
    data: UserCreateInput,
  ): Promise<AuthResponse<PrismaUser | undefined>> => {
    try {
      const { email, firstName, lastName, name, role, ...rest } = data;
      const newUser = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          name,
          ...rest,
          company: {
            connect: { id: user.user_metadata?.companyId },
          },
          role: {
            connect: { id: (role as any)?.connect?.id },
          },
        },
        include: {
          role: true,
        },
      });
      revalidatePath("/users");
      return { success: true, data: parseStringify(newUser) };
    } catch (error) {
      console.error("Create user error:", error);
      return {
        success: false,
        error: "Failed to create user",
        data: undefined,
      };
    }
  },
);

export const update = withAuth(
  async (
    user,
    id: string,
    data: UserUpdateInput,
  ): Promise<AuthResponse<PrismaUser | undefined>> => {
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
      return {
        success: false,
        error: "Failed to update user",
        data: undefined,
      };
    }
  },
);

export const remove = withAuth(
  async (user, id: string): Promise<AuthResponse<PrismaUser | undefined>> => {
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
      return {
        success: false,
        error: "Failed to delete user",
        data: undefined,
      };
    }
  },
);

export async function resetPassword(
  values: z.infer<typeof forgotPasswordConfirmSchema>,
): Promise<AuthResponse<null>> {
  try {
    const validation = forgotPasswordConfirmSchema.safeParse(values);
    if (!validation.success) {
      const error = validation.error.flatten().fieldErrors;
      const message =
        error.newPassword?.[0] ??
        error.confirmNewPassword?.[0] ??
        "Invalid data";
      return { success: false, error: message, data: null };
    }

    const supabase = await createClient();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return {
        success: false,
        error: "Not authenticated. Invalid or expired password reset link.",
        data: null,
      };
    }

    const { newPassword } = validation.data;
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      return { success: false, error: error.message, data: null };
    }

    return { success: true, data: null };
  } catch (e) {
    return {
      success: false,
      error: "An unexpected error occurred.",
      data: null,
    };
  }
}
