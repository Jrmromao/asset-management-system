"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import CookieBanner from "@/components/cookies/CookieBanner";
import { FloatingHelpWidget } from "@/components/floating/FloatingHelpWidget";

const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = React.useState(() => new QueryClient());
  const [showGA, setShowGA] = React.useState<boolean>(false);

  const handlePreferencesChange = (preferences: any) => {
    setShowGA(preferences.analytics);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="asset-management-theme"
        >
          <Toaster richColors />
          {showGA && process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
            <GoogleAnalytics
              GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}
            />
          )}
          {children}
          <FloatingHelpWidget />
          <CookieBanner onPreferencesChange={handlePreferencesChange} />
          <SpeedInsights />
        </ThemeProvider>
      </TooltipProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default ClientLayout;
