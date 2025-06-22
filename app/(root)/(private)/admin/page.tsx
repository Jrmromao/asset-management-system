"use client";

import { useEffect } from "react";
import { useAuth, useSession } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/Header";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { AssetOverview } from "@/components/dashboard/AssetOverview";
import { MaintenanceScheduleCard } from "@/components/dashboard/MaintenanceSchedule";
import { ESGReportingCard } from "@/components/dashboard/ESGReportingCard";
import FullscreenLoader from "@/components/FullscreenLoader";

export default function AdminPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const hasOnboardingFlag =
    session?.user?.publicMetadata?.onboardingComplete === true;
  const cameFromSubscription =
    searchParams.get("subscription_success") === "true";

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    if (hasOnboardingFlag) {
      if (cameFromSubscription) {
        router.replace("/admin");
      }
    } else {
      if (cameFromSubscription) {
        session?.reload().then(() => {
          router.replace("/admin");
        });
      } else {
        router.push("/sign-up");
      }
    }
  }, [
    isLoaded,
    isSignedIn,
    hasOnboardingFlag,
    cameFromSubscription,
    session,
    router,
  ]);

  if (!isLoaded || !hasOnboardingFlag) {
    return <FullscreenLoader />;
  }

  return (
    <div className="p-8 space-y-6">
      <DashboardHeader />
      {/*<SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />*/}
      {/*<AlertBanner />*/}
      <StatsGrid />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <AssetOverview />
          {/*<EnvironmentalImpactCard />*/}
        </div>

        <div className="space-y-6">
          <MaintenanceScheduleCard />
          <ESGReportingCard />
          {/*<QuickActions />*/}

          {/*<div className="space-y-2">*/}
          {/*  <h3 className="text-sm font-medium">Recent Alerts</h3>*/}
          {/*  <AlertItem*/}
          {/*    type="warning"*/}
          {/*    message="Maintenance due for Device XYZ"*/}
          {/*  />*/}
          {/*  <AlertItem type="info" message="License expiring in 15 days" />*/}
          {/*  <AlertItem type="success" message="New asset request pending" />*/}
          {/*</div>*/}
        </div>
      </div>
    </div>
  );
}
