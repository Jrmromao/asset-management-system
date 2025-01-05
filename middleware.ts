import authConfig from "./auth.config";
import NextAuth from "next-auth";
import {
  apiAuthPrefix,
  authRoutes,
  DEFAULT_LOGIN_REDIRECT,
  publicRoutes,
} from "@/routes";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const hostname = req.headers.get("host") || "";

  const isLoggedIn = !!req.auth;
  const isAPIAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isValidationRoute = nextUrl.pathname.startsWith("/api/validate");

  // Handle validation routes
  if (isValidationRoute) {
    return; // void instead of null
  }

  // Handle API auth routes
  if (isAPIAuthRoute) {
    return; // void instead of null
  }

  // Handle auth routes (like sign-in, sign-up)
  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return; // void instead of null
  }

  // Handle protected routes
  if (!isLoggedIn && !isPublicRoute) {
    const signInUrl = new URL("/sign-in", nextUrl);
    signInUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return Response.redirect(signInUrl);
  }

  // Allow request to continue
  return;
}) as any; // Temporary type assertion if needed

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
