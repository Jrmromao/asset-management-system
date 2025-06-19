import { cookies } from "next/headers";
import { createClient, User as SupabaseAuthUser } from "@supabase/supabase-js";
import type { User } from "@prisma/client";

export type AuthResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
};

export type SupabaseUser = SupabaseAuthUser & {
  user_metadata: {
    companyId: string;
    name: string;
  };
};

const getSession = () => {
  const cookieStore = cookies();
  return {
    accessToken: cookieStore.get("sb-access-token")?.value,
    refreshToken: cookieStore.get("sb-refresh-token")?.value,
  };
};

const getUser = async (session: {
  accessToken?: string;
  refreshToken?: string;
}): Promise<SupabaseUser | null> => {
  if (!session.accessToken) return null;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      },
    },
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;

  return user as SupabaseUser;
};

export function withAuth<T, P extends any[]>(
  handler: (user: SupabaseUser, ...args: P) => Promise<AuthResponse<T>>,
): (...args: P) => Promise<AuthResponse<T>> {
  return async (...args: P): Promise<AuthResponse<T>> => {
    try {
      const session = getSession();
      if (!session?.accessToken) {
        return {
          success: false,
          data: [] as unknown as T,
          error: "No access token found",
        };
      }

      const user = await getUser(session);
      if (!user) {
        return {
          success: false,
          data: [] as unknown as T,
          error: "User not found",
        };
      }

      return await handler(user, ...args);
    } catch (error: any) {
      console.error("Auth middleware error:", error);
      return {
        success: false,
        data: [] as unknown as T,
        error: error?.message || "An error occurred",
      };
    }
  };
}
