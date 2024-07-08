import NextAuth from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"



export const authOptions = {
  secret: process.env.NEXT_AUTH_SECRET,
  jwt: {
    secret: process.env.NEXT_AUTH_SECRET!,
    maxAge:222,
  },
  pages: {
    signIn: "/auth/signin"
  },
  debug: process.env.DEBUG_AUTH === "true",
  session: {
    // 15 minute limit on the session
    maxAge:  900,
    updateAge:  600
  },
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_CLIENT_ID!,
      clientSecret: process.env.AZURE_CLIENT_SECRET!,
      tenantId: process.env.AZURE_TENANT_ID
    })
  ],
  callbacks: {
    // async redirect({ url, baseUrl }) {
    //   // replace trailing slash
    //   baseUrl = baseUrl.replace(/\/$/, "")
    //   url = url.replace(/\/$/, "")
    //
    //   // Allows callback URLs on the same origin
    //   if (new URL(url).origin === baseUrl && url !== baseUrl) {
    //     // return the original url
    //     if (!url.includes("callbackUrl")) return url
    //     // return the callbackUrl query parameter in the request
    //     return decodeURIComponent(
    //       url.substring(url.indexOf("callbackUrl") + 12)
    //     )
    //   }
    //   return baseUrl
    // },
    // async signIn(params) {
    //   return {
    //     ...params
    //   }
    // },
    // async jwt(params) {
    //   const { account, token } = params
    //   // remove picture in token since it will be too large for some users.
    //   delete token.picture
    //   if (account?.id_token) {
    //     const env = process.env.AZURE_DAEMON_APP_ENV
    //     // Used to put the whole accessToken on token, but it would be too big for the browser for Hertz employees.
    //     const payload = parseJwt(account.id_token)
    //
    //     const groupNames = "app_hertz_maintenance_portal"
    //     const prodGroupNames = "App_Hertz_Maintenance_Portal"
    //
    //     let fullUserGroupName
    //     if (env !== "prod") {
    //       fullUserGroupName = payload.groups?.find((group) =>
    //         group.startsWith(groupNames)
    //       )
    //     } else {
    //       fullUserGroupName = payload.groups?.find((group) =>
    //         group.startsWith(prodGroupNames)
    //       )
    //     }
    //
    //     let userGroup
    //     if (fullUserGroupName.startsWith(groupNames)) {
    //       userGroup = fullUserGroupName.slice(0, -4)
    //     } else if (fullUserGroupName.startsWith(prodGroupNames)) {
    //       userGroup = prodRolesMap[fullUserGroupName]
    //     } else {
    //       // default to field user if can't find a group.
    //       userGroup = ROLES.FIELD_USER
    //     }
    //
    //     token.userGroup = userGroup
    //   }
    //   return token
    // },
    // async session({ session: any, token: any }) {
    //   session.userGroup = token.userGroup
    //   return session
    // }
  }
}

export default NextAuth(authOptions)
