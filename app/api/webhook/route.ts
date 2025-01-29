// app/api/webhook/route.ts
import { headers } from "next/headers";
import Stripe from "stripe";
import { prisma } from "@/app/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature")!;

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );

    switch (event.type) {
      case "customer.subscription.trial_will_end":
        break;
      case "customer.subscription.updated":
        break;
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        if (session && session.metadata?.companyId) {
          await prisma.company.update({
            where: { id: session.metadata.companyId },
            data: {
              status: CompanyStatus.ACTIVE,
            },
          });
        }
        break;
    }

    return new Response(null, { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Webhook Error", { status: 400 });
  }
}
