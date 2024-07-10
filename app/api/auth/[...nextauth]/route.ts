import NextAuth, {NextAuthOptions} from "next-auth"
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import {NextAuthUser} from "@/models/user";
import {PrismaClient} from "@prisma/client";
import {cognitoSignIn} from "@/lib/AWSAuth";


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
    session: {
        strategy: 'jwt',
        maxAge:  900,
        updateAge:  600
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/sign-in"
    },
    debug: true,

    callbacks: {
        async jwt({ token, user, account, profile, isNewUser }) {
            if (user) {
                token.id = user.id;
            }
            if (account) {
                token.accessToken = account.access_token;
                console.log(token)
            }
            return token;
        },
    },


};

const handler = NextAuth(options)
export {handler as GET, handler as POST}




