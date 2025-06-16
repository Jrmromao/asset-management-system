"use server";

import { prisma } from "@/app/db";
import Stripe from "stripe";

import { parseStringify } from "@/lib/utils";
import { supabase } from "../supabaseClient";

if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
  throw new Error("Missing required Stripe environment variables");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export const getAssetQuota = async (): Promise<ActionResponse<number>> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const companyId = user?.user_metadata?.companyId;

  console.log("companyId: ", companyId);
  console.log("user: ", user);

  if (!companyId) {
    return {
      success: false,
      error: "Unauthorized: No valid session found",
    };
  }

  const quota = await prisma.subscription.findUnique({
    where: {
      companyId: "session.user.companyId",
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
