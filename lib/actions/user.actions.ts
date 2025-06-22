"use server";

import { Prisma, User as PrismaUser, UserStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/app/db";
import { parseStringify } from "@/lib/utils";

/**
 * Creates a new user in the database when a new user signs up via Clerk.
 * This function is intended to be called from the Clerk webhook handler.
 *
 * NOTE: You must provide default 'roleId' and 'companyId' values for this
 * to work. In a multi-tenant application, you would typically handle this
 * during the user's onboarding flow after they have signed up.
 */
export async function createUser(user: {
  clerkId: string;
  email: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  photo: string;
}) {
  try {
    // First, try to find existing user by email
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (existingUser) {
      // Update existing user with Clerk ID
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: { oauthId: user.clerkId },
      });

      // Update Clerk metadata
      const clerk = await clerkClient();
      await clerk.users.updateUserMetadata(user.clerkId, {
        publicMetadata: {
          userId: updatedUser.id,
          companyId: updatedUser.companyId,
        },
        privateMetadata: {
          companyId: updatedUser.companyId,
        },
      });

      return parseStringify(updatedUser);
    }

    // Get user metadata from Clerk to find company ID
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(user.clerkId);

    // Extract company ID from user metadata
    const companyId = clerkUser.privateMetadata?.companyId as string;
    const roleName = (clerkUser.publicMetadata?.role as string) || "Admin";

    if (!companyId) {
      console.warn(
        `No company ID found for user ${user.email}. User may need to complete onboarding.`,
      );
      // Don't create user without company ID - they should go through onboarding first
      return null;
    }

    // Find the role for this company
    const role = await prisma.role.findFirst({
      where: {
        name: roleName,
        companyId: companyId,
      },
    });

    if (!role) {
      throw new Error(`Role '${roleName}' not found for company ${companyId}`);
    }

    const newUser = await prisma.user.create({
      data: {
        oauthId: user.clerkId,
        email: user.email,
        username: user.username,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        images: user.photo,
        status: UserStatus.ACTIVE,
        roleId: role.id,
        companyId: companyId,
      },
    });

    // Update Clerk metadata with the database user ID
    await clerk.users.updateUserMetadata(user.clerkId, {
      publicMetadata: {
        userId: newUser.id,
        companyId: newUser.companyId,
      },
      privateMetadata: {
        companyId: newUser.companyId,
      },
    });

    return parseStringify(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user in database.");
  }
}

/**
 * Updates an existing user in the database when their details are changed in Clerk.
 * This function is intended to be called from the Clerk webhook handler.
 */
