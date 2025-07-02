"use client";
import {
  ChevronRight,
  Laptop,
  Monitor,
  Smartphone,
  HardDrive,
  Server,
  Printer,
  Tablet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AssetTypeCard } from "@/components/dashboard/AssetTypeCard";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssetDistribution } from "@/hooks/queries/useAssetDistribution";

export const AssetOverview = () => {
  const navigate = useRouter();
  const { data: distributionData, isLoading, error } = useAssetDistribution();

  const getIconForAsset = (assetName: string) => {
    const lowerCaseName = assetName.toLowerCase();

    if (lowerCaseName.includes("laptop")) return <Laptop className="h-5 w-5" />;
    if (lowerCaseName.includes("monitor"))
      return <Monitor className="h-5 w-5" />;
    if (lowerCaseName.includes("mobile") || lowerCaseName.includes("phone")) {
      return <Smartphone className="h-5 w-5" />;
    }
    if (lowerCaseName.includes("tablet")) return <Tablet className="h-5 w-5" />;
    if (lowerCaseName.includes("server")) return <Server className="h-5 w-5" />;
    if (lowerCaseName.includes("printer"))
      return <Printer className="h-5 w-5" />;

    return <HardDrive className="h-5 w-5" />;
  };

  // --- Modern SaaS: Top-N + 'Other' grouping ---
  const TOP_N = 4;
  let displayData = distributionData;
  if (distributionData && distributionData.length > TOP_N) {
    const top = distributionData.slice(0, TOP_N);
    const other = distributionData.slice(TOP_N);
    const otherCount = other.reduce((sum, item) => sum + item.count, 0);
    const otherPercentage = other.reduce(
      (sum, item) => sum + item.percentage,
      0,
    );
    top.push({
      name: "Other",
      count: otherCount,
      percentage: otherPercentage,
      status: "Healthy", // Or use logic if needed
      utilization: 0, // Or average, or leave blank
    });
    displayData = top;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Asset Distribution</CardTitle>
          <CardDescription>
            A breakdown of your assets by category.
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate.push("/assets")}
        >
          View All <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <HardDrive className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Error loading asset data</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : distributionData.length > 0 ? (
          <>
            <div className="space-y-4">
              {displayData.map((asset) => (
                <AssetTypeCard
                  key={asset.name}
                  icon={getIconForAsset(asset.name)}
                  name={asset.name}
                  devices={asset.count}
                  usage={asset.utilization}
                  status={asset.status}
                />
              ))}
            </div>
            <div className="flex justify-end mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate.push("/reports?tab=asset-distribution")}
              >
                View Full Distribution
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <HardDrive className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No assets found</p>
            <p className="text-sm">
              Add your first asset to see the distribution
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
