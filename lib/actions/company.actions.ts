"use server";

import { CompanyStatus, Prisma } from "@prisma/client";
import { prisma } from "@/app/db";
import S3Service from "@/services/aws/S3";
import { bulkInsertTemplates } from "@/lib/actions/formTemplate.actions";
import { RegistrationData } from "@/components/providers/UserContext";
import { parseStringify } from "@/lib/utils";
import { createSubscription } from "@/lib/actions/subscription.actions";
import { AuthResponse, withAuth } from "@/lib/middleware/withAuth";
import { User } from "@prisma/client";
import { prisma as mainPrisma } from "@/app/db";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { cookies } from "next/headers";

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
  const state: RegistrationState = { bucketCreated: false };
  let company;

  try {
    // 1. Create company
    company = await prisma.company.create({
      data: {
        name: data.companyName,
        status: data.status as CompanyStatus,
        primaryContactEmail: data.primaryContactEmail,
      },
    });
    state.companyId = company.id;

    // 2. Create an Admin role
    const adminRole = await prisma.role.create({
      data: {
        name: "Admin",
        companyId: company.id,
      },
    });

    // 3. Create the user
    await createUserForRegistration({
      email: data.email,
      companyId: company.id,
      roleId: adminRole.id,
      firstName: data.firstName,
      lastName: data.lastName,
      password: data.password,
      title: "Administrator",
      employeeId: "001",
    });

    // 4. Create Stripe Subscription
    const subscriptionResponse = await createSubscription(
      company.id,
      data.email,
      data.assetCount || 100,
    );
    if (!subscriptionResponse.success || !subscriptionResponse.url) {
      throw new Error(
        subscriptionResponse.error || "Failed to create subscription",
      );
    }

    // 5. Initialize S3 Storage
    const s3Service = S3Service.getInstance();
    await s3Service.initializeCompanyStorage(company.id);
    state.bucketCreated = true;

    // 6. Bulk Insert Templates
    await bulkInsertTemplates(company.id);

    return { success: true, redirectUrl: subscriptionResponse.url };
  } catch (error) {
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

// Helper for registration user creation (no auth required)
async function createUserForRegistration({
  email,
  companyId,
  firstName,
  lastName,
  title,
  employeeId,
  roleId,
  password,
}: {
  email: string;
  companyId: string;
  firstName: string;
  lastName: string;
  title: string;
  employeeId: string;
  roleId: string;
  password: string;
}): Promise<any> {
  // 1. Check if user already exists using Supabase Admin API (listUsers workaround)
  const { data, error: fetchError } =
    await supabaseAdmin.auth.admin.listUsers();
  if (fetchError) {
    throw new Error("Failed to check for existing user: " + fetchError.message);
  }
  const existingUser = data?.users?.find((user) => user.email === email);
  if (existingUser) {
    throw new Error(
      "A user with this email address has already been registered",
    );
  }

  // 2. Create the user in Supabase Auth with metadata
  const { data: authUser, error: createError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        firstName,
        lastName,
        companyId,
        role: "Admin",
      },
    });

  if (createError || !authUser.user) {
    throw new Error("Failed to create auth user: " + createError?.message);
  }

  // 3. Create the user in the database
  try {
    const user = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email,
        firstName: String(firstName),
        lastName: String(lastName),
        employeeId,
        title,
        oauthId: authUser.user.id,
        roleId,
        companyId,
        emailVerified: new Date(),
      },
    });

    return { user, authUser };
  } catch (error) {
    // If database creation fails, clean up the auth user
    await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
    throw error;
  }
}
