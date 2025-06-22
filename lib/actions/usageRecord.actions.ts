"use server";

import { prisma } from "@/app/db";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";
import { parseStringify } from "@/lib/utils";

if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
  throw new Error("Missing required Stripe environment variables");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

interface ActionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const getAssetQuota = async (): Promise<ActionResponse<number>> => {
  const { orgId } = await auth();

  if (!orgId) {
    return {
      success: false,
      error: "Unauthorized: No active organization found",
    };
  }

  const company = await prisma.company.findUnique({
    where: { clerkOrgId: orgId },
    select: { id: true },
  });

  if (!company) {
    return {
      success: false,
      error: "Company not found for the current organization.",
    };
  }

  const subscription = await prisma.subscription.findUnique({
    where: {
      companyId: company.id,
    },
    select: {
      assetQuota: true,
    },
  });

  if (!subscription) {
    return {
      success: false,
      error: "Subscription not found for the current organization.",
    };
  }

  return {
    success: true,
    data: subscription.assetQuota,
  };
};
