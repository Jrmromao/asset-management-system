"use client";
import { BarChart3, Battery, Box, Clock, AlertTriangle } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  getAllAssets,
  getAssetUtilizationStats,
} from "@/lib/actions/assets.actions";
import { useEffect, useState } from "react";
import { getAssetQuota } from "@/lib/actions/usageRecord.actions";
import { getMaintenanceDueCount } from "@/lib/actions/inventory.actions";
import {
  getTotalCo2Savings,
  getCo2SavingsTrend,
} from "@/lib/actions/co2.actions";
import { getAll as getAllLicenses } from "@/lib/actions/license.actions";
import { getAllAccessories } from "@/lib/actions/accessory.actions";
import { Skeleton } from "@/components/ui/skeleton";
import { getQuotaInfo } from "@/lib/services/usage.service";
import { auth } from "@clerk/nextjs/server";

interface DashboardStats {
  totalItems: number;
  itemsBreakdown: {
    assets: number;
    licenses: number;
    accessories: number;
  };
  quota: {
    used: number;
    limit: number;
    remaining: number;
    percentage: number;
  };
  maintenanceDue: number;
  co2Savings: number;
  co2Trend: number;
  utilizationRate: number;
  assignedAssets: number;
}

export const StatsGrid = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [
          assetsResponse,
          licensesResponse,
          accessoriesResponse,
          quotaResponse,
          maintenanceDueResponse,
          co2SavingsResponse,
          co2TrendResponse,
          utilizationStatsResponse,
        ] = await Promise.all([
          getAllAssets(),
          getAllLicenses(),
          getAllAccessories(),
          getAssetQuota(),
          getMaintenanceDueCount(),
          getTotalCo2Savings(),
          getCo2SavingsTrend(),
          getAssetUtilizationStats(),
        ]);

        const assets = assetsResponse.data || [];
        const licenses = licensesResponse.data || [];
        const accessories = accessoriesResponse.data || [];
        const quota = quotaResponse.data || 50;

        // Fix: Check for userId instead of assignee
        const assignedAssets = assets.reduce(
          (sum, asset) => sum + (asset.userId ? 1 : 0),
          0,
        );

        const calculatedUsageRate =
          assets.length > 0 ? (assignedAssets / assets.length) * 100 : 0;

        // Use the utilization stats response for more accurate data
        const utilizationData = utilizationStatsResponse.data;
        const displayUtilizationRate =
          utilizationData?.utilizationRate || calculatedUsageRate;
        const displayAssignedAssets =
          utilizationData?.assignedAssets || assignedAssets;

        // FIXED: Actual unified item counting
        const itemsBreakdown = {
          assets: assets.length,
          licenses: licenses.length,
          accessories: accessories.length,
        };

        const totalItems =
          itemsBreakdown.assets +
          itemsBreakdown.licenses +
          itemsBreakdown.accessories;

        setStats({
          totalItems,
          itemsBreakdown,
          quota: {
            used: totalItems,
            limit: quota,
            remaining: Math.max(0, quota - totalItems),
            percentage: Math.round((totalItems / quota) * 100),
          },
          maintenanceDue: maintenanceDueResponse.data || 0,
          co2Savings: (co2SavingsResponse.data as number) || 0,
          co2Trend: (co2TrendResponse.data as number) || 0,
          utilizationRate: displayUtilizationRate,
          assignedAssets: displayAssignedAssets,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Set default values in case of error
        setStats({
          totalItems: 0,
          itemsBreakdown: { assets: 0, licenses: 0, accessories: 0 },
          quota: { used: 0, limit: 50, remaining: 50, percentage: 0 },
          maintenanceDue: 0,
          co2Savings: 0,
          co2Trend: 0,
          utilizationRate: 0,
          assignedAssets: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  // Determine quota status color and icon
  const getQuotaColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 75) return "text-amber-600";
    return "text-emerald-600";
  };

  const quotaIcon =
    stats.quota.percentage >= 90 ? (
      <AlertTriangle className="h-5 w-5 text-red-600" />
    ) : (
      <Box className="h-5 w-5 text-emerald-600" />
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard
        title="Total Items"
        mainValue={Number.isFinite(stats.totalItems) ? stats.totalItems : 0}
        subValue={`/${Number.isFinite(stats.quota.limit) ? stats.quota.limit : 0}`}
        subtitle={`${Number.isFinite(stats.quota.remaining) ? stats.quota.remaining : 0} remaining • ${Number.isFinite(stats.quota.percentage) ? stats.quota.percentage : 0}% used`}
        icon={quotaIcon}
        tooltip={`Assets: ${stats.itemsBreakdown.assets} • Licenses: ${stats.itemsBreakdown.licenses} • Accessories: ${stats.itemsBreakdown.accessories}`}
      />

      <StatCard
        title="Asset Utilization"
        mainValue={`${Number.isFinite(stats.utilizationRate) ? Math.round(stats.utilizationRate) : 0}%`}
        subtitle={`${Number.isFinite(stats.assignedAssets) ? stats.assignedAssets : 0} of ${Number.isFinite(stats.itemsBreakdown.assets) ? stats.itemsBreakdown.assets : 0} assigned`}
        icon={<BarChart3 className="h-5 w-5 text-blue-600" />}
      />
      {/* TODO: This cannot be removed, but it is not implemented yet */}
      {/* <StatCard
        title="Upcoming Maintenance"
        mainValue={
          Number.isFinite(stats.maintenanceDue) ? stats.maintenanceDue : 0
        }
        subValue="assets"
        subtitle="Due within 30 days"
        icon={<Clock className="h-5 w-5 text-amber-600" />}
        tooltip="Number of assets with maintenance due in the next 30 days."
      /> */}

      <StatCard
        title="CO₂ Savings"
        mainValue={Number.isFinite(stats.co2Savings) ? stats.co2Savings : 0}
        subValue="tons"
        subtitle={`+${Number.isFinite(stats.co2Trend) ? stats.co2Trend : 0} this month`}
        icon={<Battery className="h-5 w-5 text-emerald-600" />}
      />
    </div>
  );
};
