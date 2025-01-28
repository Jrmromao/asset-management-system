"use server";

import { registerUser } from "./user.actions";
import { Prisma } from "@prisma/client";
import { prisma } from "@/app/db";
import S3Service from "@/services/aws/S3";
import { bulkInsertTemplates } from "@/lib/actions/formTemplate.actions";
import { createSubscription } from "@/lib/actions/subscription.actions";
import { RegistrationData } from "@/components/providers/UserContext";
import { parseStringify } from "@/lib/utils";

interface RegistrationState {
  companyId?: string;
  bucketCreated: boolean;
}

const cleanup = async (state: RegistrationState) => {
  try {
    if (state.bucketCreated && state.companyId) {
      await S3Service.getInstance().deleteCompanyStorage(state.companyId);
    }
    if (state.companyId) {
      await prisma.company.delete({
        where: { id: state.companyId },
      });
    }
  } catch (err) {
    console.error("Cleanup failed:", err);
    // Continue execution as this is already in error handling
  }
};

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
    const result = await prisma.$transaction(
      async (tx) => {
        // Verify role existence
        const role = await tx.role.findUnique({
          where: { name: "Admin" },
        });
        if (!role) {
          throw new Error("Admin role not found");
        }

        // Create company
        const company = await tx.company.create({
          data: { name: values.companyName },
        });
        state.companyId = company.id;

        // Initialize S3 storage
        const s3Service = S3Service.getInstance();
        await s3Service.initializeCompanyStorage(company.id);
        state.bucketCreated = true;

        // Register admin user
        const userResult = await registerUser({
          email: values.email,
          password: values.password,
          roleId: role.id,
          title: "Admin",
          employeeId: role.name,
          companyId: company.id,
          firstName: values.firstName,
          lastName: values.lastName,
        });

        if ("error" in userResult) {
          throw new Error(userResult.error);
        }

        // Setup company resources
        await Promise.all([
          createSubscription(company.id, values.email, values.assetCount),
          bulkInsertTemplates(company.id),
        ]);

        return company;
      },
      {
        maxWait: 10000,
        timeout: 30000,
      },
    );

    return {
      success: true,
      data: parseStringify(result),
    };
  } catch (error) {
    await cleanup(state);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return handlePrismaError(error);
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Registration failed",
    };
  }
};

export const remove = async (id: string): Promise<ActionResponse<Company>> => {
  try {
    const company = await prisma.company.delete({ where: { id } });
    // Attempt to cleanup S3 storage
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
