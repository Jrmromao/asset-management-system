"use client";

import { SessionProvider as Provider } from "next-auth/react";

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider refetchInterval={5 * 60 * 1000} refetchOnWindowFocus={false}>
      {children}
    </Provider>
  );
}
