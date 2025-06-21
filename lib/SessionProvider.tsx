"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

const SessionContext = createContext<{
  session: Session | null;
  user: User | null;
}>({ session: null, user: null });

export function SessionProvider({
  children,
  session: initialSession,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  const supabase = createClient();
  const [session, setSession] = useState<Session | null>(initialSession);
  const [user, setUser] = useState<User | null>(initialSession?.user ?? null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <SessionContext.Provider value={{ session, user }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
