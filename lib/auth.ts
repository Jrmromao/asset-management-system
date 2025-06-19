import { createClient } from "@/utils/supabase/server";

export const authOptions = {
  providers: [],
  callbacks: {
    async session({ session }: any) {
      try {
        const supabase = await createClient();
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          return session;
        }

        return {
          ...session,
          user: {
            ...session.user,
            ...user,
          },
        };
      } catch (error) {
        console.error("[AUTH_SESSION_ERROR]", error);
        return session;
      }
    },
    async signIn({ user }: any) {
      try {
        if (!user?.email) {
          return false;
        }

        const supabase = await createClient();
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error || !profile) {
          // Create profile if it doesn't exist
          const { error: createError } = await supabase
            .from("profiles")
            .insert([
              {
                id: user.id,
                email: user.email,
                name: user.name || user.email.split("@")[0],
              },
            ]);

          if (createError) {
            console.error("[AUTH_CREATE_PROFILE_ERROR]", createError);
            return false;
          }
        }

        return true;
      } catch (error) {
        console.error("[AUTH_SIGN_IN_ERROR]", error);
        return false;
      }
    },
  },
};
