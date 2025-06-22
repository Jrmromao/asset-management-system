import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/forgot-password(.*)",
  "/forgot-password/reset(.*)",
  "/sign-in/factor-two(.*)",
  "/api/webhooks/stripe",
  "/api/webhooks/clerk",
  "/privacy-policy",
  "/terms-of-service",
  "/onboarding-success",
]);

// Define auth routes that should redirect signed-in users to dashboard
const isAuthRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/forgot-password(.*)",
]);

// Define the metadata type
interface UserMetadata {
  onboardingComplete?: boolean;
  companyId?: string;
  role?: string;
}

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();
  const url = request.nextUrl;

  // Debug logging
  console.log("🔍 Middleware Debug:", {
    pathname: url.pathname,
    userId: userId ? "exists" : "none",
    isPublicRoute: isPublicRoute(request),
    isAuthRoute: isAuthRoute(request),
  });

  // For public routes, allow access regardless of auth status
  if (isPublicRoute(request)) {
    console.log("✅ Public route, allowing access");
    return NextResponse.next();
  }

  // If the user is not signed in, redirect them to the sign-in page
  if (!userId) {
    console.log("❌ No user ID, redirecting to sign-in");
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect_url", url.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // If signed-in user tries to access auth routes (except forgot-password), redirect to dashboard
  if (isAuthRoute(request) && !url.pathname.startsWith("/forgot-password")) {
    console.log("🔄 Auth route with signed user, redirecting to dashboard");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // For all other routes, allow access if user is signed in
  console.log("✅ User signed in, allowing access to:", url.pathname);
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
