import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { findById } from "@/helpers/data";

export const { auth, handlers, signIn } = NextAuth({
  session: { strategy: "jwt" },
  providers: authConfig.providers, // Take just the providers from authConfig
  callbacks: {
    async signIn({ user }) {
      if (!user) return false;
      return await findById(user?.id!);
    },

    async jwt({ token }) {
      if (!token.sub) return token;

      const existingUser = await findById(token.sub);
      if (!existingUser) return token;

      token.role = existingUser.role.name;
      token.companyId = existingUser.company.id;

      return token;
    },

    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        // Make sure name is being passed if it exists in token
        session.user.name = token.name || session.user.name;
      }

      if (token.role && session.user) {
        session.user.companyId = token.companyId as string;
        session.user.role = token.role as string;
      }

      return session;
    },
  },
});
