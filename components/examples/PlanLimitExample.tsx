import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PlanLimitWarning,
  PlanUsageDisplay,
} from "@/components/PlanLimitWarning";
import { usePlanLimitCheck } from "@/hooks/usePlanLimits";
import { toast } from "@/hooks/use-toast";

// Example: Asset creation form with plan limit checking
export function AssetCreationForm() {
  const [assetName, setAssetName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if we can add more items
  const itemLimitCheck = usePlanLimitCheck("items", 0, 1); // Assuming current count is 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!itemLimitCheck.canAdd) {
      toast({
        title: "Plan limit reached",
        description:
          itemLimitCheck.error ||
          "You've reached your item limit. Please upgrade your plan.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Your asset creation logic here
      const response = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: assetName }),
      });

      if (response.ok) {
        toast({
          title: "Asset created",
          description: "Asset created successfully!",
        });
        setAssetName("");
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to create asset",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create asset",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Show plan usage */}
      <PlanUsageDisplay />

      {/* Show warning if near limit */}
      <PlanLimitWarning
        type="items"
        currentCount={0} // Replace with actual count
        maxCount={itemLimitCheck.maxLimit}
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="assetName">Asset Name</Label>
          <Input
            id="assetName"
            value={assetName}
            onChange={(e) => setAssetName(e.target.value)}
            placeholder="Enter asset name"
            required
            disabled={!itemLimitCheck.canAdd || isSubmitting}
          />
        </div>

        <Button type="submit" disabled={!itemLimitCheck.canAdd || isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Asset"}
        </Button>

        {!itemLimitCheck.canAdd && (
          <p className="text-sm text-red-600">{itemLimitCheck.error}</p>
        )}
      </form>
    </div>
  );
}

// Example: User invitation form with plan limit checking
export function UserInvitationForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if we can add more users
  const userLimitCheck = usePlanLimitCheck("users", 0, 1); // Assuming current count is 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userLimitCheck.canAdd) {
      toast({
        title: "User limit reached",
        description:
          userLimitCheck.error ||
          "You've reached your user limit. Please upgrade your plan.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Your user invitation logic here
      const response = await fetch("/api/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast({
          title: "Invitation sent",
          description: "User invitation sent successfully!",
        });
        setEmail("");
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to send invitation",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Show plan usage */}
      <PlanUsageDisplay />

      {/* Show warning if near limit */}
      <PlanLimitWarning
        type="users"
        currentCount={0} // Replace with actual count
        maxCount={userLimitCheck.maxLimit}
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            required
            disabled={!userLimitCheck.canAdd || isSubmitting}
          />
        </div>

        <Button type="submit" disabled={!userLimitCheck.canAdd || isSubmitting}>
          {isSubmitting ? "Sending..." : "Send Invitation"}
        </Button>

        {!userLimitCheck.canAdd && (
          <p className="text-sm text-red-600">{userLimitCheck.error}</p>
        )}
      </form>
    </div>
  );
}
