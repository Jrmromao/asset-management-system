"use server";

import { prisma } from "@/app/db";
import { PlanType } from "@prisma/client";
import { z } from "zod";

const pricingPlanSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  description: z.string().optional(),
  stripePriceId: z.string().min(1, "Stripe Price ID is required"),
  planType: z.nativeEnum(PlanType),
  pricePerAsset: z.number().positive("Price per asset must be positive"),
  minAssets: z.number().int().min(1, "Minimum assets must be at least 1"),
  maxAssets: z.number().int().positive().optional(),
  trialDays: z.number().int().min(0, "Trial days must be non-negative"),
  isActive: z.boolean().default(true),
  features: z.array(z.string()).min(1, "At least one feature is required"),
  metadata: z.record(z.any()).optional(),
});

export type PricingPlanInput = z.infer<typeof pricingPlanSchema>;

interface ActionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function createPricingPlan(
  data: PricingPlanInput
):