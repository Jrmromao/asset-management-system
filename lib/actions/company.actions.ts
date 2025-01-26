"use server";

import { registerUser } from "./user.actions";
import { Prisma } from "@prisma/client";
import { registerSchema } from "@/lib/schemas";
import { z } from "zod";
import { prisma } from "@/app/db";
import S3Service from "@/services/aws/S3";
import { bulkInsertTemplates } from "@/lib/actions/formTemplate.actions";
import { createSubscription } from "@/lib/actions/subscription.actions";

interface RegistrationState {
  companyId?: string;
  bucketCreated: boolean;
}

const cleanup = async (state: RegistrationState) => {
  if (state.bucketCreated) {
    await S3Service.getInstance()
      .deleteCompanyStorage(state.companyId!)
      .catch((err) => console.error("S3 cleanup failed:", err));
  }
  if (state.companyId) {
    await prisma.company
      .delete({
        where: { id: state.companyId },
      })
      .catch((err) => console.error("Company deletion failed:", err));
  }
};

export const registerCompany = async (
  values: z.infer<typeof registerSchema>,
  assetCount = 0,
): Promise<ActionResponse<string>> => {
  const validation = await registerSchema.safeParseAsync(values);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
    };
  }

  const state: RegistrationState = { bucketCreated: false };
  const { companyName, lastName, firstName, email, password, phoneNumber } =
    validation.data;

  try {
    // Transaction for database operations
    const result = await prisma.$transaction(
      async (tx) => {
        // Verify role
        const role = await tx.role.findUnique({ where: { name: "Admin" } });
        if (!role) throw new Error("Admin role not found");

        // Check company existence
        const existingCompany = await tx.company.findFirst({
          where: { name: companyName },
        });
        if (existingCompany) throw new Error("Company already exists");

        // Create company
        const company = await tx.company.create({
          data: { name: companyName },
        });
        state.companyId = company.id;

        // Initialize S3
        const s3Service = S3Service.getInstance();
        await s3Service.initializeCompanyStorage(company.id);
        state.bucketCreated = true;

        // Create user
        const userResult = await registerUser({
          email,
          password,
          roleId: role.id,
          title: "Admin",
          employeeId: role.name,
          companyId: company.id,
          firstName,
          lastName,
          phoneNumber,
        });

        if ("error" in userResult) {
          throw new Error(userResult.error);
        }

        // Parallel operations
        await Promise.all([
          createSubscription(company.id, email, assetCount),
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
      data: "Company registered successfully",
    };
  } catch (error) {
    await cleanup(state);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2002":
          return { success: false, error: "Company name already exists" };
        case "P2003":
          return { success: false, error: "Invalid reference" };
        default:
          return { success: false, error: "Database error" };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Registration failed",
    };
  }
};
