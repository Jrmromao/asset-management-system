import type {NextAuthConfig} from "next-auth"
import Credentials from "@auth/core/providers/credentials";
import {loginSchema} from "@/lib/schemas";
import Google from "@auth/core/providers/google";
import {signIn} from "@/services/aws/Cognito";

export default {
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
        }),
        Credentials({
            name: "Credentials",
            async authorize(credentials) {
                const validation = loginSchema.safeParse(credentials)
                if (!validation.success) return null
                const {email, password} = validation.data
                const result = await signIn(email, password)

                return {
                    id: 'result.user.sub',
                    name: 'John Doe',
                    email: 'jSb7T@example.com',
                    image: 'https://i.pravatar.cc/300'
                }
            }

        })]
} satisfies NextAuthConfig