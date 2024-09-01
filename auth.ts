import NextAuth from "next-auth"
import authConfig from "./auth.config"
import {findById} from "@/helpers/data";

export const {auth, handlers, signIn} = NextAuth({
    session: {strategy: "jwt"},
    callbacks: {
        async signIn({user}) {

            console.log(user)

            if (!user) return false
            return await findById(user?.id!);
        },

        async jwt({token}) {

            if (!token.sub)
                return token

            const existingUser = await findById(token.sub)
            if (!existingUser)
                return token

            token.role = existingUser.role.name

            return token
        },

        async session({session, token}) {
            if (token.sub && session.user) {
                session.user.id = token.sub
            }

            if (token.role && session.user) {
                session.user.role = token.role as string
            }

            return session
        }
    },
    ...authConfig
})

