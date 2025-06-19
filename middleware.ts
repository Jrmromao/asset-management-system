import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// Define routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/forgot-password/confirm",
  "/account-verification",
  "/privacy-policy",
  "/terms-of-service",
  "/api/auth", // Auth-related API routes
  "/api/webhooks", // Webhook endpoints
  "/_next", // Next.js internal routes
  "/favicon.ico",
  "/images",
  "/icons",
];

// Function to check if a path matches any of the public routes
function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some(route => {
    // Exact match
    if (route === path) return true;
    // Path starts with route (for directories)
    if (route.endsWith('/*') && path.startsWith(route.slice(0, -2))) return true;
    // Check if the path starts with any of the public routes
    return path.startsWith(route);
  });
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Handle common typos in URLs
  const pathCorrections: { [key: string]: string } = {
    '/assetes/': '/assets/',
    '/accessorys/': '/accessories/',
    '/licence/': '/license/',
  };
  
  // URL correction logic
  for (const [wrongPath, correctPath] of Object.entries(pathCorrections)) {
    if (pathname.startsWith(wrongPath)) {
      const correctedPath = pathname.replace(wrongPath, correctPath);
      const url = new URL(correctedPath, request.url);
      return NextResponse.redirect(url);
    }
  }

  // Allow access to public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // For all other routes, require authentication
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Redirect to sign-in page with callback URL
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(signInUrl);
  }

  return res;
}

export const config = {
  matcher: [
    // Match all routes except static files and API routes that need to be public
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
