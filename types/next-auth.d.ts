import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name?: string | null;
    accessToken?: string;
  }

  interface Session {
    user: User & {
      role?: string;
      companyId?: string;
      accessToken?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    companyId?: string;
    accessToken?: string;
  }
}
