import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { User as SupabaseUser } from "@supabase/supabase-js";

export async function getSupabaseSession() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookies().set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookies().set({ name, value: "", ...options });
        },
      },
    },
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export function withAuth<TArgs extends any[], TResult>(
  fn: (user: SupabaseUser, ...args: TArgs) => Promise<TResult>,
) {
  return async (...args: TArgs): Promise<TResult> => {
    const user = await getSupabaseSession();
    // console.log("User:", user);
    if (!user) {
      throw new Error("Unauthorized: No Supabase session found");
    }
    return fn(user, ...args);
  };
}

export function withAuthNoArgs<TResult>(
  fn: (user: SupabaseUser) => Promise<TResult>,
) {
  return async (): Promise<TResult> => {
    const user = await getSupabaseSession();
    if (!user) {
      throw new Error("Unauthorized: No Supabase session found");
    }
    return fn(user);
  };
}
