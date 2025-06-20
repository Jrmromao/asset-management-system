"use client";
import { ChevronRight, Laptop, Monitor, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AssetTypeCard } from "@/components/dashboard/AssetTypeCard";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAssetOverview } from "@/lib/actions/assets.actions";

interface AssetOverviewData {
  name: string;
  count: number;
}

export const AssetOverview = () => {
  const navigate = useRouter();
  const [overviewData, setOverviewData] = useState<AssetOverviewData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await getAssetOverview();
        if (response.success) {
          setOverviewData(response.data);
        }
      } catch (error) {
        console.error("Error fetching asset overview:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getIconForAsset = (assetName: string) => {
    if (assetName.toLowerCase().includes("laptop")) {
      return <Laptop className="h-4 w-4" />;
    }
    if (assetName.toLowerCase().includes("monitor")) {
      return <Monitor className="h-4 w-4" />;
    }
    if (assetName.toLowerCase().includes("mobile")) {
      return <Smartphone className="h-4 w-4" />;
    }
    return <Laptop className="h-4 w-4" />;
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Asset Overview</h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-600"
          onClick={() => navigate.push("/assets")}
        >
          View All <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        overviewData.map((asset) => (
          <AssetTypeCard
            key={asset.name}
            icon={getIconForAsset(asset.name)}
            name={asset.name}
            devices={asset.count}
            usage={0} // You might want to calculate or fetch this
            status="Healthy" // You might want to determine this based on data
          />
        ))
      )}
    </>
  );
};
