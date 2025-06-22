import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";

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
      const { userId, sessionClaims } = await auth();

      if (!userId) {
        return {
          success: false,
          error: "Unauthorized - User not authenticated",
        };
      }

      // Create a user object that matches the expected structure
      const user = {
        id: userId,
        user_metadata: {
          ...(sessionClaims?.publicMetadata || {}),
          ...(sessionClaims?.privateMetadata || {}),
        },
        ...sessionClaims,
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
      const { userId, sessionClaims } = await auth();

      if (!userId) {
        return {
          success: false,
          error: "Unauthorized - User not authenticated",
        };
      }

      // Create a user object that matches the expected structure
      const user = {
        id: userId,
        user_metadata: {
          ...(sessionClaims?.publicMetadata || {}),
          ...(sessionClaims?.privateMetadata || {}),
        },
        ...sessionClaims,
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
