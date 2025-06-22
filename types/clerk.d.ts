// Force TS server to re-read
import type { UserRole } from "@prisma/client";

declare module "@clerk/nextjs/server" {
  interface SessionClaims {
    metadata: {
      onboardingComplete?: boolean;
      companyId?: string;
      orgId?: string;
    };
    publicMetadata: {
      role: UserRole;
    };
  }
}

declare module "@clerk/nextjs/dist/types/server" {
  interface SessionClaims {
    metadata: {
      onboardingComplete?: boolean;
      companyId?: string;
      orgId?: string;
    };
    publicMetadata: {
      role: UserRole;
    };
  }
}
