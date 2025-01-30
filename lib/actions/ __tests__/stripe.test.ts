// __tests__/stripe.test.ts

import { prisma } from "@/app/db";
import Stripe from "stripe";
import {
  createSubscription,
  handleTrialEnd,
} from "@/lib/actions/subscription.actions";

// Mock Stripe
jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => ({
    customers: {
      create: jest.fn().mockResolvedValue({
        id: "cus_test123",
        email: "test@example.com",
      }),
    },
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({
          id: "cs_test123",
          url: "https://checkout.stripe.com/test",
          customer: "cus_test123",
          subscription: "sub_test123",
        }),
      },
    },
  }));
});

// Mock Prisma
jest.mock("@/app/db", () => ({
  prisma: {
    $transaction: jest.fn((callback) =>
      callback({
        subscription: {
          create: jest.fn().mockResolvedValue({
            id: "test_sub_id",
            stripeCustomerId: "cus_test123",
            stripeSubscriptionId: "sub_test123",
          }),
        },
        usageRecord: {
          create: jest.fn().mockResolvedValue({
            id: "test_usage_id",
          }),
        },
      }),
    ),
    subscription: {
      findUnique: jest.fn().mockResolvedValue({
        id: "test_sub_id",
        status: "TRIAL",
      }),
      update: jest.fn().mockResolvedValue({
        id: "test_sub_id",
        status: "ACTIVE",
      }),
    },
  },
}));

describe("Stripe Subscription", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = "sk_test_123";
    process.env.STRIPE_PRICE_ID = "price_123";
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  });

  describe("createSubscription", () => {
    it("should create a subscription successfully", async () => {
      const result = await createSubscription(
        "test_company_id",
        "test@example.com",
        100,
      );

      // Verify the result
      expect(result).toEqual({
        url: "https://checkout.stripe.com/test",
        sessionId: "cs_test123",
        redirectUrl: "https://checkout.stripe.com/test",
      });

      // Verify Stripe customer was created
      const stripe = new Stripe("fake_key");
      expect(stripe.customers.create).toHaveBeenCalledWith({
        email: "test@example.com",
        metadata: { companyId: "test_company_id" },
      });

      // Verify checkout session was created
      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: "cus_test123",
          mode: "subscription",
          payment_method_types: ["card"],
        }),
      );
    });

    it("should handle errors properly", async () => {
      const stripe = new Stripe("fake_key");
      (stripe.customers.create as jest.Mock).mockRejectedValueOnce(
        new Error("Stripe API Error"),
      );

      await expect(
        createSubscription("test_company_id", "test@example.com", 100),
      ).rejects.toThrow("Failed to create subscription");
    });
  });

  // describe("handleCheckoutComplete", () => {
  //   it("should handle checkout completion successfully", async () => {
  //     const mockSession = {
  //       id: "cs_test123",
  //       customer: "cus_test123",
  //       subscription: "sub_test123",
  //       metadata: {
  //         companyId: "test_company_id",
  //         assetCount: "100",
  //       },
  //     } as Stripe.Checkout.Session;
  //
  //     const result = await handleCheckoutComplete(mockSession);
  //
  //     // Verify subscription was created
  //     expect(prisma.$transaction).toHaveBeenCalled();
  //     expect(result).toEqual(
  //       expect.objectContaining({
  //         id: "test_sub_id",
  //         stripeCustomerId: "cus_test123",
  //         stripeSubscriptionId: "sub_test123",
  //       }),
  //     );
  //   });
  //
  //   it("should throw error for invalid session", async () => {
  //     const mockSession = {
  //       id: "cs_test123",
  //       // Missing customer and subscription
  //     } as Stripe.Checkout.Session;
  //
  //     await expect(handleCheckoutComplete(mockSession)).rejects.toThrow(
  //       "Invalid checkout session",
  //     );
  //   });
  // });

  describe("handleTrialEnd", () => {
    it("should update subscription status to active", async () => {
      const result = await handleTrialEnd("sub_test123");

      expect(prisma.subscription.findUnique).toHaveBeenCalledWith({
        where: { stripeSubscriptionId: "sub_test123" },
      });

      expect(prisma.subscription.update).toHaveBeenCalledWith({
        where: { id: "test_sub_id" },
        data: expect.objectContaining({
          status: "ACTIVE",
        }),
      });

      expect(result).toEqual(
        expect.objectContaining({
          id: "test_sub_id",
          status: "ACTIVE",
        }),
      );
    });

    it("should throw error for non-existent subscription", async () => {
      (prisma.subscription.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(handleTrialEnd("non_existent_sub")).rejects.toThrow(
        "Subscription not found",
      );
    });
  });
});