export async function updateUser(
  clerkId: string,
  user: {
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    photo: string;
  },
) {
  try {
    const updatedUser = await prisma.user.update({
      where: { oauthId: clerkId },
      data: {
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        username: user.username,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        images: user.photo,
      },
    });

    return parseStringify(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update user in database.");
  }
}

/**
 * Deletes a user from the database when they are deleted from Clerk.
 * This function is intended to be called from the Clerk webhook handler.
 */
export async function deleteUser(clerkId: string) {
  try {
    const deletedUser = await prisma.user.delete({
      where: { oauthId: clerkId },
    });

    revalidatePath("/");

    return parseStringify(deletedUser);
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Failed to delete user from database.");
  }
}

// --- Generic User Management Functions ---

type UserUpdateInput = Prisma.UserUpdateInput;

/**
 * Updates non-sensitive details of a user.
 * TODO: Implement proper authorization to ensure the caller can update the target user.
 */
export const updateUserNonAuthDetails = async (
  id: string,
  data: Partial<
    Pick<
      PrismaUser,
      "firstName" | "lastName" | "roleId" | "title" | "employeeId"
    >
  >,
): Promise<{ success: boolean; error?: string; data?: PrismaUser }> => {
  try {
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
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${id}`);
    return { success: true, data: parseStringify(updatedUser) };
  } catch (error) {
    return {
      success: false,
      error: "Failed to update user",
    };
  }
};

/**
 * Retrieves all users.
 * TODO: Implement filtering by company based on the authenticated user's organization.
 */
export const getAll = async (): Promise<{
  success: boolean;
  error?: string;
  data?: PrismaUser[];
}> => {
  try {
    const users = await prisma.user.findMany({
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
    };
  }
};

/**
 * Retrieves a single user by their ID.
 * TODO: Implement proper authorization.
 */
export const getUserById = async (
  id: string,
): Promise<{ success: boolean; error?: string; data?: PrismaUser }> => {
  try {
    const foundUser = await prisma.user.findFirst({
      where: {
        id,
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
  }
};

/**
 * Updates a user's record.
 * TODO: Implement proper authorization.
 */
export const update = async (
  id: string,
  data: UserUpdateInput,
): Promise<{ success: boolean; error?: string; data?: PrismaUser }> => {
  try {
    const updatedUser = await prisma.user.update({
      where: {
        id,
      },
      data,
      include: {
        role: true,
      },
    });
    revalidatePath("/admin/users");
    return { success: true, data: parseStringify(updatedUser) };
  } catch (error) {
    console.error("Update user error:", error);
    return {
      success: false,
      error: "Failed to update user",
    };
  }
};

/**
 * Deletes a user from the database by their ID.
 * TODO: Implement proper authorization.
 */
export const remove = async (
  id: string,
): Promise<{ success: boolean; error?: string; data?: PrismaUser }> => {
  try {
    const deletedUser = await prisma.user.delete({
      where: {
        id,
      },
    });
    revalidatePath("/admin/users");
    return { success: true, data: parseStringify(deletedUser) };
  } catch (error) {
    console.error("Delete user error:", error);
    return {
      success: false,
      error: "Failed to delete user",
    };
  }
};

// Function to create a user when they first sign up (before company registration)
export async function createInitialUser(user: {
  clerkId: string;
  email: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  photo: string;
}) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (existingUser) {
      // Update existing user with Clerk ID
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: { oauthId: user.clerkId },
      });

      return parseStringify(updatedUser);
    }

    // For initial signup, we don't create a user in the database yet
    // They will be created during company registration
    console.log(
      `User ${user.email} signed up but needs to complete company registration`,
    );
    return null;
  } catch (error) {
    console.error("Error handling initial user:", error);
    throw new Error("Failed to handle initial user signup.");
  }
}

// Function to create user during company registration
export async function createUserWithCompany(user: {
  clerkId: string;
  email: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  photo: string;
  companyId: string;
  roleId: string;
}) {
  try {
    const newUser = await prisma.user.create({
      data: {
        oauthId: user.clerkId,
        email: user.email,
        username: user.username,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        images: user.photo,
        status: UserStatus.ACTIVE,
        roleId: user.roleId,
        companyId: user.companyId,
      },
    });

    // Update Clerk metadata
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(user.clerkId, {
      publicMetadata: {
        userId: newUser.id,
        companyId: newUser.companyId,
      },
      privateMetadata: {
        companyId: newUser.companyId,
      },
    });

    return parseStringify(newUser);
  } catch (error) {
    console.error("Error creating user with company:", error);
    throw new Error("Failed to create user in database.");
  }
}

/**
 * Initiates the forgot password process by sending a reset code to the user's email.
 * This function works with Clerk's password reset functionality.
 */
export const forgotPassword = async (data: {
  email: string;
}): Promise<void> => {
  try {
    // Check if user exists in our database
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error("No account found with this email address.");
    }

    // If user exists, we can proceed with Clerk's password reset
    // The actual reset code sending is handled by Clerk in the frontend
    return;
  } catch (error) {
    console.error("Forgot password error:", error);
    throw new Error("Failed to process password reset request.");
  }
};

/**
 * Resets the user's password using the provided reset code and new password.
 * This function works with Clerk's password reset functionality.
 */
export const resetPassword = async (data: {
  newPassword: string;
  confirmNewPassword: string;
}): Promise<{ success: boolean; error?: string }> => {
  try {
    // Validate passwords match
    if (data.newPassword !== data.confirmNewPassword) {
      return {
        success: false,
        error: "Passwords do not match",
      };
    }

    // Validate password strength
    if (data.newPassword.length < 8) {
      return {
        success: false,
        error: "Password must be at least 8 characters long",
      };
    }

    // This function is a placeholder since Clerk handles the actual password reset
    // The real implementation happens in the frontend using Clerk's useSignIn hook
    // We're keeping this for compatibility with existing components

    return { success: true };
  } catch (error) {
    console.error("Reset password error:", error);
    return {
      success: false,
      error: "Failed to reset password",
    };
  }
};
