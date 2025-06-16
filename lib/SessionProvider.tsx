"use client";

import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { PropsWithChildren } from "react"; // add this import
import { supabase } from "@/lib/supabaseClient";

export function ClientProviders({ children }: PropsWithChildren) {
  // add type for props
  return (
    <SessionContextProvider supabaseClient={supabase}>
      {children}
    </SessionContextProvider>
  );
}
