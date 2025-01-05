"use client";
import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/Header";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { AssetOverview } from "@/components/dashboard/AssetOverview";
import EnvironmentalImpactCard from "@/components/dashboard/EnvironmentalImpactCard";
import { MaintenanceScheduleCard } from "@/components/dashboard/MaintenanceSchedule";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { AlertItem } from "@/components/dashboard/AlertItem";

const DashboardPage = (): JSX.Element => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="p-8 space-y-6">
      <DashboardHeader />
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <AlertBanner />
      <StatsGrid />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <AssetOverview />
          <EnvironmentalImpactCard />
        </div>

        <div className="space-y-6">
          <MaintenanceScheduleCard />
          <QuickActions />

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Recent Alerts</h3>
            <AlertItem
              type="warning"
              message="Maintenance due for Device XYZ"
            />
            <AlertItem type="info" message="License expiring in 15 days" />
            <AlertItem type="success" message="New asset request pending" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
