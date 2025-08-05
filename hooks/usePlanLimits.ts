import { useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";

export interface PlanLimitCheck {
  canAddUsers: boolean;
  canAddItems: boolean;
  currentUsers: number;
  currentItems: number;
  maxUsers: number;
  maxItems: number;
  plan: string;
  userError?: string;
  itemError?: string;
  isLoading: boolean;
}

export function usePlanLimits() {
  const { userId } = useAuth();
  const [limits, setLimits] = useState<PlanLimitCheck>({
    canAddUsers: true,
    canAddItems: true,
    currentUsers: 0,
    currentItems: 0,
    maxUsers: -1,
    maxItems: -1,
    plan: "professional",
    isLoading: true,
  });

  useEffect(() => {
    if (!userId) return;

    const checkLimits = async () => {
      try {
        const response = await fetch("/api/plan-limits", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setLimits({
            ...data,
            isLoading: false,
          });
        } else {
          console.error("Failed to fetch plan limits");
          setLimits((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error("Error checking plan limits:", error);
        setLimits((prev) => ({ ...prev, isLoading: false }));
      }
    };

    checkLimits();
  }, [userId]);

  return limits;
}

// Hook for checking specific limits
export function usePlanLimitCheck(
  type: "users" | "items",
  currentCount: number,
  newCount: number = 1,
) {
  const limits = usePlanLimits();

  const canAdd =
    type === "users"
      ? limits.canAddUsers &&
        (limits.maxUsers === -1 || currentCount + newCount <= limits.maxUsers)
      : limits.canAddItems &&
        (limits.maxItems === -1 || currentCount + newCount <= limits.maxItems);

  const error = type === "users" ? limits.userError : limits.itemError;

  return {
    canAdd,
    error,
    isLoading: limits.isLoading,
    plan: limits.plan,
    maxLimit: type === "users" ? limits.maxUsers : limits.maxItems,
  };
}
