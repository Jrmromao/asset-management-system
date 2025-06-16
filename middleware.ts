import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

// Define routes that don't require authentication
const PUBLIC_ROUTES = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/forgot-password/confirm",
  "/account-verification",
  "/api", // Allow all API routes (customize as needed)
];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createClient(request, response);

  const pathname = request.nextUrl.pathname;
  console.log(`[middleware] Pathname: ${pathname}`);

  // Always use getUser() for secure auth in middleware!
  const {
    data: { user },
  } = await supabase.auth.getUser();
  console.log(`[middleware] User:`, user ? user.id : null);

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    console.log(`[middleware] Public route, allowing: ${pathname}`);
    return response;
  }

  // If not authenticated, redirect to sign-in
  if (!user) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", request.url);
    console.log(`[middleware] Not authenticated, redirecting to: ${signInUrl}`);
    return NextResponse.redirect(signInUrl);
  }

  // User is authenticated, allow request
  console.log(`[middleware] Authenticated user, allowing: ${pathname}`);
  return response;
}

export const config = {
  matcher: [
    /*
      Match all routes except for:
      - static files
      - public routes
    */
    "/((?!_next/static|_next/image|favicon.ico|sign-in|sign-up|forgot-password|forgot-password/confirm|account-verification|api).*)",
  ],
};
