import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/app/db";
import Stripe from "stripe";
import { getAuth } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    // Get user and companyId from Clerk
    const { userId, orgId } = getAuth(req);
    if (!orgId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    // Find company by Clerk orgId
    const company = await prisma.company.findFirst({
      where: { clerkOrgId: orgId },
    });
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }
    // Get subscription (with plan and billing settings)
    const subscription = await prisma.subscription.findUnique({
      where: { companyId: company.id },
      include: {
        pricingPlan: true,
        billingSettings: true,
      },
    });
    // Get invoices
    const invoices = await prisma.invoice.findMany({
      where: { subscriptionId: subscription?.id },
      orderBy: { invoiceDate: "desc" },
      take: 12,
    });
    // Get payment method from Stripe
    let paymentMethod = null;
    if (subscription?.stripeCustomerId) {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: subscription.stripeCustomerId,
        type: "card",
      });
      paymentMethod = paymentMethods.data[0] || null;
    }
    res.status(200).json({
      subscription,
      pricingPlan: subscription?.pricingPlan,
      billingSettings: subscription?.billingSettings,
      paymentMethod,
      invoices,
    });
  } catch (error) {
    console.error("[Billing Overview API]", error);
    res.status(500).json({ error: "Failed to load billing overview" });
  }
}
