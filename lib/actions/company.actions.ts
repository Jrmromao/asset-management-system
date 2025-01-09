"use server";

import { registerUser } from "./user.actions";
import { Prisma } from "@prisma/client";
import { registerSchema } from "@/lib/schemas";
import { z } from "zod";
import { prisma } from "@/app/db";
import S3Service from "@/services/aws/S3";

export const registerCompany = async (
  values: z.infer<typeof registerSchema>,
): Promise<ActionResponse<string>> => {
  const validation = await registerSchema.safeParseAsync(values);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
    };
  }

  console.log(validation);
  console.log(validation.data);

  const { companyName, lastName, firstName, email, password, phoneNumber } =
    validation.data;

  try {
    // Step 1: Verify role exists
    const role = await prisma.role.findUnique({
      where: { name: "Admin" },
    });

    if (!role) {
      return {
        success: false,
        error: "Admin role not found",
      };
    }

    // Step 2: Check if company exists
    const existingCompany = await prisma.company.findFirst({
      where: { name: companyName },
    });

    if (existingCompany) {
      return {
        success: false,
        error: "A company with this name already exists",
      };
    }

    // Step 3: Create company
    const company = await prisma.company.create({
      data: {
        name: companyName,
      },
    });

    // Step 4: Create S3 bucket for the company
    const s3Service = S3Service.getInstance();
    let bucketCreated = false;

    try {
      await s3Service.initializeCompanyStorage(company.id);
      bucketCreated = true;
    } catch (s3Error: unknown) {
      // Cleanup: Delete company if bucket creation fails
      await prisma.company.delete({
        where: { id: company.id },
      });

      const errorMessage =
        s3Error instanceof Error
          ? s3Error.message
          : "Failed to initialize company storage";
      return {
        success: false,
        error: errorMessage,
      };
    }

    // Step 5: Verify company exists after creation
    const verifyCompany = await prisma.company.findUnique({
      where: { id: company.id },
    });

    if (!verifyCompany) {
      // Attempt to cleanup S3 bucket if company verification fails
      if (bucketCreated) {
        try {
          await s3Service.deleteCompanyStorage(company.id);
        } catch (cleanupError: unknown) {
          console.error("Failed to cleanup S3 bucket:", cleanupError);
        }
      }
      throw new Error("Company creation failed verification");
    }

    // Step 6: Register user
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

    try {
      const userResult = await registerUser(userObject);

      if ("error" in userResult) {
        // Cleanup: Delete company and S3 bucket if user registration fails
        if (bucketCreated) {
          try {
            await s3Service.deleteCompanyStorage(company.id);
          } catch (cleanupError: unknown) {
            console.error("Failed to cleanup S3 bucket:", cleanupError);
          }
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
      return {
        success: true,
        data: "Company registered successfully",
      };
    } catch (userError) {
      // Cleanup on unexpected user registration error
      if (bucketCreated) {
        try {
          await s3Service.deleteCompanyStorage(company.id);
        } catch (cleanupError: unknown) {
          console.error("Failed to cleanup S3 bucket:", cleanupError);
        }
      }

      await prisma.company.delete({
        where: { id: company.id },
      });

      throw userError;
    }
  } catch (error) {
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
