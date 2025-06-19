import { createServerSupabaseClient } from "@/utils/supabase/server";
import { prisma } from "@/app/db";
import { cookies } from "next/headers";

interface AuthResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function withAuth<T, Args extends any[]>(
  handler: (user: any, ...args: Args) => Promise<AuthResponse<T>>
) {
  return async (...args: Args): Promise<AuthResponse<T>> => {
    try {
      let supabase;
      try {
        supabase = createServerSupabaseClient();
      } catch (error) {
        return {
          success: false,
          error: "No active session found",
        };
      }

      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        console.error("[AUTH_ERROR]", error);
        return {
          success: false,
          error: "Session expired or invalid",
        };
      }

      if (!user) {
        return {
          success: false,
          error: "No user found",
        };
      }

      // Check for company ID in user metadata
      const companyId = user.user_metadata?.companyId;
      if (!companyId) {
        return {
          success: false,
          error: "No company associated with your account",
        };
      }

      // Verify company exists and is active
      const company = await prisma.company.findUnique({
        where: { id: companyId },
      });

      if (!company) {
        return {
          success: false,
          error: "Invalid company ID or company not found",
        };
      }

      // Get the user's database record with role
      const dbUser = await prisma.user.findFirst({
        where: {
          oauthId: user.id,
          companyId: companyId,
        },
        include: {
          role: true,
        },
      });

      if (!dbUser) {
        return {
          success: false,
          error: "User not found in database",
        };
      }

      // Add user info to the request
      const enhancedUser = {
        ...user,
        dbUser,
        company,
      };

      return handler(enhancedUser, ...args);
    } catch (error) {
      console.error("[AUTH_MIDDLEWARE_ERROR]", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Authentication failed",
      };
    } finally {
      await prisma.$disconnect();
    }
  };
}
