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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  const cameFromSubscription =
    searchParams.get("subscription_success") === "true";

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    // If returning from a successful subscription, reload the session to get the latest metadata.
    if (cameFromSubscription) {
      session?.reload().then(() => {
        // After reloading, remove the query param from the URL and let the effect re-run.
        router.replace("/dashboard", { scroll: false });
      });
      return;
    }

    // If not signed in, redirect to the sign-in page.
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    // Check onboarding status
    const checkOnboarding = async () => {
      try {
        const publicMetadata = session?.user?.publicMetadata as any;
        const hasOnboardingFlag = publicMetadata?.onboardingComplete === true;
        const hasUserId = publicMetadata?.userId;

        console.log("Dashboard onboarding check:", {
          hasOnboardingFlag,
          hasUserId,
          publicMetadata,
        });

        // If user has completed onboarding (either flag or userId exists), allow access
        if (hasOnboardingFlag || hasUserId) {
          setIsCheckingOnboarding(false);
          return;
        }

        // If no onboarding flag and no userId, redirect to sign-up
        console.log("Onboarding not complete, redirecting to sign-up");
        router.push("/sign-up");
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        // If there's an error, allow access to dashboard (fail open)
        setIsCheckingOnboarding(false);
      }
    };

    checkOnboarding();
  }, [isLoaded, isSignedIn, cameFromSubscription, session, router]);

  // Show a loader while Clerk is loading or while checking onboarding
  if (!isLoaded || !isSignedIn || isCheckingOnboarding) {
    return <FullscreenLoader />;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardHeader />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Key Metrics</CardTitle>
              <CardDescription>
                An overview of your asset ecosystem's performance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StatsGrid />
            </CardContent>
          </Card>
          <AssetOverview />
        </div>
        <div className="space-y-6">
          <MaintenanceScheduleCard />
          <ESGReportingCard />
        </div>
      </div>
    </div>
  );
}
