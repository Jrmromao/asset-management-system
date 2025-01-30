"use server";

import { CompanyStatus, Prisma } from "@prisma/client";
import { prisma } from "@/app/db";
import S3Service from "@/services/aws/S3";
import { bulkInsertTemplates } from "@/lib/actions/formTemplate.actions";
// import { createSubscription } from "@/lib/actions/subscription.actions";
import { RegistrationData } from "@/components/providers/UserContext";
import { parseStringify } from "@/lib/utils";
import { createSubscription } from "@/lib/actions/subscription.actions";
import { registerUser } from "@/lib/actions/user.actions";

interface RegistrationState {
  companyId?: string;
  bucketCreated: boolean;
}

const handlePrismaError = (
  error: Prisma.PrismaClientKnownRequestError,
): ActionResponse<Company> => {
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

export const insert = async (
  values: RegistrationData,
): Promise<ActionResponse<Company>> => {
  const state: RegistrationState = { bucketCreated: false };

  try {
    const companyInsertResult = await prisma.$transaction(
      async (tx) => {
        // 1. Verify role existence first
        const role = await tx.role.findUnique({
          where: { name: "Admin" },
        });

        if (!role) {
          throw new Error("Admin role not found");
        }

        // 2. Create company
        const company = await tx.company.create({
          data: {
            name: values.companyName,
            status: CompanyStatus.INACTIVE,
          },
        });

        // 3. Store company ID in state
        state.companyId = company.id;

        // 4. Initialize S3 storage
        const s3Service = S3Service.getInstance();
        await s3Service.initializeCompanyStorage(company.id);
        state.bucketCreated = true;

        // 5. Create user with explicit transaction connection
        const userResult = await registerUser(
          {
            email: values.email,
            password: values.password,
            companyId: company.id,
            firstName: values.firstName,
            lastName: values.lastName,
            title: "Admin",
            employeeId: role.name,
            roleId: role.id,
          },
          tx,
        );

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

    // 6. Setup company resources
    const [subscriptionResult] = await Promise.all([
      createSubscription(
        companyInsertResult.id,
        values.email,
        values.assetCount,
      ),
      bulkInsertTemplates(companyInsertResult.id),
    ]);

    return {
      success: true,
      data: parseStringify(companyInsertResult),
      redirectUrl: subscriptionResult?.url!,
    };
  } catch (error) {
    // Only attempt cleanup if we have a company ID
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
  }
};

// Modify the cleanup function to check existence before deletion
const cleanup = async (state: RegistrationState) => {
  try {
    if (state.companyId) {
      // Check if company exists before trying to delete
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
  }
};
export const remove = async (id: string): Promise<ActionResponse<Company>> => {
  try {
    const company = await prisma.company.delete({ where: { id } });
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
      if (error.code === "P2025") {
        return { success: false, error: "Company not found" };
      }
    }
    return { success: false, error: "Failed to delete company" };
  }
};

export const update = async (
  id: string,
  name: string,
): Promise<ActionResponse<string>> => {
  try {
    await prisma.company.update({
      where: { id },
      data: { name },
    });

    return {
      success: true,
      data: "Company updated successfully",
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return { success: false, error: "Company name already exists" };
      }
      if (error.code === "P2025") {
        return { success: false, error: "Company not found" };
      }
    }
    return { success: false, error: "Failed to update company" };
  }
};

export const getAll = async (): Promise<ActionResponse<Company[]>> => {
  try {
    const companies = await prisma.company.findMany();
    return {
      success: true,
      data: parseStringify(companies),
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to fetch companies",
    };
  }
};
