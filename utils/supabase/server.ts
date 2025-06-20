// utils/supabase/server.ts (or wherever you define your server client)
"use server"; // Essential for Server Components/Actions

import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export const createClient = async () => {
  // Make this function async
  const cookieStore = await cookies(); // <--- Add await here

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // Now cookieStore is correctly typed as ReadonlyRequestCookies
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
            console.error(
              "Error setting cookies in Server Component (may be ignorable):",
              error,
            );
          }
        },
      },
    },
  );
};
