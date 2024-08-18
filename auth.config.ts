import type {NextAuthConfig} from "next-auth"
import Credentials from "@auth/core/providers/credentials";
import {loginSchema} from "@/lib/schemas";
import {findByEmail} from "@/helpers/data"
import Google from "@auth/core/providers/google";
import GitHub from "@auth/core/providers/github";
import {cognitoSignIn} from "@/lib/AWSAuth";
import {LiaObjectGroup} from "react-icons/lia";
import {prisma} from "@/app/db";

// GITHUB_ID=Ov23lihUNUTkcyF2C7R6
// GITHUB_SECRET=25d9c29cfbe2b58b3f4722cc0d154632a9329846

export default {
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
        }),
        GitHub(
            {
                clientId: 'Ov23lihUNUTkcyF2C7R6',
                clientSecret: '25d9c29cfbe2b58b3f4722cc0d154632a9329846'
            }
        ), Credentials({


            name: "Credentials",
            async authorize(credentials) {


                const validation = loginSchema.safeParse(credentials)
                if (!validation.success) return null
                const {email, password} = validation.data
                const result = await cognitoSignIn(email, password)
                if (!result) return null
                const user = await findByEmail(email)
                if (!user) return null

                console.log({
                    ...user,
                    ...result
                })
                return {
                    ...user,
                    ...result
                }

            }

        })]
} satisfies NextAuthConfig