import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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
  return PUBLIC_ROUTES.some((route) => {
    // Exact match
    if (route === path) return true;
    // Path starts with route (for directories)
    if (route.endsWith("/*") && path.startsWith(route.slice(0, -2)))
      return true;
    // Check if the path starts with any of the public routes
    return path.startsWith(route);
  });
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          // Set cookie on the request
          request.cookies.set(name, value);
          // Set cookie on the response
          response.cookies.set(name, value, options);
        },
        remove(name, options) {
          // Remove cookie from the request
          request.cookies.delete(name);
          // Remove cookie from the response
          response.cookies.delete(name);
        },
      },
    },
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check for admin routes
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/admin") && user) {
    const { data } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!data || data.role !== "admin") {
      // Redirect non-admin users to home page
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  if (!user && !isPublicRoute(pathname)) {
    // no user, redirect to sign-in page
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    return NextResponse.redirect(url);
  }

  return response;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Handle common typos in URLs
  const pathCorrections: { [key: string]: string } = {
    "/assetes/": "/assets/",
    "/accessorys/": "/accessories/",
    "/licence/": "/license/",
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
  const supabaseResponse = await updateSession(request);

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
