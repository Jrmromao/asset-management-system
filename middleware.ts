import authConfig from "./auth.config"
import NextAuth from "next-auth"
import {apiAuthPrefix, authRoutes, DEFAULT_LOGIN_REDIRECT, publicRoutes} from '@/routes'
import {NextRequest, NextResponse} from 'next/server'
import {validateCompany} from "@/lib/actions/company.actions"

const {auth} = NextAuth(authConfig)

export default auth(async (req) => {
    const {nextUrl} = req
    const hostname = req.headers.get('host') || ''

    // Subdomain validation (uncomment when ready to implement)
    // const currentHost = process.env.NODE_ENV === "production" ? "ecokeepr.com" : "localhost:3000"
    // const subdomain = hostname.replace(`.${currentHost}`, '')
    // if (!validateCompany(subdomain)) {
    //     return new NextResponse(null, { status: 404 })
    // }

    const isLoggedIn = !!req.auth
    const isAPIAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix)
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname)
    const isAuthRoute = authRoutes.includes(nextUrl.pathname)

    if (isAPIAuthRoute) {
        return
    }

    if (isAuthRoute) {
        if (isLoggedIn) {
            return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
        }
        return
    }

    if (!isLoggedIn && !isPublicRoute) {
        let signInUrl = new URL('/sign-in', nextUrl)
        // Optionally preserve the current URL as a redirect parameter
        signInUrl.searchParams.set('callbackUrl', nextUrl.pathname)
        return Response.redirect(signInUrl)
    }
})

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
}