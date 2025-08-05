"use server";

import { Company, CompanyStatus, Prisma, User } from "@prisma/client";
import { prisma } from "@/app/db";
import S3Service from "@/services/aws/S3";
import { bulkInsertTemplates } from "@/lib/actions/formTemplate.actions";
import { RegistrationData } from "@/components/providers/UserContext";
import { createSubscription } from "@/lib/actions/subscription.actions";
import { AuthResponse, withAuth } from "@/lib/middleware/withAuth";
import { cookies } from "next/headers";
import { EmailService } from "@/services/email";
import { clerkClient } from "@clerk/nextjs/server";
import { createUserWithCompany } from "./user.actions";
import { createAuditLog } from "@/lib/actions/auditLog.actions";
import { parseCompanySize } from "@/lib/utils/onboarding";

interface RegistrationState {
  companyId?: string;
  bucketCreated: boolean;
}

const handlePrismaError = (error: Prisma.PrismaClientKnownRequestError) => {
  switch (error.code) {
    case "P2002":
      return "A record with this information already exists.";
    case "P2025":
      return "The requested record was not found.";
    default:
      return "A database error occurred.";
  }
};

// Cleanup function to handle rollback of company creation
const cleanup = async (state: RegistrationState) => {
  try {
    if (state.companyId) {
      const company = await prisma.company.findUnique({
        where: { id: state.companyId },
      });

      if (company) {
        await prisma.company.delete({
          where: { id: state.companyId },
        });
      }

      if (state.bucketCreated) {
        const s3Service = S3Service.getInstance();
        await s3Service.deleteCompanyStorage(state.companyId);
      }
    }
  } catch (error) {
    console.error("Cleanup failed:", error);
  } finally {
    await prisma.$disconnect();
  }
};

type ActionResponse<T> = {
  data?: T;
  error?: string;
  success: boolean;
};

const getSession = async () => {
  const cookieStore = await cookies();
  return {
    accessToken: cookieStore.get("sb-access-token")?.value,
    refreshToken: cookieStore.get("sb-refresh-token")?.value,
  };
};

