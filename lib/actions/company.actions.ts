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

interface RegistrationState {
  companyId?: string;
  bucketCreated: boolean;
}

const handlePrismaError = (error: Prisma.PrismaClientKnownRequestError) => {
  const errorMap: Record<string, string> = {
    P2002: "Company name already exists",
    P2003: "Invalid reference",
    P2025: "Company not found",
  };

  return {
    success: false,
    error: errorMap[error.code] || "Database error",
  };
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

const getSession = () => {
  const cookieStore = cookies();
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
  const session = getSession();
  return getAll();
}

export const update = withAuth(
  async (user, id: string, name: string): Promise<AuthResponse<Company>> => {
    try {
      const company = await prisma.company.update({
        where: { id },
        data: { name },
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
  name: string,
): Promise<ActionResponse<Company>> {
  const session = getSession();
  return update(id, name);
}

export const remove = withAuth(
  async (user, id: string): Promise<AuthResponse<Company>> => {
    try {
      const company = await prisma.company.delete({
        where: { id },
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
  },
);

// Wrapper function for client-side use
export async function deleteCompany(
  id: string,
): Promise<ActionResponse<Company>> {
  const session = getSession();
  return remove(id);
}

export async function registerCompany(
  data: RegistrationData,
): Promise<{ success: boolean; redirectUrl?: string; error?: string }> {
  console.log("Starting company registration for:", data.companyName);
  const state: RegistrationState = { bucketCreated: false };
  let company;

  try {
    console.log("Clerk client initialized.");

    // 1. Create company in Prisma
    console.log("Step 1: Creating company in Prisma...");
    company = await prisma.company.create({
      data: {
        name: data.companyName,
        status: data.status as CompanyStatus,
        primaryContactEmail: data.primaryContactEmail,
      },
    });
    state.companyId = company.id;
    console.log("Company created successfully with ID:", company.id);

    // 2. Create an Admin role
    console.log("Step 2: Creating Admin role...");
    const adminRole = await prisma.role.create({
      data: {
        name: "Admin",
        companyId: company.id,
        isAdmin: true, // Mark as admin role
      },
    });
    console.log("Admin role created with ID:", adminRole.id);

    // 3. Create the user in Prisma DB
    console.log("Step 3: Creating user in Prisma...");
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
    console.log("Prisma user created successfully with ID:", prismaUser.id);

    // 4. Find or create a Clerk organization for the company
    console.log(
      "Step 4: Finding or creating a Clerk organization for the company...",
    );
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
      console.log(
        `Found existing organization for "${data.companyName}" with ID: ${organization.id}`,
      );
    } else {
      console.log(
        `No organization found for "${data.companyName}", creating a new one...`,
      );
      organization = await clerk.organizations.createOrganization({
        name: data.companyName,
        createdBy: data.clerkUserId,
      });
      console.log("Clerk organization created with ID:", organization.id);
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
      console.log("User added to organization as admin.");
    } else if (membership.role !== "org:admin") {
      await clerk.organizations.updateOrganizationMembership({
        organizationId: organization.id,
        userId: data.clerkUserId,
        role: "org:admin",
      });
      console.log("User membership updated to admin.");
    } else {
      console.log("User is already an admin of the organization.");
    }

    // 5. Update company with Clerk organization ID
    console.log("Step 5: Updating company with Clerk organization ID...");
    await prisma.company.update({
      where: { id: company.id },
      data: { clerkOrgId: organization.id },
    });
    console.log("Company updated with organization ID.");

    // 6. Update Clerk user metadata (SECURE - companyId in private metadata only)
    console.log("Step 6: Updating Clerk user metadata...");
    await clerk.users.updateUserMetadata(data.clerkUserId, {
      publicMetadata: {
        userId: prismaUser.id,
        role: "Admin",
        onboardingComplete: true, // Mark onboarding as complete
        // companyId removed from public metadata for security
      },
      privateMetadata: {
        companyId: company.id, // companyId in private metadata only
        clerkOrgId: organization.id,
      },
    });
    console.log("User metadata updated securely.");

    // 7. Send welcome email
    console.log("Step 7: Sending welcome email...");
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
      console.log("Welcome email sent successfully.");
    } catch (emailError) {
      console.warn("Failed to send welcome email:", emailError);
      // Don't fail the entire registration for email issues
    }

    // 8. Create Stripe Subscription
    console.log("Step 8: Creating Stripe subscription...");
    const subscriptionResponse = await createSubscription(
      company.id,
      data.email,
      data.assetCount || 100,
    );
    if (!subscriptionResponse.success || !subscriptionResponse.url) {
      console.error(
        "Subscription creation failed:",
        subscriptionResponse.error,
      );
      throw new Error("Failed to create a subscription.");
    }
    console.log(
      "Stripe subscription created. Redirect URL:",
      subscriptionResponse.url,
    );

    // 9. Initialize S3 Storage
    console.log("Step 9: Initializing S3 storage...");
    try {
      const s3Service = S3Service.getInstance();
      await s3Service.initializeCompanyStorage(company.id);
      state.bucketCreated = true;
      console.log("S3 storage initialized.");
    } catch (s3Error) {
      console.warn("Failed to initialize S3 storage:", s3Error);
      // Don't fail the entire registration for S3 issues
    }

    // 10. Bulk Insert Templates
    console.log("Step 10: Bulk inserting templates...");
    try {
      await bulkInsertTemplates(company.id);
      console.log("Templates inserted.");
    } catch (templateError) {
      console.warn("Failed to insert templates:", templateError);
      // Don't fail the entire registration for template issues
    }

    console.log("Company registration completed successfully.");
    return { success: true, redirectUrl: subscriptionResponse.url };
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
    console.log("Disconnecting Prisma client.");
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
