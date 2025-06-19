"use server";

import { CompanyStatus, Prisma } from "@prisma/client";
import { prisma } from "@/app/db";
import S3Service from "@/services/aws/S3";
import { bulkInsertTemplates } from "@/lib/actions/formTemplate.actions";
import { RegistrationData } from "@/components/providers/UserContext";
import { parseStringify } from "@/lib/utils";
import { createSubscription } from "@/lib/actions/subscription.actions";
import { withAuth } from "@/lib/middleware/withAuth";
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
  async (user): Promise<ActionResponse<Company[]>> => {
    try {
      const companies = await prisma.company.findMany();
      return { success: true, data: companies };
    } catch (error) {
      console.error("Get companies error:", error);
      return { success: false, error: "Failed to fetch companies" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function getAllCompanies(): Promise<ActionResponse<Company[]>> {
  const session = getSession();
  return getAll(session);
}

export const insert = withAuth(
  async (user, data: RegistrationData): Promise<ActionResponse<Company>> => {
    try {
      const company = await prisma.company.create({
        data: {
          name: data.companyName,
        },
      });
      return { success: true, data: company };
    } catch (error) {
      console.error("Create company error:", error);
      return { success: false, error: "Failed to create company" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function createCompany(
  data: RegistrationData,
): Promise<ActionResponse<Company>> {
  const session = getSession();
  return insert(session, data);
}

export const update = withAuth(
  async (user, id: string, name: string): Promise<ActionResponse<Company>> => {
    try {
      const company = await prisma.company.update({
        where: { id },
        data: { name },
      });
      return { success: true, data: company };
    } catch (error) {
      console.error("Update company error:", error);
      return { success: false, error: "Failed to update company" };
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
  return update(session, id, name);
}

export const remove = withAuth(
  async (user, id: string): Promise<ActionResponse<Company>> => {
    try {
      const company = await prisma.company.delete({
        where: { id },
      });
      return { success: true, data: company };
    } catch (error) {
      console.error("Delete company error:", error);
      return { success: false, error: "Failed to delete company" };
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
  return remove(session, id);
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
