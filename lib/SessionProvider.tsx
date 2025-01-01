"use client";

import { SessionProvider } from "next-auth/react";
import { PropsWithChildren } from "react"; // add this import

export function ClientProviders({ children }: PropsWithChildren) {
  // add type for props
  return <SessionProvider>{children}</SessionProvider>;
}
