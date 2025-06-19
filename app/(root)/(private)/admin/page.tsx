import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardHeader } from "@/components/dashboard/Header";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { AssetOverview } from "@/components/dashboard/AssetOverview";
import { MaintenanceScheduleCard } from "@/components/dashboard/MaintenanceSchedule";
import { createServerSupabaseClient } from '@/utils/supabase/server';

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
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
