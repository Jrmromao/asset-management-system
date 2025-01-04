"use client";

import React, { useState } from "react";
import { ClientProviders } from "@/lib/SessionProvider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import CookieBanner from "@/components/CookieBanner";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [showGA, setShowGA] = useState<boolean>(false);

  const handleAcceptCookies = (): void => {
    setShowGA(true);
  };

  const handleDeclineCookies = (): void => {
    setShowGA(false);
  };

  return (
    <>
      <Toaster richColors />
      <SpeedInsights />

      {showGA && process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
        <>
          <GoogleAnalytics
            GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}
          />
          <Analytics />
        </>
      )}

      <ThemeProvider
        attribute="class"
        defaultTheme="newyork"
        enableSystem
        disableTransitionOnChange
      >
        <ClientProviders>
          {children}
          {/*<CookieConsent*/}
          {/*  onAccept={handleAcceptCookies}*/}
          {/*  onDecline={handleDeclineCookies}*/}
          {/*/>*/}
          <CookieBanner // Changed from CookieConsent
            onAccept={handleAcceptCookies}
            onDecline={handleDeclineCookies}
          />
        </ClientProviders>
      </ThemeProvider>
    </>
  );
}
