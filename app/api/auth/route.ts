import NextAuth, {NextAuthOptions} from "next-auth"
import GitHubProvider, {GithubProfile} from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import {NextAuthUser} from "../../../../models/user";
import {PrismaClient } from "@prisma/client";
import {PrismaAdapter} from "@next-auth/prisma-adapter";
import {cognitoSignIn} from "../../../../utils/AWSAuth";

const prisma = new PrismaClient()

const options: NextAuthOptions = {
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_ID ?? "",
            clientSecret: process.env.GITHUB_SECRET ?? "",
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        }),
        CredentialsProvider({
            type: "credentials",
            credentials: {},
            async authorize(credentials: any): Promise<any> {
                const {email, password} = credentials
                return cognitoSignIn(email, password)
                    .then((authenticatedUser: NextAuthUser) => {
                        return authenticatedUser
                    })
            }
        })
    ],
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: 'jwt',
        maxAge: +process.env.SESSION_TIMEOUT || 900,
        updateAge: +process.env.SESSION_UPDATE_TIMEOUT || 600
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/auth/sign-in"
    },
    debug: true,
};

const handler = NextAuth(options)
export { handler as GET, handler as POST }




