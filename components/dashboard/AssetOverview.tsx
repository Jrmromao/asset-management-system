"use client";
import {
  ChevronRight,
  Laptop,
  Monitor,
  Smartphone,
  HardDrive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AssetTypeCard } from "@/components/dashboard/AssetTypeCard";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AssetTypeCardProps } from "@/components/dashboard/types/dashboard";
import { Skeleton } from "@/components/ui/skeleton";

interface AssetOverviewData {
  name: string;
  count: number;
  usage: number;
  status: AssetTypeCardProps["status"];
}

const mockAssetOverviewData: AssetOverviewData[] = [
  {
    name: "Laptops",
    count: 128,
    usage: 85,
    status: "Healthy",
  },
  {
    name: "Monitors",
    count: 256,
    usage: 92,
    status: "Healthy",
  },
  {
    name: "Mobile Devices",
    count: 64,
    usage: 70,
    status: "Warning",
  },
];

export const AssetOverview = () => {
  const navigate = useRouter();
  const [overviewData, setOverviewData] = useState<AssetOverviewData[]>(
    mockAssetOverviewData,
  );
  const [isLoading, setIsLoading] = useState(false);

  const getIconForAsset = (assetName: string) => {
    const lowerCaseName = assetName.toLowerCase();
    if (lowerCaseName.includes("laptop")) return <Laptop className="h-5 w-5" />;
    if (lowerCaseName.includes("monitor")) return <Monitor className="h-5 w-5" />;
    if (lowerCaseName.includes("mobile")) {
      return <Smartphone className="h-5 w-5" />;
    }
    return <HardDrive className="h-5 w-5" />;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Asset by Type</CardTitle>
          <CardDescription>A breakdown of your assets by type.</CardDescription>
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
        ) : (
          <div className="space-y-4">
            {overviewData.map((asset) => (
              <AssetTypeCard
                key={asset.name}
                icon={getIconForAsset(asset.name)}
                name={asset.name}
                devices={asset.count}
                usage={asset.usage}
                status={asset.status}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