export const getAll = withAuth(
  async (user): Promise<AuthResponse<Company[]>> => {
    try {
      const companies = await prisma.company.findMany();
      return { success: true, data: companies };
    } catch (error) {
      console.error("Get companies error:", error);
      return {
        success: false,
        data: null as any,
        error: "Failed to fetch companies",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function getAllCompanies(): Promise<ActionResponse<Company[]>> {
  const session = await getSession();
  const result = await getAll();
  if (result.success && Array.isArray(result.data)) {
    result.data = result.data.map((company: any) =>
      serializeCompany({
        ...company,
        employeeCount: company.employeeCount ?? null,
      }),
    );
  }
  return result;
}

export const update = withAuth(
  async (user, id: string, name: string): Promise<AuthResponse<Company>> => {
    try {
      const company = await prisma.company.update({
        where: { id },
        data: { name },
      });
      await createAuditLog({
        companyId: company.id,
        action: "COMPANY_UPDATED",
        entity: "COMPANY",
        entityId: company.id,
        details: `Company updated: ${company.name} by user ${user.id}`,
      });
      return { success: true, data: company };
    } catch (error) {
      console.error("Update company error:", error);
      return {
        success: false,
        data: null as any,
        error: "Failed to update company",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function updateCompany(
  id: string,
  data: Partial<{
    name: string;
    industry: string;
    website: string;
    contactEmail: string;
    logoUrl: string;
    employeeCount?: number;
    // ...add more fields as needed
  }>,
): Promise<ActionResponse<Company>> {
  try {
    const company = await prisma.company.update({
      where: { id },
      data,
    });
    // Ensure employeeCount is never undefined and serialize decimals
    const safeCompany = serializeCompany({
      ...company,
      employeeCount: company.employeeCount ?? null,
    });
    await createAuditLog({
      companyId: company.id,
      action: "COMPANY_UPDATED",
      entity: "COMPANY",
      entityId: company.id,
      details: `Company updated: ${company.name}`,
    });
    return { success: true, data: safeCompany };
  } catch (error) {
    console.error("Update company error:", error);
    return {
      success: false,
      data: null as any,
      error: "Failed to update company",
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Wrapper function for client-side use
export async function deleteCompany(
  id: string,
): Promise<ActionResponse<Company>> {
  try {
    const company = await prisma.company.delete({
      where: { id },
    });
    await createAuditLog({
      companyId: company.id,
      action: "COMPANY_DELETED",
      entity: "COMPANY",
      entityId: company.id,
      details: `Company deleted: ${company.name}`,
    });
    return { success: true, data: company };
  } catch (error) {
    console.error("Delete company error:", error);
    return {
      success: false,
      data: null as any,
      error: "Failed to delete company",
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function registerCompany(
  data: RegistrationData,
): Promise<{ success: boolean; redirectUrl?: string; error?: string }> {
  const state: RegistrationState = { bucketCreated: false };
  let company;

  try {
    // 1. Create company in Prisma with all onboarding data
    console.log("Creating company with data:", {
      name: data.companyName,
      industry: data.industry,
      companySize: data.companySize,
      assetCount: data.assetCount,
      useCases: data.useCase,
      painPoints: data.painPoints,
      primaryContactEmail: data.primaryContactEmail,
      firstName: data.firstName,
      lastName: data.lastName,
    });

    company = await prisma.company.create({
      data: {
        name: data.companyName,
        status: data.status as CompanyStatus,
        primaryContactEmail: data.primaryContactEmail,
        industry: data.industry,
        employeeCount: data.companySize
          ? parseCompanySize(data.companySize)
          : null, // Convert "1-10" to 1, "500+" to 500, etc.
        notes: JSON.stringify({
          assetCount: data.assetCount,
          useCases: data.useCase,
          painPoints: data.painPoints,
          phoneNumber: data.phoneNumber,
          plan: data.plan,
          onboardingCompletedAt: new Date().toISOString(),
        }),
      },
    });

    console.log("Company created successfully:", company.id);
    state.companyId = company.id;

    // Check if this is a Starter plan and apply user restrictions
    const isStarterPlan = data.plan === "starter";
    if (isStarterPlan) {
      console.log("Starter plan detected - restricting to 1 user only");
    }

    await createAuditLog({
      companyId: company.id,
      action: "COMPANY_CREATED",
      entity: "COMPANY",
      entityId: company.id,
      details: `Company registered: ${company.name} by email ${data.email} - Industry: ${data.industry}, Size: ${data.companySize}, Assets: ${data.assetCount}, Plan: ${data.plan || "Premium"}`,
    });

    // 2. Create an Admin role
    const adminRole = await prisma.role.create({
      data: {
        name: "Admin",
        companyId: company.id,
        isAdmin: true, // Mark as admin role
      },
    });

    // 3. Create the user in Prisma DB
    if (!data.clerkUserId) {
      throw new Error("Clerk User ID is missing.");
    }

    // Use the existing createPrismaUser function instead
    const prismaUser = await createPrismaUser({
      email: data.email,
      companyId: company.id,
      firstName: data.firstName,
      lastName: data.lastName,
      title: "Administrator",
      employeeId: "001",
      roleId: adminRole.id,
      clerkUserId: data.clerkUserId,
    });

    if (!prismaUser) {
      throw new Error("Failed to create a user in the database.");
    }

    // --- DEFAULT MAINTENANCE CATEGORIES & TYPES (IDEMPOTENT) ---
    const defaultCategories = [
      {
        name: "Preventive",
        description: "Scheduled maintenance to prevent issues",
        color: "#22C55E",
      },
      {
        name: "Corrective",
        description: "Fix existing problems",
        color: "#F59E0B",
      },
      {
        name: "Emergency",
        description: "Urgent maintenance",
        color: "#EF4444",
      },
    ];
    const defaultTypes = [
      {
        name: "Oil Change",
        description: "Regular engine oil replacement",
        categoryName: "Preventive",
        priority: "Medium",
        color: "#3B82F6",
        icon: "wrench",
      },
      {
        name: "Filter Replacement",
        description: "Replace air or oil filters",
        categoryName: "Preventive",
        priority: "Low",
        color: "#22C55E",
        icon: "tool",
      },
      {
        name: "Breakdown Repair",
        description: "Fix equipment breakdowns",
        categoryName: "Corrective",
        priority: "High",
        color: "#EF4444",
        icon: "alert",
      },
    ];
    // 1. Create default categories if not exist
    for (const cat of defaultCategories) {
      const exists = await prisma.maintenanceCategory.findFirst({
        where: { name: cat.name, companyId: company.id },
      });
      if (!exists) {
        await prisma.maintenanceCategory.create({
          data: { ...cat, companyId: company.id },
        });
      }
    }
    // 2. Create default types if not exist, linking to the right category
    for (const type of defaultTypes) {
      // Find the category (should exist now)
      const category = await prisma.maintenanceCategory.findFirst({
        where: { name: type.categoryName, companyId: company.id },
      });
      if (!category) continue;
      const exists = await prisma.maintenanceType.findFirst({
        where: { name: type.name, companyId: company.id },
      });
      if (!exists) {
        await prisma.maintenanceType.create({
          data: {
            name: type.name,
            description: type.description,
            categoryId: category.id,
            priority: type.priority,
            color: type.color,
            icon: type.icon,
            companyId: company.id,
            requiredSkills: [],
            checklist: [],
            customFields: [],
            estimatedDuration: 1,
            defaultCost: 0,
            isActive: true,
          },
        });
      }
    }
    // --- END DEFAULT MAINTENANCE CATEGORIES & TYPES ---

    // 4. Find or create a Clerk organization for the company
    let organization;
    const clerk = await clerkClient();
    const orgListResponse = await clerk.organizations.getOrganizationList({
      query: data.companyName,
    });
    const existingOrg = orgListResponse.data.find(
      (org: any) => org.name === data.companyName,
    );

    if (existingOrg) {
      organization = existingOrg;
    } else {
      organization = await clerk.organizations.createOrganization({
        name: data.companyName,
        createdBy: data.clerkUserId,
      });
    }

    // Ensure the user is an admin in the organization
    const { data: membershipList } =
      await clerk.users.getOrganizationMembershipList({
        userId: data.clerkUserId,
      });

    const membership = membershipList.find(
      (m) => m.organization.id === organization.id,
    );

    if (!membership) {
      await clerk.organizations.createOrganizationMembership({
        organizationId: organization.id,
        userId: data.clerkUserId,
        role: "org:admin",
      });
    } else if (membership.role !== "org:admin") {
      await clerk.organizations.updateOrganizationMembership({
        organizationId: organization.id,
        userId: data.clerkUserId,
        role: "org:admin",
      });
    }

    // 5. Update company with Clerk organization ID
    await prisma.company.update({
      where: { id: company.id },
      data: { clerkOrgId: organization.id },
    });

    // 6. Apply Starter plan restrictions if applicable
    if (isStarterPlan) {
      console.log("Applying Starter plan restrictions - limiting to 1 user");

      // Update Clerk user metadata with plan restriction
      await clerk.users.updateUserMetadata(data.clerkUserId, {
        publicMetadata: {
          userId: prismaUser.id,
          role: "Admin",
          onboardingComplete: true,
          plan: "starter",
          userLimit: 1, // Restrict to 1 user for Starter plan
        },
        privateMetadata: {
          companyId: company.id,
          clerkOrgId: organization.id,
          planRestrictions: {
            maxUsers: 1,
            plan: "starter",
          },
        },
      });
    } else {
      // Standard metadata for other plans
      await clerk.users.updateUserMetadata(data.clerkUserId, {
        publicMetadata: {
          userId: prismaUser.id,
          role: "Admin",
          onboardingComplete: true,
          plan: data.plan || "professional",
        },
        privateMetadata: {
          companyId: company.id,
          clerkOrgId: organization.id,
        },
      });
    }

    // 7. Send welcome email
    try {
      await EmailService.sendEmail({
        to: data.email,
        subject: "Welcome to EcoKeepr!",
        templateName: "welcome",
        templateData: {
          firstName: data.firstName,
          companyName: data.companyName,
        },
      });
    } catch (emailError) {
      console.warn("Failed to send welcome email:", emailError);
      // Don't fail the entire registration for email issues
    }

    // 8. Create Stripe Subscription
    const subscriptionResponse = await createSubscription(
      company.id,
      data.email,
      data.assetCount || 100,
    );
    if (!subscriptionResponse.success) {
      console.error(
        "Subscription creation failed:",
        subscriptionResponse.error,
      );
      throw new Error("Failed to create a subscription.");
    }

    // For free plans, there might be no redirect URL
    const redirectUrl =
      subscriptionResponse.url || `/dashboard?subscription_success=true`;

    // 9. Initialize S3 Storage
    try {
      const s3Service = S3Service.getInstance();
      await s3Service.initializeCompanyStorage(company.id);
      state.bucketCreated = true;
    } catch (s3Error) {
      console.warn("Failed to initialize S3 storage:", s3Error);
      // Don't fail the entire registration for S3 issues
    }

    // 10. Bulk Insert Templates
    try {
      // Find the first category to use as default
      const defaultCategory = await prisma.category.findFirst({
        where: { companyId: company.id },
      });
      if (defaultCategory) {
        await bulkInsertTemplates(company.id, defaultCategory.id);
      }
    } catch (templateError) {
      console.warn("Failed to insert templates:", templateError);
      // Don't fail the entire registration for template issues
    }

    return { success: true, redirectUrl };
  } catch (error) {
    console.error("Error during company registration:", error);
    await cleanup(state);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unknown error occurred during registration",
    };
  } finally {
    await prisma.$disconnect();
  }
}

// New helper to create user in Prisma, linked to a Clerk ID
async function createPrismaUser({
  email,
  companyId,
  firstName,
  lastName,
  title,
  employeeId,
  roleId,
  clerkUserId,
}: {
  email: string;
  companyId: string;
  firstName: string;
  lastName: string;
  title: string;
  employeeId: string;
  roleId: string;
  clerkUserId: string;
}): Promise<User> {
  const userData = {
    email,
    name: `${firstName} ${lastName}`,
    companyId,
    firstName,
    lastName,
    title,
    roleId,
    oauthId: clerkUserId,
  };

  return prisma.user.upsert({
    where: { oauthId: clerkUserId },
    update: userData,
    create: userData,
  });
}

// Helper to serialize Decimal fields for client
function serializeCompany(company: any) {
  return {
    ...company,
    targetEnergy: company.targetEnergy ? company.targetEnergy.toString() : null,
    targetCarbonReduction: company.targetCarbonReduction
      ? company.targetCarbonReduction.toString()
      : null,
  };
}
