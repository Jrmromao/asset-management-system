import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from 'next/server'

// Rate limiting store (in production, use Redis or external service)
const rateLimit = new Map<string, { count: number; resetTime: number }>()

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 1000 // requests per window (increased for development)
const API_RATE_LIMIT_MAX_REQUESTS = 500 // stricter for API routes (increased for development)

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded ? forwarded.split(',')[0].trim() : realIp || 'unknown'
  return `${ip}-${request.nextUrl.pathname.startsWith('/api') ? 'api' : 'web'}`
}

function checkRateLimit(request: NextRequest): boolean {
  const key = getRateLimitKey(request)
  const now = Date.now()
  const maxRequests = request.nextUrl.pathname.startsWith('/api') 
    ? API_RATE_LIMIT_MAX_REQUESTS 
    : RATE_LIMIT_MAX_REQUESTS

  const record = rateLimit.get(key)
  
  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimit.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }
  
  if (record.count >= maxRequests) {
    return false
  }
  
  record.count++
  return true
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.com https://*.clerk.com https://*.clerk.accounts.dev https://vercel.live",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.openai.com https://clerk.com https://*.clerk.com https://*.clerk.accounts.dev https://vercel.live wss:",
    "frame-src 'self' https://clerk.com https://*.clerk.com https://*.clerk.accounts.dev",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ')
  
  response.headers.set('Content-Security-Policy', csp)
  
  return response
}

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/about",
  "/careers", 
  "/contact",
  "/privacy-policy",
  "/terms-of-service",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/forgot-password(.*)",
  "/forgot-password/reset(.*)",
  "/sign-in/factor-two(.*)",
  "/accept-invitation(.*)",
  "/onboarding-success",
  "/api/webhooks/stripe",
  "/api/webhooks/clerk",
  "/api/health",
  "/api/contact",
  "/api/validate(.*)",
  "/api/validate-invitation"
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

  // Check rate limiting first
  if (!checkRateLimit(request)) {
    console.log('🚫 Rate limit exceeded for:', getRateLimitKey(request))
    return new NextResponse(
      JSON.stringify({ error: 'Too many requests. Please try again later.' }),
      { 
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '900' // 15 minutes
        }
      }
    )
  }

  // For public routes, allow access regardless of auth status
  if (isPublicRoute(request)) {
    console.log("✅ Public route, allowing access");
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // If the user is not signed in, redirect them to the sign-in page
  if (!userId) {
    console.log("❌ No user ID, redirecting to sign-in");
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect_url", url.pathname);
    const response = NextResponse.redirect(signInUrl);
    return addSecurityHeaders(response);
  }

  // If signed-in user tries to access auth routes (except forgot-password), redirect to dashboard
  if (isAuthRoute(request) && !url.pathname.startsWith("/forgot-password")) {
    console.log("🔄 Auth route with signed user, redirecting to dashboard");
    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    return addSecurityHeaders(response);
  }

  // For all other routes, allow access if user is signed in
  console.log("✅ User signed in, allowing access to:", url.pathname);
  const response = NextResponse.next();
  return addSecurityHeaders(response);
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/api/(.*)",
  ],
};
