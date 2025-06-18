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

  try {
    const companyInsertResult = await prisma.$transaction(
      async (tx) => {
        const role = await tx.role.findUnique({
          where: { name: "Admin" },
        });

        if (!role) {
          throw new Error("Admin role not found");
        }

        const company = await tx.company.create({
          data: {
            name: values.companyName,
            status: CompanyStatus.INACTIVE,
          },
        });

        state.companyId = company.id;

        const s3Service = S3Service.getInstance();
        await s3Service.initializeCompanyStorage(company.id);
        state.bucketCreated = true;

        const userResult = await createUserForRegistration({
          email: values.email,
          companyId: company.id,
          firstName: values.firstName,
          lastName: values.lastName,
          title: "Admin",
          employeeId: role.name,
          roleId: role.id,
        });

        if (!userResult) {
          throw new Error("Failed to create user");
        }

        return company;
      },
      {
        maxWait: 10000,
        timeout: 30000,
      },
    );

    const [subscriptionResult] = await Promise.all([
      createSubscription(
        companyInsertResult.id,
        values.email,
        values.assetCount,
      ),
      bulkInsertTemplates(),
    ]);

    return {
      success: true,
      data: parseStringify(companyInsertResult),
      redirectUrl: subscriptionResult?.url!,
    };
  } catch (error) {
    if (state.companyId) {
      await cleanup(state);
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return handlePrismaError(error);
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Registration failed",
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
}: {
  email: string;
  companyId: string;
  firstName: string;
  lastName: string;
  title: string;
  employeeId: string;
  roleId: string;
}): Promise<User | null> {
  // You may want to add Supabase registration here if needed
  return await mainPrisma.user.create({
    data: {
      name: `${firstName} ${lastName}`,
      email,
      firstName,
      lastName,
      employeeId,
      title,
      roleId,
      companyId,
      emailVerified: null,
    },
  });
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
