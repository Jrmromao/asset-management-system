import React from "react";
import { AlertTriangle, Users, Package, CreditCard } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import Link from "next/link";

interface PlanLimitWarningProps {
  type: "users" | "items";
  currentCount: number;
  maxCount: number;
  showUpgradeButton?: boolean;
}

export function PlanLimitWarning({
  type,
  currentCount,
  maxCount,
  showUpgradeButton = true,
}: PlanLimitWarningProps) {
  const limits = usePlanLimits();
  const usagePercentage = (currentCount / maxCount) * 100;
  const isNearLimit = usagePercentage >= 80;
  const isAtLimit = usagePercentage >= 100;

  if (!isNearLimit) return null;

  const getIcon = () => {
    switch (type) {
      case "users":
        return <Users className="h-4 w-4" />;
      case "items":
        return <Package className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getTitle = () => {
    if (isAtLimit) {
      return `${type === "users" ? "User" : "Item"} limit reached`;
    }
    return `Approaching ${type === "users" ? "user" : "item"} limit`;
  };

  const getDescription = () => {
    if (isAtLimit) {
      return `You've reached your ${limits.plan} plan limit of ${maxCount} ${type}. Upgrade to add more.`;
    }
    return `You're using ${currentCount} of ${maxCount} ${type} (${usagePercentage.toFixed(0)}%). Consider upgrading soon.`;
  };

  return (
    <Alert
      className={`mb-4 ${isAtLimit ? "border-red-500 bg-red-50" : "border-yellow-500 bg-yellow-50"}`}
    >
      <AlertTriangle
        className={`h-4 w-4 ${isAtLimit ? "text-red-600" : "text-yellow-600"}`}
      />
      <AlertTitle className={isAtLimit ? "text-red-800" : "text-yellow-800"}>
        {getTitle()}
      </AlertTitle>
      <AlertDescription
        className={isAtLimit ? "text-red-700" : "text-yellow-700"}
      >
        {getDescription()}
        {showUpgradeButton && (
          <div className="mt-2">
            <Button
              size="sm"
              variant={isAtLimit ? "destructive" : "outline"}
              asChild
            >
              <Link href="/pricing">
                <CreditCard className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Link>
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}

// Component to show current usage
export function PlanUsageDisplay() {
  const limits = usePlanLimits();

  if (limits.isLoading) {
    return (
      <div className="text-sm text-muted-foreground">Loading plan usage...</div>
    );
  }

  const userUsagePercentage =
    limits.maxUsers > 0 ? (limits.currentUsers / limits.maxUsers) * 100 : 0;
  const itemUsagePercentage =
    limits.maxItems > 0 ? (limits.currentItems / limits.maxItems) * 100 : 0;

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-background">
      <h3 className="text-sm font-medium text-muted-foreground">Plan Usage</h3>

      <div className="space-y-3">
        {/* Users Usage */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Users</span>
            <span className="font-medium">
              {limits.currentUsers} /{" "}
              {limits.maxUsers === -1 ? "∞" : limits.maxUsers}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                userUsagePercentage >= 100
                  ? "bg-red-500"
                  : userUsagePercentage >= 80
                    ? "bg-yellow-500"
                    : "bg-green-500"
              }`}
              style={{ width: `${Math.min(userUsagePercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Items Usage */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Unique Items</span>
            <span className="font-medium">
              {limits.currentItems} /{" "}
              {limits.maxItems === -1 ? "∞" : limits.maxItems}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                itemUsagePercentage >= 100
                  ? "bg-red-500"
                  : itemUsagePercentage >= 80
                    ? "bg-yellow-500"
                    : "bg-green-500"
              }`}
              style={{ width: `${Math.min(itemUsagePercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        Current plan:{" "}
        <span className="font-medium capitalize">{limits.plan}</span>
      </div>
    </div>
  );
}
