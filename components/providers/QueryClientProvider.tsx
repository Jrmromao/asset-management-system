"use client";

import { QueryClient, QueryClientProvider as QCP } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { type ReactNode, useState } from "react";

interface QueryProviderProps {
  children: ReactNode;
}

export default function QueryClientProvider({ children }: QueryProviderProps) {
  // Ensure QueryClient is correctly instantiated
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QCP client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QCP>
  );
}
