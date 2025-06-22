import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";

export type AuthResponse<T> = {
  data?: T;
  error?: string;
  success: boolean;
};

interface Session {
  accessToken?: string;
  refreshToken?: string;
}

// Higher-order function that wraps server actions with authentication
export function withAuth<T extends any[], R>(
  action: (
    user: any,
    ...args: T
  ) => Promise<{
    success: boolean;
    data?: R;
    error?: string;
    message?: string;
  }>,
) {
  return async (
    ...args: T
  ): Promise<{
    success: boolean;
    data?: R;
    error?: string;
    message?: string;
  }> => {
    try {
      console.log("🔍 [withAuth] - Starting authentication check");
      const { userId } = await auth();

      if (!userId) {
        console.error("❌ [withAuth] - No userId found");
        return {
          success: false,
          error: "Unauthorized - User not authenticated",
        };
      }

      // Get the full user object from Clerk to access metadata
      const clerk = await clerkClient();
      const clerkUser = await clerk.users.getUser(userId);

      console.log("�� [withAuth] - Clerk user data:", {
        userId,
        hasPublicMetadata: !!clerkUser.publicMetadata,
        hasPrivateMetadata: !!clerkUser.privateMetadata,
        publicMetadata: clerkUser.publicMetadata,
        privateMetadata: clerkUser.privateMetadata,
      });

      // Create user object with metadata from Clerk user
      const user = {
        id: userId,
        user_metadata: {
          ...(clerkUser.publicMetadata || {}),
          ...(clerkUser.privateMetadata || {}),
        },
        publicMetadata: clerkUser.publicMetadata || {},
        privateMetadata: clerkUser.privateMetadata || {},
      };

      console.log("🔍 [withAuth] - Created user object:", {
        id: user.id,
        publicMetadata: user.publicMetadata,
        privateMetadata: user.privateMetadata,
        hasCompanyId: !!user.privateMetadata?.companyId,
        companyId: user.privateMetadata?.companyId,
      });

      // Call the original action with the authenticated user
      return await action(user, ...args);
    } catch (error) {
      console.error("❌ [withAuth] - Authentication error:", error);
      return {
        success: false,
        error: "Authentication failed",
      };
    }
  };
}

// Alternative version that accepts session tokens (for backward compatibility)
export function withAuthSession<T extends any[], R>(
  action: (
    user: any,
    ...args: T
  ) => Promise<{
    success: boolean;
    data?: R;
    error?: string;
    message?: string;
  }>,
) {
  return async (
    session: Session,
    ...args: T
  ): Promise<{
    success: boolean;
    data?: R;
    error?: string;
    message?: string;
  }> => {
    try {
      const { userId } = await auth();

      if (!userId) {
        return {
          success: false,
          error: "Unauthorized - User not authenticated",
        };
      }

      // Get the full user object from Clerk to access metadata
      const clerk = await clerkClient();
      const clerkUser = await clerk.users.getUser(userId);

      // Create a user object that matches the expected structure
      const user = {
        id: userId,
        user_metadata: {
          ...(clerkUser.publicMetadata || {}),
          ...(clerkUser.privateMetadata || {}),
        },
        publicMetadata: clerkUser.publicMetadata || {},
        privateMetadata: clerkUser.privateMetadata || {},
      };

      // Call the original action with the authenticated user
      return await action(user, ...args);
    } catch (error) {
      console.error("Authentication error:", error);
      return {
        success: false,
        error: "Authentication failed",
      };
    }
  };
}
