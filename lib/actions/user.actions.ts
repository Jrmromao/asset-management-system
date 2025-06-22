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
        role: {
          connect: {
            id: "clqg1e1lo000008l3f9g8h3j9",
          },
        },
        company: {
          connect: {
            id: "clqg1e1lq000108l3f9g8h3ja",
          },
        },
      },
    });

    // Update the user's public metadata in Clerk to store the local DB user ID.
    if (newUser && newUser.oauthId) {
      const clerk = await clerkClient();
      await clerk.users.updateUserMetadata(newUser.oauthId, {
        publicMetadata: {
          userId: newUser.id,
        },
      });
    }

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
