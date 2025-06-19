import { createClient } from '@supabase/supabase-js';
import { prisma } from "@/app/db";

interface AuthResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Create a Supabase client with the provided session
const createSupabaseClient = (accessToken?: string, refreshToken?: string) => {
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    }
  );

  if (accessToken && refreshToken) {
    client.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });
  }

  return client;
};

export function withAuth<T, Args extends any[]>(
  handler: (user: any, ...args: Args) => Promise<AuthResponse<T>>
) {
  return async (session: { accessToken?: string; refreshToken?: string } | null, ...args: Args): Promise<AuthResponse<T>> => {
    try {
      if (!session?.accessToken || !session?.refreshToken) {
        return {
          success: false,
          error: "No active session found",
        };
      }

      const supabase = createSupabaseClient(session.accessToken, session.refreshToken);
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        return {
          success: false,
          error: error?.message || "No active session found",
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
