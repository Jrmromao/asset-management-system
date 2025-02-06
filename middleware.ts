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

  if (isValidationRoute) {
    return;
  }

  if (isAPIAuthRoute) {
    return;
  }

  // Handle auth routes (like sign-in, sign-up)
  if (isAuthRoute) {
    if (isLoggedIn) {
      // Check if there's a callbackUrl in the search parameters
      const callbackUrl = nextUrl.searchParams.get("callbackUrl");
      if (callbackUrl) {
        // Validate the callback URL to prevent open redirect vulnerabilities
        const validatedUrl = validateCallbackUrl(callbackUrl);
        if (validatedUrl) {
          return Response.redirect(new URL(validatedUrl, nextUrl));
        }
      }
      // If no valid callback URL, redirect to default
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return;
  }

  // Handle protected routes
  if (!isLoggedIn && !isPublicRoute) {
    const signInUrl = new URL("/sign-in", nextUrl);
    // Ensure the full pathname with query parameters is captured
    signInUrl.searchParams.set(
      "callbackUrl",
      nextUrl.href.replace(nextUrl.origin, ""),
    );
    return Response.redirect(signInUrl);
  }

  return;
}) as any;

// Helper function to validate callback URLs
function validateCallbackUrl(url: string): string | null {
  // Basic validation - ensure the URL starts with a forward slash
  if (!url.startsWith("/")) return null;

  // Add more validation as needed, for example:
  // - Check against allowed paths
  // - Prevent external redirects
  // - Sanitize the URL

  return url;
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
