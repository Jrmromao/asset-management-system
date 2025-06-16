import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { createClient } from "@supabase/supabase-js";

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    Credentials({
      name: "Supabase",
      credentials: {
        id: { label: "ID", type: "text" },
        email: { label: "Email", type: "email" },
        accessToken: { label: "Access Token", type: "text" },
      },
      async authorize(credentials) {
        if (
          !credentials?.id ||
          !credentials?.email ||
          !credentials?.accessToken
        ) {
          return null;
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
          console.error(
            "Supabase URL or Anon Key missing from environment variables.",
          );
          return null;
        }

        const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
          global: {
            headers: {
              Authorization: `Bearer ${credentials.accessToken}`,
            },
          },
        });

        try {
          const {
            data: { user },
            error,
          } = await supabaseClient.auth.getUser();

          if (error || !user) {
            console.error("Supabase auth error:", error?.message);
            return null;
          }

          return {
            id: user.id,
            email: user.email || "",
            name: user.user_metadata?.full_name || user.email || "",
            accessToken: credentials.accessToken,
          };
        } catch (e) {
          console.error("Unexpected error during Supabase auth:", e);
          return null;
        }
      },
    }),
  ],
} satisfies NextAuthConfig;
