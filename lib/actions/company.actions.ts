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

export const insert = async (values: RegistrationData) => {
  const state: RegistrationState = { bucketCreated: false };
  console.log("values", values);

  let company;
  let adminRole;
  try {
    // 1. Create company and role in a transaction (DB only)
    const result = await prisma.$transaction(async (tx) => {
      let role = await tx.role.findUnique({ where: { name: "Admin" } });
      if (!role) {
        role = await tx.role.create({
          data: { name: "Admin", isAdctive: true },
        });
      }
      adminRole = role;
      company = await tx.company.create({
        data: {
          name: values.companyName,
          status: CompanyStatus.INACTIVE,
        },
      });
      return { company, adminRole };
    });
    company = result.company;
    adminRole = result.adminRole;
    state.companyId = company.id;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Prisma error:", error.code, error.message, error.meta);
      return handlePrismaError(error);
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Registration failed",
    };
  } finally {
    await prisma.$disconnect();
  }

  // 2. Initialize S3 storage (outside transaction)
  try {
    const s3Service = S3Service.getInstance();
    await s3Service.initializeCompanyStorage(company.id);
    state.bucketCreated = true;
  } catch (s3Error) {
    // Rollback company if S3 fails
    await cleanup(state);
    return {
      success: false,
      error: "Failed to initialize company storage. Please try again.",
    };
  }

  // 3. Create user in Supabase Auth (outside transaction)
  let userResult;
  try {
    userResult = await createUserForRegistration({
      email: values.email,
      companyId: company.id,
      firstName: values.firstName,
      lastName: values.lastName,
      title: "Admin",
      employeeId: adminRole.name,
      roleId: adminRole.id,
      password: values.password,
    });
  } catch (userError) {
    // Rollback company and S3 if user creation fails
    await cleanup(state);
    return {
      success: false,
      error:
        userError instanceof Error
          ? userError.message
          : "User registration failed",
    };
  }

  // 4. Post-registration actions (subscription, templates)
  try {
    const [subscriptionResult] = await Promise.all([
      createSubscription(company.id, values.email, values.assetCount),
      bulkInsertTemplates(company.id),
    ]);
    return {
      success: true,
      data: parseStringify(company),
      redirectUrl: subscriptionResult?.url!,
    };
  } catch (postError) {
    // Optionally: log and inform user, but do not rollback company/user for non-critical failures
    console.error("Post-registration error:", postError);
    return {
      success: true,
      data: parseStringify(company),
      redirectUrl: undefined,
      warning:
        "Registration succeeded, but some setup steps failed. Please contact support if you experience issues.",
    };
  } finally {
    await prisma.$disconnect();
  }
};

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
  console.log("[createUserForRegistration] Creating user in Supabase Auth:", {
    email,
    companyId,
    firstName,
    lastName,
    title,
    employeeId,
    roleId,
  });
  // 2. Create user in Supabase Auth with metadata
  const { data: createdUser, error } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        firstName,
        lastName,
        companyId,
        roleId,
        title,
        employeeId,
      },
    });
  if (error || !createdUser.user) {
    console.error(
      "[createUserForRegistration] Supabase registration failed:",
      error?.message,
    );
    // Throw a real error so the caller can handle it
    throw new Error(error?.message || "Supabase registration failed");
  }
  console.log(
    "[createUserForRegistration] User created in Supabase Auth:",
    createdUser.user.id,
  );
  // 2. Do NOT create the user in your DB here! The webhook will handle it.
  return createdUser.user;
}

export const remove = withAuth(async (user, id: string) => {
  try {
    const company = await prisma.company.delete({
      where: {
        id: user.user_metadata?.companyId,
      },
    });

    try {
      await S3Service.getInstance().deleteCompanyStorage(id);
    } catch (s3Error) {
      console.error("S3 cleanup failed:", s3Error);
    }

    return {
      success: true,
      data: parseStringify(company),
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return handlePrismaError(error);
    }
    return {
      success: false,
      error: "Failed to delete company",
    };
  } finally {
    await prisma.$disconnect();
  }
});

export const update = withAuth(async (user, id: string, name: string) => {
  try {
    const company = await prisma.company.update({
      where: {
        id: user.user_metadata?.companyId,
      },
      data: { name },
    });

    return {
      success: true,
      data: parseStringify(company),
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return handlePrismaError(error);
    }
    return {
      success: false,
      error: "Failed to update company",
    };
  } finally {
    await prisma.$disconnect();
  }
});

export const getAll = withAuth(async (user) => {
  try {
    const companies = await prisma.company.findMany({
      where: {
        // Only return companies the user has access to
        id: user.user_metadata?.companyId,
      },
    });

    return {
      success: true,
      data: parseStringify(companies),
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to fetch companies",
    };
  } finally {
    await prisma.$disconnect();
  }
});
