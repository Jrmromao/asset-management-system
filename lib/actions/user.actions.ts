"use server";

import { Prisma, User as PrismaUser, UserStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { clerkClient, auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/db";
import { parseStringify } from "@/lib/utils";
import { UserService } from "@/services/user/userService";
import { createAuditLog } from "@/lib/actions/auditLog.actions";
import { EmailService } from "@/services/email";

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

      // Update Clerk metadata (SECURE - companyId in private metadata only)
      const clerk = await clerkClient();
      await clerk.users.updateUserMetadata(user.clerkId, {
        publicMetadata: {
          userId: updatedUser.id,
          // companyId removed from public metadata for security
        },
        privateMetadata: {
          companyId: updatedUser.companyId, // companyId in private metadata only
        },
      });

      if (updatedUser) {
        await createAuditLog({
          companyId: updatedUser.companyId,
          action: "USER_UPDATED",
          entity: "USER",
          entityId: updatedUser.id,
          details: `User updated: ${updatedUser.email} (${updatedUser.name}) by user ${updatedUser.id}`,
        });
      }

      return parseStringify(updatedUser);
    }

    // Get user metadata from Clerk to find company ID
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(user.clerkId);

    // Extract company ID from private metadata (more secure)
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

    // Update Clerk metadata with the database user ID (SECURE - companyId in private metadata only)
    await clerk.users.updateUserMetadata(user.clerkId, {
      publicMetadata: {
        userId: newUser.id,
        // companyId removed from public metadata for security
      },
      privateMetadata: {
        companyId: newUser.companyId, // companyId in private metadata only
      },
    });

    if (newUser) {
      await createAuditLog({
        companyId: newUser.companyId,
        action: "USER_CREATED",
        entity: "USER",
        entityId: newUser.id,
        details: `User created: ${newUser.email} (${newUser.name}) by user ${newUser.id}`,
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

    if (updatedUser) {
      await createAuditLog({
        companyId: updatedUser.companyId,
        action: "USER_UPDATED",
        entity: "USER",
        entityId: updatedUser.id,
        details: `User updated: ${updatedUser.email} (${updatedUser.name}) by user ${updatedUser.id}`,
      });
    }

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
    const deletedUser = await prisma.user.update({
      where: { oauthId: clerkId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        active: false,
        status: "DISABLED",
      },
    });

    revalidatePath("/");

    if (deletedUser) {
      await createAuditLog({
        companyId: deletedUser.companyId,
        action: "USER_SOFT_DELETED",
        entity: "USER",
        entityId: deletedUser.id,
        details: `User soft-deleted: ${deletedUser.email} (${deletedUser.name}) by Clerk webhook`,
      });
    }

    return parseStringify(deletedUser);
  } catch (error) {
    console.error("Error soft-deleting user:", error);
    throw new Error("Failed to soft-delete user in database.");
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
      "firstName" | "lastName" | "roleId" | "title" | "employeeId" | "departmentId" | "active"
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
        departmentId: data.departmentId,
        // Allow updating active field if present
        ...(data.active !== undefined ? { active: data.active } : {}),
      },
    });
    // Audit log: track user edit details
    const before = await prisma.user.findUnique({ where: { id } });
    await createAuditLog({
      companyId: updatedUser.companyId,
      action: "USER_UPDATED",
      entity: "USER",
      entityId: updatedUser.id,
      details: `User updated: ${updatedUser.email} (${updatedUser.name})`,
      dataAccessed: { before, after: updatedUser },
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
        company: true,
        department: true,
        assets: {
          include: {
            model: {
              include: {
                manufacturer: true,
              },
            },
            statusLabel: true,
            department: true,
            departmentLocation: true,
          },
        },
        userItem: {
          include: {
            license: true,
            accessory: {
              include: {
                statusLabel: true,
                category: true,
              },
            },
          },
        },
        auditLogs: {
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
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

/**
 * Marks all items assigned to a user as 'awaiting_return' and removes the user assignment.
 * Logs an audit entry for each item.
 */
export const markUserItemsAwaitingReturn = async (
  userId: string,
  actorId: string,
  companyId: string,
): Promise<{ success: boolean; error?: string; details?: any[] }> => {
  try {
    // Find the 'Awaiting Return' status label for this company
    const statusLabel = await prisma.statusLabel.findFirst({
      where: { name: "Awaiting Return", companyId },
    });
    if (!statusLabel) {
      return { success: false, error: "Awaiting Return status label not found for this company." };
    }
    // Find all UserItem assignments for this user
    const userItems = await prisma.userItem.findMany({
      where: { userId, companyId },
      include: { asset: true, accessory: true, license: true },
    });
    const details: any[] = [];
    for (const item of userItems) {
      // Remove assignment and set status to 'awaiting_return'
      if (item.assetId && item.asset) {
        await prisma.asset.update({
          where: { id: item.assetId },
          data: { userId: null, statusLabelId: statusLabel.id },
        });
        await prisma.assetHistory.create({
          data: {
            assetId: item.assetId,
            type: "status_change",
            companyId,
            notes: `Marked as awaiting return due to user deactivation/deletion`,
          },
        });
        await prisma.auditLog.create({
          data: {
            companyId,
            userId: actorId,
            action: "ASSET_AWAITING_RETURN",
            entity: "ASSET",
            entityId: item.assetId,
            details: `Asset marked as awaiting return due to user deactivation/deletion`,
          },
        });
        details.push({ type: "asset", id: item.assetId, name: item.asset.name });
      }
      if (item.accessoryId && item.accessory) {
        await prisma.accessory.update({
          where: { id: item.accessoryId },
          data: { statusLabelId: statusLabel.id },
        });
        await prisma.auditLog.create({
          data: {
            companyId,
            userId: actorId,
            action: "ACCESSORY_AWAITING_RETURN",
            entity: "ACCESSORY",
            entityId: item.accessoryId,
            details: `Accessory marked as awaiting return due to user deactivation/deletion`,
          },
        });
        details.push({ type: "accessory", id: item.accessoryId, name: item.accessory.name });
      }
      if (item.licenseId && item.license) {
        await prisma.license.update({
          where: { id: item.licenseId },
          data: { statusLabelId: statusLabel.id },
        });
        await prisma.auditLog.create({
          data: {
            companyId,
            userId: actorId,
            action: "LICENSE_AWAITING_RETURN",
            entity: "LICENSE",
            entityId: item.licenseId,
            details: `License marked as awaiting return due to user deactivation/deletion`,
          },
        });
        details.push({ type: "license", id: item.licenseId, name: item.license.name });
      }
      // Remove the user assignment
      await prisma.userItem.delete({ where: { id: item.id } });
    }
    return { success: true, details };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

/**
 * Deactivates a user, marks their items as Awaiting Return, logs all actions, and sends notification emails.
 */
export const deactivateUser = async (
  userId: string,
  actorId: string,
  companyId: string,
) => {
  try {
    // 1. Deactivate the user
    const user = await prisma.user.update({
      where: { id: userId },
      data: { active: false, status: "DISABLED" },
    });
    // 2. Log audit
    await createAuditLog({
      companyId,
      action: "USER_DEACTIVATED",
      entity: "USER",
      entityId: userId,
      details: `User deactivated: ${user.email} (${user.name}) by user ${actorId}`,
    });
    // 3. Mark all items as Awaiting Return
    const { details } = await markUserItemsAwaitingReturn(userId, actorId, companyId);
    // 4. Send asset return email to user (if not lonee)
    let isLonee = false;
    if (user.roleId) {
      const role = await prisma.role.findUnique({ where: { id: user.roleId } });
      isLonee = role?.name?.toLowerCase() === "lonee";
    }
    if (!isLonee && user.email) {
      await EmailService.sendEmail({
        to: user.email,
        subject: "Asset Return Request",
        templateName: "assetReturnRequest",
        templateData: {
          firstName: user.firstName || user.name || "",
          items: details || [],
        },
      });
    }
    // 5. (Optional) Send summary email to actor/admin
    // ...
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

/**
 * Activates a user, logs the action, and returns success or error.
 */
export const activateUser = async (
  userId: string,
  actorId: string,
  companyId: string,
) => {
  try {
    // 1. Activate the user
    const user = await prisma.user.update({
      where: { id: userId },
      data: { active: true, status: "ACTIVE" },
    });
    // 2. Log audit
    await createAuditLog({
      companyId,
      action: "USER_ACTIVATED",
      entity: "USER",
      entityId: userId,
      details: `User activated: ${user.email} (${user.name}) by user ${actorId}`,
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

/**
 * Updates the notes field for a user by ID.
 */
export const updateUserNotes = async (
  userId: string,
  notes: string,
  actorId?: string,
) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { notes },
    });
    // Fetch actor details if actorId is provided
    let actorLabel = "system";
    if (actorId) {
      const actor = await prisma.user.findUnique({ where: { id: actorId } });
      if (actor) {
        if (actor.name && actor.email) {
          actorLabel = `${actor.name} (${actor.email})`;
        } else if (actor.name) {
          actorLabel = actor.name;
        } else if (actor.email) {
          actorLabel = actor.email;
        } else {
          actorLabel = "Unknown User";
        }
      } else {
        actorLabel = "Unknown User";
      }
    }
    // Log audit with notes value
    const auditLog = await createAuditLog({
      companyId: updatedUser.companyId,
      action: "USER_NOTES_UPDATED",
      entity: "USER",
      entityId: userId,
      details: `User notes updated by ${actorLabel}. New notes: ${notes}`,
      dataAccessed: { notes },
    });
    return { success: true, data: { ...parseStringify(updatedUser), lastAuditLog: auditLog?.data } };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
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

    // Update Clerk metadata (SECURE - companyId in private metadata only)
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(user.clerkId, {
      publicMetadata: {
        userId: newUser.id,
        // companyId removed from public metadata for security
      },
      privateMetadata: {
        companyId: newUser.companyId, // companyId in private metadata only
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
    await createAuditLog({
      companyId: user.companyId,
      action: "USER_FORGOT_PASSWORD",
      entity: "USER",
      entityId: user.id,
      details: `User forgot password: ${user.email}`,
    });
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
    // For audit log, we can't get userId/email here, so skip unless you want to pass email in data
    return { success: true };
  } catch (error) {
    console.error("Reset password error:", error);
    return {
      success: false,
      error: "Failed to reset password",
    };
  }
};

/**
 * Syncs user metadata in Clerk with the database
 * This ensures Clerk metadata is always up-to-date
 */
export async function syncUserMetadata(clerkUserId: string): Promise<{
  success: boolean;
  error?: string;
  synced?: boolean;
}> {
  try {
    console.log("🔄 [syncUserMetadata] - Starting sync for user:", clerkUserId);

    const dbUser = await prisma.user.findUnique({
      where: { oauthId: clerkUserId },
      select: {
        id: true,
        companyId: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!dbUser) {
      console.warn(
        "⚠️ [syncUserMetadata] - User not found in database:",
        clerkUserId,
      );
      return {
        success: false,
        error: "User not found in database",
        synced: false,
      };
    }

    const clerk = await clerkClient();

    // Update Clerk metadata with current database values
    await clerk.users.updateUserMetadata(clerkUserId, {
      publicMetadata: {
        userId: dbUser.id,
        companyId: dbUser.companyId,
        role: dbUser.role.name,
        onboardingComplete: true,
      },
      privateMetadata: {
        companyId: dbUser.companyId,
      },
    });

    console.log(
      "✅ [syncUserMetadata] - Successfully synced metadata for user:",
      {
        clerkUserId,
        userId: dbUser.id,
        companyId: dbUser.companyId,
        role: dbUser.role.name,
      },
    );

    await createAuditLog({
      companyId: dbUser.companyId,
      action: "USER_METADATA_SYNCED",
      entity: "USER",
      entityId: dbUser.id,
      details: `User metadata synced for user ${dbUser.id}`,
    });

    return {
      success: true,
      synced: true,
    };
  } catch (error) {
    console.error("❌ [syncUserMetadata] - Error syncing metadata:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to sync metadata",
      synced: false,
    };
  }
}

/**
 * Syncs metadata for all users in a company
 * Useful for bulk operations or data migrations
 */
export async function syncCompanyUserMetadata(companyId: string): Promise<{
  success: boolean;
  error?: string;
  syncedCount: number;
  totalCount: number;
}> {
  try {
    console.log(
      "🔄 [syncCompanyUserMetadata] - Starting sync for company:",
      companyId,
    );

    const users = await prisma.user.findMany({
      where: { companyId },
      select: {
        oauthId: true,
        id: true,
        companyId: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    if (users.length === 0) {
      return {
        success: true,
        syncedCount: 0,
        totalCount: 0,
      };
    }

    const clerk = await clerkClient();
    let syncedCount = 0;

    for (const user of users) {
      if (!user.oauthId) {
        console.warn(
          "⚠️ [syncCompanyUserMetadata] - User has no oauthId:",
          user.id,
        );
        continue;
      }

      try {
        await clerk.users.updateUserMetadata(user.oauthId, {
          publicMetadata: {
            userId: user.id,
            companyId: user.companyId,
            role: user.role.name,
            onboardingComplete: true,
          },
          privateMetadata: {
            companyId: user.companyId,
          },
        });
        syncedCount++;
      } catch (err) {
        console.warn(
          "❌ [syncCompanyUserMetadata] - Failed to sync user:",
          user.id,
          err,
        );
      }
    }

    await createAuditLog({
      companyId,
      action: "USER_METADATA_BULK_SYNCED",
      entity: "USER",
      entityId: undefined,
      details: `Bulk user metadata sync completed for company ${companyId}. Synced count: ${syncedCount}`,
    });

    return {
      success: true,
      syncedCount,
      totalCount: users.length,
    };
  } catch (error) {
    console.error(
      "❌ [syncCompanyUserMetadata] - Error syncing company metadata:",
      error,
    );
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to sync company metadata",
      syncedCount: 0,
      totalCount: 0,
    };
  }
}

/**
 * Ensures user metadata is synced before proceeding
 * This can be called at the start of any action that needs user metadata
 */
export async function ensureUserMetadataSync(clerkUserId: string): Promise<{
  success: boolean;
  companyId?: string;
  error?: string;
}> {
  try {
    // Check if metadata needs syncing by getting current Clerk user
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(clerkUserId);
    const dbUser = await prisma.user.findUnique({
      where: { oauthId: clerkUserId },
      select: { id: true, companyId: true },
    });

    if (!dbUser) {
      return {
        success: false,
        error: "User not found in database",
      };
    }

    // If companyId is missing or out of sync, update Clerk metadata
    if (
      !clerkUser.privateMetadata?.companyId ||
      clerkUser.privateMetadata.companyId !== dbUser.companyId
    ) {
      await clerk.users.updateUserMetadata(clerkUserId, {
        privateMetadata: {
          companyId: dbUser.companyId,
        },
      });
    }

    await createAuditLog({
      companyId: dbUser.companyId,
      action: "USER_METADATA_ENSURE_SYNCED",
      entity: "USER",
      entityId: dbUser.id,
      details: `User metadata ensure sync for user ${dbUser.id}`,
    });

    return {
      success: true,
      companyId: dbUser.companyId,
    };
  } catch (error) {
    console.error(
      "❌ [ensureUserMetadataSync] - Error ensuring metadata sync:",
      error,
    );
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to ensure metadata sync",
    };
  }
}

/**
 * Enhanced invitation function using UserService
 */
export async function inviteUserWithService(data: {
  email: string;
  roleId: string;
}): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    const { orgId, userId } = await auth();

    if (!orgId || !userId) {
      return { success: false, error: "User is not part of an organization." };
    }

    const currentUser = await prisma.user.findFirst({
      where: { oauthId: userId },
      select: { companyId: true },
    });

    if (!currentUser || !currentUser.companyId) {
      return {
        success: false,
        error: "Could not find the associated company.",
      };
    }

    const userService = UserService.getInstance();
    const result = await userService.inviteUser({
      email: data.email,
      roleId: data.roleId,
      companyId: currentUser.companyId,
      invitedBy: userId,
    });

    if (result.success) {
      revalidatePath("/people");
      await createAuditLog({
        companyId: currentUser.companyId,
        action: "USER_INVITED",
        entity: "USER",
        entityId: undefined,
        details: `User invited: ${data.email} with role ${data.roleId} by user ${userId}`,
      });
    }

    return result;
  } catch (error) {
    console.error("Failed to invite user:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred.",
    };
  }
}

/**
 * Get all users for the current organization using UserService
 * Enhanced to work with or without Clerk orgId by using user's company association
 */
export const getAllUsersWithService = async (): Promise<{
  success: boolean;
  error?: string;
  data: {
    users: PrismaUser[];
    totalUsers: number;
    newThisMonth: number;
    uniqueRoles: number;
  };
}> => {
  try {
    console.log("🔍 [getAllUsersWithService] Starting user fetch...");
    const { orgId, userId } = await auth();

    console.log("🔍 [getAllUsersWithService] Auth result:", {
      userId: !!userId,
      orgId: !!orgId,
      userIdValue: userId,
      orgIdValue: orgId,
    });

    // We need at least userId
    if (!userId) {
      console.log("❌ [getAllUsersWithService] Missing userId");
      return {
        success: false,
        error: "Unauthorized - No user ID",
        data: { users: [], totalUsers: 0, newThisMonth: 0, uniqueRoles: 0 },
      };
    }

    console.log(
      "🔍 [getAllUsersWithService] Looking for current user with oauthId:",
      userId,
    );
    const currentUser = await prisma.user.findFirst({
      where: { oauthId: userId },
      select: {
        companyId: true,
        id: true,
        email: true,
        name: true,
        company: {
          select: {
            id: true,
            name: true,
            clerkOrgId: true,
          },
        },
      },
    });

    console.log("🔍 [getAllUsersWithService] Current user found:", currentUser);

    if (!currentUser || !currentUser.companyId) {
      console.log(
        "❌ [getAllUsersWithService] No current user or company ID:",
        {
          userFound: !!currentUser,
          companyId: currentUser?.companyId,
        },
      );

      // Let's also check if there are any users in the database at all
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          oauthId: true,
          companyId: true,
          status: true,
        },
        take: 5,
      });
      console.log(
        "🔍 [getAllUsersWithService] All users in DB (first 5):",
        allUsers,
      );

      return {
        success: false,
        error: "Could not find the associated company.",
        data: { users: [], totalUsers: 0, newThisMonth: 0, uniqueRoles: 0 },
      };
    }

    console.log("🔍 [getAllUsersWithService] Fetching users for company:", {
      companyId: currentUser.companyId,
      companyName: currentUser.company?.name,
      clerkOrgId: currentUser.company?.clerkOrgId,
    });

    const userService = UserService.getInstance();
    const result = await userService.getAllUsers(currentUser.companyId);

    console.log("🔍 [getAllUsersWithService] UserService result:", {
      success: result.success,
      userCount: result.data?.length || 0,
      error: result.error,
    });

    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || "Failed to fetch users",
        data: { users: [], totalUsers: 0, newThisMonth: 0, uniqueRoles: 0 },
      };
    }

    // Calculate metrics
    const users = result.data;
    const totalUsers = users.length;

    // Calculate new users this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newThisMonth = users.filter((user) => {
      const createdDate = new Date(user.createdAt);
      return createdDate >= startOfMonth;
    }).length;

    // Calculate unique roles
    const uniqueRoles = new Set(users.map((user) => user.roleId)).size;

    console.log("✅ [getAllUsersWithService] Success:", {
      totalUsers,
      newThisMonth,
      uniqueRoles,
      userStatuses: users.map((u) => ({ email: u.email, status: u.status })),
    });

    return {
      success: true,
      data: {
        users,
        totalUsers,
        newThisMonth,
        uniqueRoles,
      },
    };
  } catch (error) {
    console.error("❌ [getAllUsersWithService] Error:", error);
    return {
      success: false,
      error: "Failed to fetch users",
      data: { users: [], totalUsers: 0, newThisMonth: 0, uniqueRoles: 0 },
    };
  }
};
