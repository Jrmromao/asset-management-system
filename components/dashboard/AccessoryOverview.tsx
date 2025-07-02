"use client";
import { Monitor, Package, AlertTriangle, ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useAccessoryQuery } from "@/hooks/queries/useAccessoryQuery";

export const AccessoryOverview = () => {
  const router = useRouter();
  const { accessories = [], isLoading } = useAccessoryQuery();

  // Calculate low stock (quantity <= reorderPoint)
  const lowStock = useMemo(() => {
    return accessories.filter(
      (a) =>
        typeof a.totalQuantityCount === "number" &&
        typeof a.reorderPoint === "number" &&
        a.totalQuantityCount <= a.reorderPoint,
    ).length;
  }, [accessories]);

  // Calculate in-stock percentage (not low stock)
  const inStock = useMemo(() => {
    if (accessories.length === 0) return 0;
    const notLowStock = accessories.length - lowStock;
    return Math.round((notLowStock / accessories.length) * 100);
  }, [accessories, lowStock]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Accessory Inventory</CardTitle>
          <CardDescription>
            Monitor accessory stock levels and assignments.
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/accessories")}
        >
          View All <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? "--" : accessories.length}
            </div>
            <div className="text-sm text-gray-600">Total Items</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {isLoading ? "--" : lowStock}
            </div>
            <div className="text-sm text-gray-600">Low Stock</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {isLoading ? "--" : `${inStock}%`}
            </div>
            <div className="text-sm text-gray-600">In Stock</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
