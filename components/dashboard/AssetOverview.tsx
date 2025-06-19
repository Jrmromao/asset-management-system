"use client";
import { ChevronRight, Laptop, Monitor, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AssetTypeCard } from "@/components/dashboard/AssetTypeCard";
import { useRouter } from "next/navigation";

export const AssetOverview = () => {
  const navigate = useRouter();
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

      <AssetTypeCard
        icon={<Laptop className="h-4 w-4" />}
        name="Laptops"
        devices={150}
        usage={92}
        status="Healthy"
      />
      <AssetTypeCard
        icon={<Monitor className="h-4 w-4" />}
        name="Monitors"
        devices={200}
        usage={88}
        status="Warning"
      />
      <AssetTypeCard
        icon={<Smartphone className="h-4 w-4" />}
        name="Mobile Devices"
        devices={75}
        usage={65}
        status="Critical"
      />
    </>
  );
};
