// components/providers/Providers.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ClientProviders } from "@/lib/SessionProvider";
import { type ReactNode, useState } from "react";
import { Toaster } from "sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import CookieBanner from "@/components/cookies/CookieBanner";
import { CookiePreferences } from "@/components/cookies/CookieManager";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            retry: 1,
            refetchOnMount: true,
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
          },
          mutations: {
            retry: 1,
            networkMode: "always",
          },
        },
      }),
  );

  const [showGA, setShowGA] = useState<boolean>(false);

  const handlePreferencesChange = (preferences: CookiePreferences) => {
    setShowGA(preferences.analytics);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ClientProviders>
        <ThemeProvider
          attribute="class"
          defaultTheme="newyork"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster richColors />
          {showGA && process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
            <>
              <GoogleAnalytics
                GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}
              />
              <Analytics />
            </>
          )}

          {children}

          <CookieBanner onPreferencesChange={handlePreferencesChange} />
          <SpeedInsights />

          {process.env.NODE_ENV === "development" && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </ThemeProvider>
      </ClientProviders>
    </QueryClientProvider>
  );
}
