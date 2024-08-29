import NextAuth from "next-auth"
import {PrismaAdapter} from "@auth/prisma-adapter"
import authConfig from "./auth.config"
import {prisma} from "@/app/db";


export const {auth, handlers, signIn, signOut} = NextAuth({
    // adapter: PrismaAdapter(prisma),
    session: {strategy: "jwt"},
    callbacks: {

        async jwt({token, user}) {

            console.log(user)

            return token
        },


        async session({session, token}) {
            if (token.sub && session.user) {
                session.user.id = token.sub
            }

            return session
        }
    },
   ...authConfig
})

