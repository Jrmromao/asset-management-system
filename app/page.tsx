import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import LandingPage from "./(root)/(public)/page";

export default async function Page() {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            // Convert Supabase cookie options to Next.js cookie options
            const { maxAge, ...cookieOptions } = options;
            cookieStore.set(name, value, {
              ...cookieOptions,
              maxAge: maxAge ?? undefined,
            });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            const { maxAge, ...cookieOptions } = options;
            cookieStore.set(name, "", {
              ...cookieOptions,
              maxAge: 0,
            });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <LandingPage />;
  }

  return redirect("/admin");
}
