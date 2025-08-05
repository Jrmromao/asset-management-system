"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Users, Package } from "lucide-react";

interface PurchaseAdditionalItemsProps {
  currentAssetQuota: number;
  currentUserLimit: number;
  pricePerAsset: number;
  pricePerUser: number;
  onSuccess?: () => void;
}

export function PurchaseAdditionalItems({
  currentAssetQuota,
  currentUserLimit,
  pricePerAsset,
  pricePerUser,
  onSuccess,
}: PurchaseAdditionalItemsProps) {
  const [activeTab, setActiveTab] = useState("assets");
  const [additionalAssets, setAdditionalAssets] = useState(10);
  const [additionalUsers, setAdditionalUsers] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePurchaseAssets = async () => {
    if (additionalAssets <= 0) {
      toast({
        title: "Invalid quantity",
        description: "Please enter a valid number of additional assets.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/billing/purchase-additional-assets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ additionalAssets }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to initiate purchase");
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast({
          title: "Purchase initiated",
          description: "Redirecting to checkout...",
        });
      }
    } catch (error) {
      console.error("Purchase error:", error);
      toast({
        title: "Purchase failed",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchaseUsers = async () => {
    if (additionalUsers <= 0) {
      toast({
        title: "Invalid quantity",
        description: "Please enter a valid number of additional users.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/billing/purchase-additional-users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ additionalUsers }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to initiate purchase");
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast({
          title: "Purchase initiated",
          description: "Redirecting to checkout...",
        });
      }
    } catch (error) {
      console.error("Purchase error:", error);
      toast({
        title: "Purchase failed",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalAssetCost = (additionalAssets * pricePerAsset).toFixed(2);
  const totalUserCost = (additionalUsers * pricePerUser).toFixed(2);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Purchase Additional Items
        </CardTitle>
        <CardDescription>
          Add more items or users to your subscription as needed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="assets" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Items
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assets" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="additional-assets">Additional Items</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id="additional-assets"
                    type="number"
                    min="1"
                    value={additionalAssets}
                    onChange={(e) =>
                      setAdditionalAssets(parseInt(e.target.value) || 0)
                    }
                    className="flex-1"
                  />
                  <Badge variant="secondary">
                    ${pricePerAsset.toFixed(2)} each
                  </Badge>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Current quota:
                  </span>
                  <span className="font-medium">{currentAssetQuota} items</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-muted-foreground">
                    New quota:
                  </span>
                  <span className="font-medium">
                    {currentAssetQuota + additionalAssets} items
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t">
                  <span className="font-medium">Total cost:</span>
                  <span className="font-bold text-lg">${totalAssetCost}</span>
                </div>
              </div>

              <Button
                onClick={handlePurchaseAssets}
                disabled={isLoading || additionalAssets <= 0}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Package className="mr-2 h-4 w-4" />
                    Purchase {additionalAssets} Additional Items
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="additional-users">Additional Users</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id="additional-users"
                    type="number"
                    min="1"
                    value={additionalUsers}
                    onChange={(e) =>
                      setAdditionalUsers(parseInt(e.target.value) || 0)
                    }
                    className="flex-1"
                  />
                  <Badge variant="secondary">
                    ${pricePerUser.toFixed(2)} each
                  </Badge>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Current limit:
                  </span>
                  <span className="font-medium">{currentUserLimit} users</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-muted-foreground">
                    New limit:
                  </span>
                  <span className="font-medium">
                    {currentUserLimit + additionalUsers} users
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t">
                  <span className="font-medium">Total cost:</span>
                  <span className="font-bold text-lg">${totalUserCost}</span>
                </div>
              </div>

              <Button
                onClick={handlePurchaseUsers}
                disabled={isLoading || additionalUsers <= 0}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-4 w-4" />
                    Purchase {additionalUsers} Additional User
                    {additionalUsers !== 1 ? "s" : ""}
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
