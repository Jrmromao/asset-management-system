import NextAuth, { type NextAuthConfig } from "next-auth";
import authConfig from "./auth.config"; // Your Supabase CredentialsProvider is in here
import { findUserBySupabaseId } from "@/helpers/data"; // RENAMED for clarity and function
import type { PrismaUserWithRelations } from "@/helpers/data"; // Assuming this type is exported from your data helpers
import type { JWT } from "next-auth/jwt";

export const authOptions: NextAuthConfig = {
  session: { strategy: "jwt" },
  providers: authConfig.providers, // Takes providers from auth.config.ts
  callbacks: {
    async signIn({ user, account, profile }) {
      // `user` is the object returned by the `authorize` function in your CredentialsProvider.
      // `user.id` at this point IS the Supabase User ID.
      if (!user || !user.id) {
        console.error("NextAuth SignIn CB: No user or user.id from authorize.");
        return false;
      }

      // Check if the Supabase-authenticated user has a corresponding record in your application's database.
      // This `findUserBySupabaseId` function MUST query your RDS using `user.id` (the Supabase ID)
      // against the field where you store this ID (e.g., `oauthId`).
      const appUser = await findUserBySupabaseId(user.id);

      if (!appUser) {
        console.warn(
          `NextAuth SignIn CB: User with Supabase ID ${user.id} not found in application database. Denying sign-in.`,
        );
        // You could redirect to a profile completion page or simply deny.
        // For example: return '/complete-profile?supabaseId=' + user.id;
        return false;
      }

      // If you need to pass data from `appUser` (your DB record) to the `jwt` callback,
      // you can't directly modify the `user` object here in `signIn` to add more properties
      // for the `jwt` callback if using only Credentials.
      // The `jwt` callback will receive the original `user` object from `authorize` on the first call.
      // So, the `jwt` callback will need to re-fetch `appUser`.
      return true; // Allow sign-in
    },

    async jwt({ token, user, account, profile, trigger }): Promise<JWT> {
      // `user` object is available on initial sign-in (from `authorize` fn).
      // `token.sub` is populated by NextAuth with `user.id` (Supabase User ID).

      const isInitialSignIn = !!user;

      if (isInitialSignIn && user?.id) {
        // Ensure token.sub is set on the very first call if not already.
        // And explicitly set token.id to be the Supabase User ID.
        token.sub = user.id;
        token.id = user.id; // Supabase User ID
        token.accessToken = user.accessToken;
      }

      if (!token.sub) {
        // This should not happen if signIn was successful and authorize returned a user with an id.
        console.error("NextAuth JWT CB: token.sub is missing.");
        return token;
      }

      // Fetch the user from your application's database using the Supabase ID (token.sub)
      // This ensures the JWT always has the latest app-specific user data.
      console.log("\n\n\n\ntoken.sub", token.sub);

      const existingUserInDb = await findUserBySupabaseId(token.sub);

      if (!existingUserInDb) {
        // This case should ideally be caught by the `signIn` callback.
        // If user was deleted from your DB after session started, this logs them out effectively.
        console.warn(
          `NextAuth JWT CB: User with Supabase ID ${token.sub} no longer in DB. Returning minimal token.`,
        );
        // Return a minimal token, potentially missing role/companyId, which might restrict access.
        // Or, you could return an empty object or specific error indicator if your session callback handles it.
        return {
          ...token,
          role: undefined,
          companyId: undefined,
          name: undefined,
          email: undefined,
        };
      }

      // Enrich the token with data from your application's database
      token.name = existingUserInDb.name; // Name from your RDS
      token.email = existingUserInDb.email; // Email from your RDS
      if (existingUserInDb.role) {
        token.role = existingUserInDb.role.name;
      }
      if (existingUserInDb.company) {
        token.companyId = existingUserInDb.company.id;
      }
      // token.id should already be the Supabase ID (from token.sub)

      return token;
    },

    async session({ session, token }) {
      // `token` is the enriched JWT from the `jwt` callback.
      // Populate `session.user` with data from the token.
      if (token.sub && session.user) {
        session.user.id = token.sub; // Supabase User ID
      }
      if (token.name && session.user) {
        session.user.name = token.name;
      }
      if (token.email && session.user) {
        session.user.email = token.email;
      }
      if (token.role && session.user) {
        session.user.role = token.role;
      }
      if (token.companyId && session.user) {
        session.user.companyId = token.companyId;
      }
      if (token.accessToken && session.user) {
        session.user.accessToken = token.accessToken;
      }

      return session;
    },
  },
  // Important: Define pages for custom login, error, etc., if needed.
  // pages: {
  //   signIn: '/auth/login',
  //   error: '/auth/error',
  // },
  // Ensure NEXTAUTH_SECRET is set in your environment variables
  secret: process.env.NEXTAUTH_SECRET,
};

// Export auth utilities
export const { auth, signIn, signOut } = NextAuth(authOptions);
