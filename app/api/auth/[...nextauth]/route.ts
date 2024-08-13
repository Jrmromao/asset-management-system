import NextAuth, {NextAuthOptions} from "next-auth"
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import {PrismaClient} from "@prisma/client";
import {cognitoSignIn} from "@/lib/AWSAuth";
import { JWT } from 'next-auth/jwt';
import { SignJWT, jwtVerify } from 'jose';
import  * as jose  from 'jose';
import { createSecretKey } from 'crypto';
import crypto from "crypto"

interface CustomJWT {
    id?: string;
    email?: string;
}

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
                    .then((user) => {
                        return {
                            name: 'Joao',
                            email: user.email,
                        }
                    })
            }
        })
    ],
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60,
    },
    secret: process.env.NEXTAUTH_SECRET,

    // jwt: {
    //
    //     decode: async ({ token }) => {
    //         if (!token) {
    //             throw new Error('No token provided');
    //         }
    //         const key = createSecretKey(process.env.NEXTAUTH_SECRET as string, 'utf-8');
    //         const { payload } = await jwtVerify(token, key, {
    //             algorithms: ['HS256'],
    //         });
    //         return payload;
    //     },
    // },

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
