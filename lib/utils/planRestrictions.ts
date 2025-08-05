import { clerkClient } from "@clerk/nextjs/server";

export interface PlanRestrictions {
  maxUsers: number;
  maxItems: number; // Unique items (accessories, assets, licenses)
  plan: string;
}

export const PLAN_LIMITS = {
  starter: {
    maxUsers: 1,
    maxItems: 100, // Unique items (accessories, assets, licenses)
    plan: "starter",
  },
  professional: {
    maxUsers: 10,
    maxItems: 1000, // Unique items (accessories, assets, licenses)
    plan: "professional",
  },
  enterprise: {
    maxUsers: -1, // Unlimited
    maxItems: -1, // Unlimited
    plan: "enterprise",
  },
} as const;

/**
 * Check if a company can add more users based on their plan
 */
export async function canAddUser(companyId: string): Promise<{
  canAdd: boolean;
  currentUsers: number;
  maxUsers: number;
  plan: string;
  error?: string;
}> {
  try {
    const clerk = await clerkClient();

    // Get company's plan from database or user metadata
    const company = await clerk.organizations.getOrganization({
      organizationId: companyId,
    });

    // Get current user count
    const members = await clerk.organizations.getOrganizationMembershipList({
      organizationId: companyId,
    });

    const currentUsers = members.data.length;

    // Get plan from company metadata or default to professional
    const plan = (company.publicMetadata?.plan as string) || "professional";
    const planLimits =
      PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.professional;

    const canAdd =
      planLimits.maxUsers === -1 || currentUsers < planLimits.maxUsers;

    return {
      canAdd,
      currentUsers,
      maxUsers: planLimits.maxUsers,
      plan: planLimits.plan,
      error: !canAdd
        ? `Plan limit reached. ${planLimits.plan} plan allows maximum ${planLimits.maxUsers} users.`
        : undefined,
    };
  } catch (error) {
    console.error("Error checking user limits:", error);
    return {
      canAdd: false,
      currentUsers: 0,
      maxUsers: 1,
      plan: "starter",
      error: "Failed to check user limits",
    };
  }
}

/**
 * Check if a company can add more items (accessories, assets, licenses) based on their plan
 */
export async function canAddItems(
  companyId: string,
  currentItems: number,
  newItems: number = 1,
): Promise<{
  canAdd: boolean;
  currentItems: number;
  maxItems: number;
  plan: string;
  error?: string;
}> {
  try {
    const clerk = await clerkClient();

    // Get company's plan from database or user metadata
    const company = await clerk.organizations.getOrganization({
      organizationId: companyId,
    });

    const plan = (company.publicMetadata?.plan as string) || "professional";
    const planLimits =
      PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.professional;

    const canAdd =
      planLimits.maxItems === -1 ||
      currentItems + newItems <= planLimits.maxItems;

    return {
      canAdd,
      currentItems,
      maxItems: planLimits.maxItems,
      plan: planLimits.plan,
      error: !canAdd
        ? `Plan limit reached. ${planLimits.plan} plan allows maximum ${planLimits.maxItems} unique items.`
        : undefined,
    };
  } catch (error) {
    console.error("Error checking item limits:", error);
    return {
      canAdd: false,
      currentItems: 0,
      maxItems: 100,
      plan: "starter",
      error: "Failed to check item limits",
    };
  }
}

/**
 * Get plan restrictions for a company
 */
export function getPlanRestrictions(plan: string): PlanRestrictions {
  const planLimits =
    PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.professional;
  return planLimits;
}
