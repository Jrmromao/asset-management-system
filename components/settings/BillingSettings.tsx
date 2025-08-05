"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PurchaseAdditionalItems } from "@/components/billing/PurchaseAdditionalItems";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard, Users, Package, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BillingData {
  subscription: {
    id: string;
    status: string;
    assetQuota: number;
    billingCycle: string;
    trialEndsAt: string | null;
  };
  pricingPlan: {
    name: string;
    planType: string;
    pricePerAsset: number;
  };
  usage: {
    total: number;
    assets: number;
    licenses: number;
    accessories: number;
  };
  userCount: number;
  userLimit: number;
}

export function BillingSettings() {
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      const response = await fetch("/api/billing/overview");
      if (!response.ok) {
        throw new Error("Failed to fetch billing data");
      }
      const data = await response.json();
      setBillingData(data);
    } catch (error) {
      console.error("Error fetching billing data:", error);
      toast({
        title: "Error",
        description: "Failed to load billing information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getUserPricing = (planType: string): number => {
    switch (planType.toLowerCase()) {
      case "pro":
        return 10;
      case "enterprise":
        return 8;
      default:
        return 12;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!billingData) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Unable to load billing information. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const { subscription, pricingPlan, usage, userCount, userLimit } =
    billingData;
  const assetUsagePercentage = (usage.total / subscription.assetQuota) * 100;
  const userUsagePercentage = (userCount / userLimit) * 100;
  const pricePerUser = getUserPricing(pricingPlan.planType);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Billing & Usage</h2>
        <p className="text-muted-foreground">
          Manage your subscription and purchase additional resources.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">{pricingPlan.name}</h3>
              <p className="text-sm text-muted-foreground">
                {subscription.billingCycle} billing
              </p>
            </div>
            <Badge
              variant={
                subscription.status === "active" ? "default" : "secondary"
              }
            >
              {subscription.status}
            </Badge>
            {subscription.trialEndsAt && (
              <p className="text-sm text-muted-foreground">
                Trial ends:{" "}
                {new Date(subscription.trialEndsAt).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Usage Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Overview</CardTitle>
            <CardDescription>
              Current usage of your subscription resources
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Asset Usage */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Assets</span>
                <span className="text-sm text-muted-foreground">
                  {usage.total} / {subscription.assetQuota}
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(assetUsagePercentage, 100)}%` }}
                />
              </div>
              {assetUsagePercentage > 80 && (
                <p className="text-xs text-orange-600 mt-1">
                  {assetUsagePercentage > 100
                    ? "Over limit"
                    : "Approaching limit"}
                </p>
              )}
            </div>

            {/* User Usage */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Users</span>
                <span className="text-sm text-muted-foreground">
                  {userCount} / {userLimit}
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(userUsagePercentage, 100)}%` }}
                />
              </div>
              {userUsagePercentage > 80 && (
                <p className="text-xs text-orange-600 mt-1">
                  {userUsagePercentage > 100
                    ? "Over limit"
                    : "Approaching limit"}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purchase Additional Items */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Additional Resources</CardTitle>
          <CardDescription>
            Need more assets or users? Purchase additional resources as needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showPurchaseForm ? (
            <div className="space-y-4">
              <PurchaseAdditionalItems
                currentAssetQuota={subscription.assetQuota}
                currentUserLimit={userLimit}
                pricePerAsset={Number(pricingPlan.pricePerAsset)}
                pricePerUser={pricePerUser}
                onSuccess={() => {
                  setShowPurchaseForm(false);
                  fetchBillingData();
                }}
              />
              <Button
                variant="outline"
                onClick={() => setShowPurchaseForm(false)}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-4 w-4" />
                    <h3 className="font-medium">Additional Assets</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    ${Number(pricingPlan.pricePerAsset).toFixed(2)} per asset
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setShowPurchaseForm(true)}
                    className="w-full"
                  >
                    Purchase Assets
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4" />
                    <h3 className="font-medium">Additional Users</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    ${pricePerUser.toFixed(2)} per user
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setShowPurchaseForm(true)}
                    className="w-full"
                  >
                    Purchase Users
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Assets</span>
              <span className="font-medium">{usage.assets}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span>Licenses</span>
              <span className="font-medium">{usage.licenses}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span>Accessories</span>
              <span className="font-medium">{usage.accessories}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center font-semibold">
              <span>Total Items</span>
              <span>{usage.total}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
