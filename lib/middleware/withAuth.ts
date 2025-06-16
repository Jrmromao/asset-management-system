import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function getSupabaseSession() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: () => cookies() },
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export function withAuth<TArgs extends any[], TResult>(
  fn: (session: any, ...args: TArgs) => Promise<TResult>,
) {
  return async (...args: TArgs): Promise<TResult> => {
    const session = await getSupabaseSession();
    if (!session) {
      throw new Error("Unauthorized: No Supabase session found");
    }
    return fn(session, ...args);
  };
}

export function withAuthNoArgs<TResult>(
  fn: (session: any) => Promise<TResult>,
) {
  return async (): Promise<TResult> => {
    const session = await getSupabaseSession();
    if (!session) {
      throw new Error("Unauthorized: No Supabase session found");
    }
    return fn(session);
  };
}
