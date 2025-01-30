"use server";

import { prisma } from "@/app/db";
import Stripe from "stripe";
import { auth } from "@/auth";
import { parseStringify } from "@/lib/utils";

if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
  throw new Error("Missing required Stripe environment variables");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export const getAssetQuota = async (): Promise<ActionResponse<number>> => {
  const session = await auth();
  if (!session?.user?.companyId) {
    return {
      success: false,
      error: "Unauthorized: No valid session found",
    };
  }

  const quota = await prisma.subscription.findUnique({
    where: {
      companyId: session.user.companyId,
    },
    include: {
      usageRecords: {
        select: {
          purchasedAssetQuota: true,
        },
      },
    },
  });

  const total = quota?.usageRecords.reduce(
    (sum, record) => sum + record.purchasedAssetQuota,
    0,
  );

  console.log("total: ", total);
  return {
    success: true,
    data: parseStringify(total),
  };
};
