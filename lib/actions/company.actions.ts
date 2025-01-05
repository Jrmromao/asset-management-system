"use server";

import { registerUser } from "./user.actions";
import { Prisma } from "@prisma/client";
import { registerSchema } from "@/lib/schemas";
import { z } from "zod";
import { prisma } from "@/app/db";
import logger from "@/lib/logger";
import S3 from "@/services/aws/S3";

export const registerCompany = async (
  values: z.infer<typeof registerSchema>,
): Promise<ActionResponse<string>> => {
  const validation = await registerSchema.safeParseAsync(values);
  if (!validation.success) {
    logger.warn("Registration validation failed", {
      issues: validation.error.issues,
      email: values.email,
    });
    return {
      success: false,
      error: validation.error.issues[0].message,
    };
  }

  const { companyName, lastName, firstName, email, password, phoneNumber } =
    validation.data;

  try {
    // Step 1: Verify role exists
    logger.info("Step 1: Verifying admin role exists");
    const role = await prisma.role.findUnique({
      where: { name: "Admin" },
    });

    if (!role) {
      logger.error("Admin role not found during registration");
      return {
        success: false,
        error: "Admin role not found",
      };
    }

    // Step 2: Check if company exists
    logger.info("Step 2: Checking if company exists", { companyName });
    const existingCompany = await prisma.company.findFirst({
      where: { name: companyName },
    });

    if (existingCompany) {
      logger.warn("Company already exists", { companyName });
      return {
        success: false,
        error: "A company with this name already exists",
      };
    }

    // Step 3: Create company
    logger.info("Step 3: Creating company", { companyName });
    const company = await prisma.company.create({
      data: {
        name: companyName,
      },
    });

    logger.info("Company created successfully", {
      companyId: company.id,
      companyName: company.name,
    });

    // Step 4: Create S3 bucket for the company
    logger.info("Step 4: Creating S3 bucket for company", {
      companyId: company.id,
    });
    const s3Service = S3.getInstance();
    try {
      await s3Service.createCompanyBucket(company.id);
      logger.info("S3 bucket created successfully", { companyId: company.id });
    } catch (s3Error: unknown) {
      logger.error("Failed to create S3 bucket, cleaning up company", {
        companyId: company.id,
        error: s3Error instanceof Error ? s3Error.message : "Unknown error",
      });

      // Cleanup: Delete company if bucket creation fails
      await prisma.company.delete({
        where: { id: company.id },
      });

      return {
        success: false,
        error: "Failed to initialize company storage",
      };
    }

    // Step 5: Verify company exists after creation
    const verifyCompany = await prisma.company.findUnique({
      where: { id: company.id },
    });

    if (!verifyCompany) {
      logger.error("Company creation verification failed");
      // Attempt to cleanup S3 bucket if company verification fails
      try {
        await s3Service.deleteBucket(company.id);
      } catch (cleanupError: unknown) {
        logger.error(
          "Failed to cleanup S3 bucket after company verification failure",
          {
            companyId: company.id,
            error:
              cleanupError instanceof Error
                ? cleanupError.message
                : "Unknown error",
          },
        );
      }
      throw new Error("Company creation failed verification");
    }

    // Step 6: Register user
    logger.info("Step 6: Starting user registration", {
      email,
      companyId: company.id,
    });

    const userObject: RegUser = {
      email,
      password,
      roleId: role.id,
      title: "Admin",
      employeeId: role.name,
      companyId: company.id,
      firstName,
      lastName,
      phoneNumber,
    };

    const userResult = await registerUser(userObject);

    if ("error" in userResult) {
      logger.error(
        "User registration failed, cleaning up company and S3 bucket",
        {
          companyId: company.id,
          error: userResult.error,
        },
      );

      // Cleanup: Delete company and S3 bucket if user registration fails
      try {
        await s3Service.deleteBucket(company.id);
      } catch (cleanupError: unknown) {
        logger.error(
          "Failed to cleanup S3 bucket after user registration failure",
          {
            companyId: company.id,
            error:
              cleanupError instanceof Error
                ? cleanupError.message
                : "Unknown error",
          },
        );
      }

      await prisma.company.delete({
        where: { id: company.id },
      });

      return {
        success: false,
        error: userResult.error,
      };
    }

    // Step 7: Final verification
    logger.info("Registration process completed successfully", {
      companyId: company.id,
      companyName: company.name,
      userResult,
    });

    return {
      success: true,
      data: "Company registered successfully",
    };
  } catch (error) {
    logger.error("Error in registerCompany", {
      error: error instanceof Error ? error.stack : String(error),
      companyName,
      email,
      errorCode:
        error instanceof Prisma.PrismaClientKnownRequestError
          ? error.code
          : undefined,
    });

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2002":
          return {
            success: false,
            error: "A company with this name already exists",
          };
        case "P2003":
          return {
            success: false,
            error: "Invalid reference to company or role",
          };
        default:
          return {
            success: false,
            error: "Database error occurred during registration",
          };
      }
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to register company",
    };
  }
};
