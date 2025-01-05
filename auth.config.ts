import type { NextAuthConfig } from "next-auth";
import Credentials from "@auth/core/providers/credentials";
import { loginSchema } from "@/lib/schemas";
import Google from "@auth/core/providers/google";
import { signInUser } from "@/services/aws/Cognito";
import { findByEmail } from "@/helpers/data";

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    Credentials({
      name: "Credentials",
      async authorize(credentials) {
        try {
          // First validate the credentials
          const validation = loginSchema.safeParse(credentials);
          if (!validation.success) {
            console.log("Validation failed:", validation.error);
            return null;
          }

          const { email, password } = validation.data;

          // Attempt Cognito sign in
          const cognitoResponse = await signInUser(email, password);

          // Log the response for debugging
          console.log("Cognito response:", cognitoResponse);

          if (!cognitoResponse.success) {
            console.log("Cognito auth failed:", cognitoResponse.message);
            return null;
          }
          const user = await findByEmail(email);
          if (!user) {
            console.log("User not found in database");
            return null;
          }

          return user;
        } catch (error) {
          console.error("Detailed auth error:", error);
          return null;
        }
      },
    }),
  ],
} satisfies NextAuthConfig;
