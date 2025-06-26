"use server";

import { prisma } from "@/app/db";
import { PlanType } from "@prisma/client";
import { z } from "zod";
import { createAuditLog } from "@/lib/actions/auditLog.actions";

const pricingPlanSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  description: z.string().optional(),
  stripePriceId: z.string().min(1, "Stripe Price ID is required"),
  planType: z.nativeEnum(PlanType),
  assetQuota: z.number().int().positive("Asset quota must be positive"),
  pricePerAsset: z.number().positive("Price per asset must be positive"),
  billingCycle: z.string().min(1, "Billing cycle is required"),
  trialDays: z
    .number()
    .int()
    .min(0, "Trial days must be non-negative")
    .default(30),
  isActive: z.boolean().default(true),
  features: z.array(z.string()).min(1, "At least one feature is required"),
});

export type PricingPlanInput = z.infer<typeof pricingPlanSchema>;

interface ActionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function createPricingPlan(
  data: PricingPlanInput,
): Promise<ActionResponse<any>> {
  try {
    const validatedData = pricingPlanSchema.parse(data);

    const pricingPlan = await prisma.pricingPlan.create({
      data: {
        ...validatedData,
        assetQuota: validatedData.assetQuota,
        billingCycle: "monthly",
      },
    });

    return { success: true, data: pricingPlan };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create pricing plan",
    };
  } finally {
    await prisma.$disconnect();
  }
}
