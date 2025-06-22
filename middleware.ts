import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define public routes
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/forgot-password(.*)",
  "/account-verification(.*)",
  "/privacy-policy(.*)",
  "/terms-of-service(.*)",
  "/api/webhooks(.*)",
  "/_next(.*)",
  "/favicon.ico",
  "/images(.*)",
  "/icons(.*)",
  "/api(.*)",
]);

const isOnboardingRoute = createRouteMatcher(["/sign-up(.*)"]);

// Define admin routes
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

// Define the metadata type
interface UserMetadata {
  onboardingComplete?: boolean;
  companyId?: string;
}

export default clerkMiddleware(async (auth, request) => {
  const { userId, sessionClaims } = await auth();
  const url = request.nextUrl;

  // Cast the metadata to the expected type
  const metadata = sessionClaims?.metadata as UserMetadata;

  // For users who are signed in but haven't completed onboarding,
  // redirect them to the sign-up page to complete the flow.
  if (userId && !metadata?.onboardingComplete) {
    // If the user is returning from a successful subscription, allow them to proceed.
    // The client-side will handle the session update.
    if (url.searchParams.get("subscription_success") === "true") {
      return NextResponse.next();
    }

    const isSignInRoute = url.pathname.startsWith("/sign-in");

    // Do not redirect if the user is on an onboarding, sign-in, root, or admin page
    if (
      !isOnboardingRoute(request) &&
      !isSignInRoute &&
      !isAdminRoute(request) &&
      url.pathname !== "/"
    ) {
      const onboardingUrl = new URL("/sign-up", request.url);
      return NextResponse.redirect(onboardingUrl);
    }
  }

  // If the user is signed in and has completed onboarding,
  // prevent them from accessing the sign-up page again.
  if (userId && metadata?.onboardingComplete) {
    if (isOnboardingRoute(request)) {
      const dashboardUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // Allow public routes
  if (isPublicRoute(request)) {
    return;
  }

  // Protect all other routes
  await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
