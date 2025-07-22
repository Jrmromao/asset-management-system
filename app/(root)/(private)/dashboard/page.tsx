"use client";

import { useEffect, useState } from "react";
import { useAuth, useSession } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/Header";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { AssetOverview } from "@/components/dashboard/AssetOverview";
import { MaintenanceScheduleCard } from "@/components/dashboard/MaintenanceSchedule";
import { ESGReportingCard } from "@/components/dashboard/ESGReportingCard";
import FullscreenLoader from "@/components/FullscreenLoader";
import { AlertItem } from "@/components/dashboard/AlertItem";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DepreciationDashboard } from "@/components/dashboard/DepreciationDashboard";
import { LicenseOverview } from "@/components/dashboard/LicenseOverview";
import { AccessoryOverview } from "@/components/dashboard/AccessoryOverview";

export default function DashboardPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  const cameFromSubscription =
    searchParams.get("subscription_success") === "true";

  useEffect(() => {
    console.log("Dashboard useEffect:", {
      isLoaded,
      isSignedIn,
      session: !!session,
      cameFromSubscription,
    });

    if (!isLoaded) {
      console.log("Dashboard: Clerk not loaded yet");
      return;
    }

    // If returning from a successful subscription, reload the session to get the latest metadata.
    if (cameFromSubscription) {
      console.log("Dashboard: Came from subscription, reloading session");
      session?.reload().then(() => {
        // After reloading, remove the query param from the URL and let the effect re-run.
        router.replace("/dashboard", { scroll: false });
      });
      return;
    }

    // If not signed in, redirect to the sign-in page.
    if (!isSignedIn) {
      console.log("Dashboard: Not signed in, redirecting to sign-in");
      router.push("/sign-in");
      return;
    }

    // Check onboarding status with timeout
    const checkOnboarding = async () => {
      try {
        const publicMetadata = session?.user?.publicMetadata as any;
        const privateMetadata = (session?.user as any)?.privateMetadata;
        const hasOnboardingFlag = publicMetadata?.onboardingComplete === true;
        const hasUserId = publicMetadata?.userId;
        const hasCompanyId =
          publicMetadata?.companyId || privateMetadata?.companyId;

        console.log("Dashboard onboarding check:", {
          hasOnboardingFlag,
          hasUserId,
          hasCompanyId,
          publicMetadata,
          privateMetadata,
        });

        // If user has completed onboarding (either flag, userId, or companyId exists), allow access
        if (hasOnboardingFlag || hasUserId || hasCompanyId) {
          console.log("Dashboard: Onboarding complete, showing dashboard");
          setIsCheckingOnboarding(false);
          return;
        }

        // If no onboarding indicators found, but user is signed in, allow access (fail open)
        // This prevents infinite loading if metadata isn't set properly
        console.log(
          "Dashboard: No onboarding metadata found, allowing access anyway",
        );
        setIsCheckingOnboarding(false);
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        // If there's an error, allow access to dashboard (fail open)
        setIsCheckingOnboarding(false);
      }
    };

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log("Dashboard: Onboarding check timeout, allowing access");
      setIsCheckingOnboarding(false);
    }, 3000); // 3 second timeout

    checkOnboarding().finally(() => {
      clearTimeout(timeoutId);
    });

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isLoaded, isSignedIn, cameFromSubscription, session, router]);

  // Show a loader while Clerk is loading or while checking onboarding
  if (!isLoaded || !isSignedIn || isCheckingOnboarding) {
    return <FullscreenLoader />;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardHeader />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="depreciation">Depreciation</TabsTrigger>
          {/* <TabsTrigger value="maintenance">Maintenance</TabsTrigger> */}
          <TabsTrigger value="esg">ESG & CO₂</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Key Metrics</CardTitle>
                  <CardDescription>
                    An overview of your asset eco system&apos;s performance.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <StatsGrid />
                </CardContent>
              </Card>
              <div className="grid gap-6 md:grid-cols-2">
                <AssetOverview />
                <LicenseOverview />
              </div>
              <AccessoryOverview />
            </div>
            <div className="space-y-6">
              {/* TODO: This cannot be removed, but it is not implemented yet */}
              {/* <MaintenanceScheduleCard /> */}
              <ESGReportingCard />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="depreciation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Asset Depreciation Analysis</CardTitle>
              <CardDescription>
                Track asset values, depreciation schedules, and replacement
                planning.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DepreciationDashboard />
            </CardContent>
          </Card>
        </TabsContent>

        {/* TODO: This cannot be removed, but it is not implemented yet */}
        {/* <TabsContent value="maintenance" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <MaintenanceScheduleCard />
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Maintenance Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <AlertItem
                    type="info"
                    message="No maintenance alerts found"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent> */}

        <TabsContent value="esg" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ESGReportingCard />
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Environmental Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <AlertItem
                    type="info"
                    message="No environmental impact alerts found"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
