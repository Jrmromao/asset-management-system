# Migration Guide: Supabase Auth to Clerk

## Current Architecture Analysis

Your current setup uses:
- **Supabase Auth** for authentication
- **Custom SessionProvider** for client-side state management
- **Middleware** for route protection and admin role checking
- **Server-side auth utilities** for API routes
- **Custom auth service** for user management

## Migration Steps

### 1. Install Clerk Dependencies

```bash
npm install @clerk/nextjs
# or
yarn add @clerk/nextjs
```

### 2. Environment Variables Setup

Replace your Supabase auth environment variables with Clerk ones:

```env
# Remove these
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Add these
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### 3. Update Root Layout

Replace your current `app/layout.tsx`:

```tsx:app/layout.tsx
import { Inter, IBM_Plex_Serif } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import QueryProvider from "@/components/providers/QueryClientProvider";

export const dynamic = "force-dynamic";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const iBMPlexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-ibm-plex-serif",
});

export const metadata = {
  title: "Asset Management Pro",
  description: "A modern asset management solution for your business.",
  icons: {
    icon: "/icons/logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.variable} ${iBMPlexSerif.variable}`}>
          <QueryProvider>
            {children}
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

### 4. Replace Middleware

Replace your current `middleware.ts` with Clerk's middleware:

```tsx:middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define public routes
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/forgot-password(.*)',
  '/account-verification(.*)',
  '/privacy-policy(.*)',
  '/terms-of-service(.*)',
  '/api/webhooks(.*)',
  '/_next(.*)',
  '/favicon.ico',
  '/images(.*)',
  '/icons(.*)',
])

// Define admin routes
const isAdminRoute = createRouteMatcher(['/admin(.*)'])

export default clerkMiddleware(async (auth, request) => {
  // Allow public routes
  if (isPublicRoute(request)) {
    return
  }

  // Protect admin routes with admin role
  if (isAdminRoute(request)) {
    await auth.protect({ role: 'org:admin' })
    return
  }

  // Protect all other routes
  await auth.protect()
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### 5. Create Clerk Auth Service

Replace `services/auth/supabaseAuthService.ts` with a new Clerk service:

```tsx:services/auth/clerkAuthService.ts
import { clerkClient } from '@clerk/nextjs/server'
import { auth } from '@clerk/nextjs/server'

interface AuthUserMetadata {
  firstName: string
  lastName: string
  companyId: string
  role: string
}

interface CreateAuthUserParams {
  email: string
  password: string
  metadata: AuthUserMetadata
}

interface AuthResponse<T> {
  data: T | null
  error: Error | null
}

class ClerkAuthService {
  async createUser({
    email,
    password,
    metadata,
  }: CreateAuthUserParams): Promise<AuthResponse<any>> {
    try {
      const user = await clerkClient.users.createUser({
        emailAddress: [email],
        password,
        firstName: metadata.firstName,
        lastName: metadata.lastName,
        publicMetadata: {
          companyId: metadata.companyId,
          role: metadata.role,
        },
      })

      return {
        data: user,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: error as Error,
      }
    }
  }

  async getCurrentUser() {
    try {
      const { userId } = await auth()
      if (!userId) return null
      
      const user = await clerkClient.users.getUser(userId)
      return user
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  async getUserById(userId: string) {
    try {
      const user = await clerkClient.users.getUser(userId)
      return user
    } catch (error) {
      console.error('Error getting user by ID:', error)
      return null
    }
  }

  async updateUser(userId: string, updates: any) {
    try {
      const user = await clerkClient.users.updateUser(userId, updates)
      return user
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }
}

export const authService = new ClerkAuthService()
```

### 6. Replace Session Provider

Replace `lib/SessionProvider.tsx` with Clerk's built-in hooks:

```tsx:lib/SessionProvider.tsx
"use client"

import { useUser, useAuth } from "@clerk/nextjs"
import { createContext, useContext } from "react"

const SessionContext = createContext<{
  user: any
  isSignedIn: boolean
  isLoaded: boolean
}>({
  user: null,
  isSignedIn: false,
  isLoaded: false,
})

export function SessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isSignedIn, isLoaded } = useUser()

  return (
    <SessionContext.Provider value={{ user, isSignedIn, isLoaded }}>
      {children}
    </SessionContext.Provider>
  )
}

export const useSession = () => useContext(SessionContext)
```

### 7. Update User Actions

Replace `lib/actions/user.actions.ts` to use Clerk:

```tsx:lib/actions/user.actions.ts
"use server"

import { Prisma, User as PrismaUser } from "@prisma/client"
import { parseStringify, validateEmail } from "@/lib/utils"
import {
  accountVerificationSchema,
  forgotPasswordConfirmSchema,
  forgotPasswordSchema,
  loginSchema,
  userSchema,
} from "@/lib/schemas"
import { revalidatePath } from "next/cache"
import { getRoleById } from "@/lib/actions/role.actions"
import { z } from "zod"
import { prisma } from "@/app/db"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { withAuth, AuthResponse } from "@/lib/middleware/withAuth"

// ... existing code ...

// Login (client-side, no withAuth needed)
export async function login(
  values: z.infer<typeof loginSchema>,
): Promise<AuthResponse<null>> {
  try {
    const validation = loginSchema.safeParse(values)
    if (!validation.success) {
      return { success: false, error: "Invalid email or password", data: null }
    }
    
    // Clerk handles login through the UI components
    // This function can be simplified or removed
    return { success: true, data: null }
  } catch (error) {
    return {
      success: false,
      error: "Login failed due to an unexpected error.",
      data: null,
    }
  }
}

export const createUser = withAuth(
  async (
    user,
    values: z.infer<typeof userSchema> & { companyId?: string },
  ): Promise<AuthResponse<PrismaUser | undefined>> => {
    try {
      const validation = userSchema.safeParse(values)
      if (!validation.success) {
        return { success: false, error: validation.error.message, data: undefined }
      }

      const { roleId, ...userData } = validation.data
      const roleName = await getRoleById(roleId)

      if (!roleName) {
        return { success: false, error: "Invalid role", data: undefined }
      }

      const userToRegister = {
        ...userData,
        role: roleName,
        companyId: values.companyId,
      }

      let createdPrismaUser: PrismaUser

      if (roleName === "Lonee") {
        createdPrismaUser = await createPrismaUser({ data: userToRegister })
      } else {
        // Create user in Clerk first
        const clerkUser = await clerkClient.users.createUser({
          emailAddress: [userToRegister.email],
          password: userToRegister.password!,
          firstName: userToRegister.firstName,
          lastName: userToRegister.lastName,
          publicMetadata: {
            companyId: userToRegister.companyId,
            role: roleName,
          },
        })

        // Then create in Prisma
        createdPrismaUser = await createPrismaUser({
          data: userToRegister,
          clerkUserId: clerkUser.id,
        })
      }

      return { success: true, data: parseStringify(createdPrismaUser) }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, error: error.message, data: undefined }
      }
      return {
        success: false,
        error: "User creation failed due to an unexpected error.",
        data: undefined,
      }
    }
  },
)

// ... rest of the file remains similar but uses Clerk instead of Supabase ...
```

### 8. Update Auth Middleware

Replace `lib/middleware/withAuth.ts`:

```tsx:lib/middleware/withAuth.ts
import { auth } from "@clerk/nextjs/server"

export type AuthResponse<T> = {
  success: boolean
  data: T
  error?: string
}

export function withAuth<T, P extends any[]>(
  handler: (user: any, ...args: P) => Promise<AuthResponse<T>>,
): (...args: P) => Promise<AuthResponse<T>> {
  return async (...args: P): Promise<AuthResponse<T>> => {
    try {
      const { userId } = await auth()
      
      if (!userId) {
        return {
          success: false,
          data: [] as unknown as T,
          error: "Authentication required",
        }
      }

      const user = await auth()
      if (!user) {
        return {
          success: false,
          data: [] as unknown as T,
          error: "User not found",
        }
      }

      return await handler(user, ...args)
    } catch (error: any) {
      console.error("Auth middleware error:", error)
      return {
        success: false,
        data: [] as unknown as T,
        error: error?.message || "An error occurred",
      }
    }
  }
}
```

### 9. Update Components

Replace authentication-related components to use Clerk:

```tsx:components/forms/LoginForm.tsx
"use client"

import { SignIn } from "@clerk/nextjs"
import { useSearchParams } from "next/navigation"

const LoginForm = () => {
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get("redirectUrl") || "/"

  return (
    <div className="flex-center size-full max-sm:px-6">
      <SignIn 
        redirectUrl={redirectUrl}
        appearance={{
          elements: {
            formButtonPrimary: "bg-primary hover:bg-primary/90",
            card: "shadow-lg",
          },
        }}
      />
    </div>
  )
}

export default LoginForm
```

```tsx:components/forms/SignUpForm.tsx
"use client"

import { SignUp } from "@clerk/nextjs"
import { useSearchParams } from "next/navigation"

const SignUpForm = () => {
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get("redirectUrl") || "/"

  return (
    <div className="flex-center size-full max-sm:px-6">
      <SignUp 
        redirectUrl={redirectUrl}
        appearance={{
          elements: {
            formButtonPrimary: "bg-primary hover:bg-primary/90",
            card: "shadow-lg",
          },
        }}
      />
    </div>
  )
}

export default SignUpForm
```

### 10. Update Hooks

Replace `hooks/useSupabase.ts` with Clerk hooks:

```tsx:hooks/useAuth.ts
import { useUser, useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export function useAuth() {
  const { user, isSignedIn, isLoaded } = useUser()
  const { signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/sign-in")
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  return {
    user,
    isSignedIn,
    isLoaded,
    signOut: handleSignOut,
  }
}
```

### 11. Update API Routes

Replace your auth API routes to use Clerk:

```tsx:app/api/auth/[...nextauth]/route.ts
// Remove this file - Clerk handles auth automatically
```

### 12. Update Database Schema

Update your Prisma schema to include Clerk user ID:

```prisma:prisma/schema.prisma
model User {
  id            String   @id @default(cuid())
  clerkUserId   String?  @unique // Add this field
  email         String   @unique
  firstName     String
  lastName      String
  // ... rest of your fields
}
```

### 13. Migration Script

Create a migration script to transfer existing users:

```tsx:scripts/migrate-users.ts
import { prisma } from "@/app/db"
import { clerkClient } from "@clerk/nextjs/server"

async function migrateUsers() {
  try {
    // Get all users from your database
    const users = await prisma.user.findMany()
    
    for (const user of users) {
      // Create user in Clerk
      const clerkUser = await clerkClient.users.createUser({
        emailAddress: [user.email],
        firstName: user.firstName,
        lastName: user.lastName,
        publicMetadata: {
          companyId: user.companyId,
          role: user.role,
        },
      })
      
      // Update database with Clerk user ID
      await prisma.user.update({
        where: { id: user.id },
        data: { clerkUserId: clerkUser.id },
      })
    }
    
    console.log("Migration completed successfully")
  } catch (error) {
    console.error("Migration failed:", error)
  }
}

migrateUsers()
```

### 14. Clean Up

Remove these files after migration:
- `utils/supabase/` (entire directory)
- `lib/SessionProvider.tsx` (replaced)
- `hooks/useSupabase.ts` (replaced)
- `services/auth/supabaseAuthService.ts` (replaced)
- `app/api/auth/login/route.ts` (replaced)
- `app/api/auth/` (entire directory)

## Key Benefits of Migration

1. **Simplified Authentication**: Clerk handles all auth flows automatically
2. **Better Security**: Built-in security features and compliance
3. **User Management**: Advanced user management dashboard
4. **Multi-factor Authentication**: Built-in MFA support
5. **Social Logins**: Easy integration with Google, GitHub, etc.
6. **Role-based Access**: Built-in role and permission system
7. **Webhooks**: Real-time user events
8. **Analytics**: Built-in user analytics

## Testing Checklist

- [ ] Sign up flow works
- [ ] Sign in flow works
- [ ] Password reset works
- [ ] Email verification works
- [ ] Admin routes are protected
- [ ] User roles work correctly
- [ ] Session persistence works
- [ ] Sign out works
- [ ] API routes are protected
- [ ] Middleware redirects work

This migration will significantly simplify your authentication system while providing more robust features and better security. 