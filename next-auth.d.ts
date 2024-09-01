import NextAuth, {type DefaultSession} from "next-auth"

export type ExtendendUser = DefaultSession["user"] & {
    role: string,
    companyId: string
}

declare module "next-auth" {
    interface Session {
        user: ExtendendUser
    }
}