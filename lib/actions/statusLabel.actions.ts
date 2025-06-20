"use server";

import { Prisma } from "@prisma/client";
import { parseStringify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/db";
import { withAuth, type AuthResponse } from "@/lib/middleware/withAuth";
import { cookies } from "next/headers";
import { z } from "zod";
import { statusLabelSchema } from "@/lib/schemas";
import type { StatusLabel } from "@prisma/client";

const getSession = () => {
  const cookieStore = cookies();
  return {
    accessToken: cookieStore.get("sb-access-token")?.value,
    refreshToken: cookieStore.get("sb-refresh-token")?.value,
  };
};

export const insert = withAuth(
  async (
    user,
    values: z.infer<typeof statusLabelSchema>,
  ): Promise<AuthResponse<StatusLabel>> => {
    try {
      console.log("Insert action called with values:", values);
      console.log("User metadata:", user.user_metadata);

      const validation = statusLabelSchema.safeParse(values);
      if (!validation.success) {
        console.error("Validation failed:", validation.error.errors);
        return {
          success: false,
          data: null as any,
          error: validation.error.errors[0].message,
        };
      }

      // Check if user has a companyId
      if (!user.user_metadata?.companyId) {
        console.error("User has no companyId");
        return {
          success: false,
          data: null as any,
          error: "User is not associated with a company",
        };
      }

      const data = validation.data;
      console.log("Validated data:", data);

      // Ensure all required fields are present with proper defaults
      const result = await prisma.statusLabel.create({
        data: {
          name: data.name.trim(),
          description: data.description?.trim() || "",
          colorCode: data.colorCode || "#3B82F6", // Ensure color is always provided
          isArchived: data.isArchived ?? false,
          allowLoan: data.allowLoan ?? true,
          companyId: user.user_metadata.companyId,
        },
      });

      console.log("Database insert successful:", result);

      revalidatePath("/status-labels");
      return { success: true, data: parseStringify(result) };
    } catch (error) {
      console.error("Insert action error:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return {
            success: false,
            data: null as any,
            error: "Status label name already exists in your company",
          };
        }
      }
      return {
        success: false,
        data: null as any,
        error: "Failed to create status label",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function createStatusLabel(
  values: z.infer<typeof statusLabelSchema>,
): Promise<AuthResponse<StatusLabel>> {
  return insert(values);
}

export const getAll = withAuth(
  async (user): Promise<AuthResponse<StatusLabel[]>> => {
    try {
      // Check if user has a companyId
      if (!user.user_metadata?.companyId) {
        return {
          success: false,
          data: null as any,
          error: "User is not associated with a company",
        };
      }

      const labels = await prisma.statusLabel.findMany({
        where: {
          companyId: user.user_metadata.companyId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return { success: true, data: parseStringify(labels) };
    } catch (error) {
      console.error("Error in getAll:", error);
      return {
        success: false,
        data: null as any,
        error: "Failed to fetch status labels",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function getAllStatusLabels(): Promise<
  AuthResponse<StatusLabel[]>
> {
  return getAll();
}

export const findById = withAuth(
  async (user, id: string): Promise<AuthResponse<StatusLabel>> => {
    try {
      // Check if user has a companyId
      if (!user.user_metadata?.companyId) {
        return {
          success: false,
          data: null as any,
          error: "User is not associated with a company",
        };
      }

      const label = await prisma.statusLabel.findFirst({
        where: {
          id: id,
          companyId: user.user_metadata.companyId,
        },
      });
      if (!label) {
        return {
          success: false,
          data: null as any,
          error: "Status label not found",
        };
      }
      return { success: true, data: parseStringify(label) };
    } catch (error) {
      console.error("Find status label error:", error);
      return {
        success: false,
        data: null as any,
        error: "Failed to fetch status label",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function getStatusLabel(
  id: string,
): Promise<AuthResponse<StatusLabel>> {
  return findById(id);
}

export const remove = withAuth(
  async (user, id: string): Promise<AuthResponse<StatusLabel>> => {
    try {
      // Check if user has a companyId
      if (!user.user_metadata?.companyId) {
        return {
          success: false,
          data: null as any,
          error: "User is not associated with a company",
        };
      }

      const label = await prisma.statusLabel.delete({
        where: {
          id: id,
          companyId: user.user_metadata.companyId,
        },
      });

      revalidatePath("/status-labels");
      return { success: true, data: parseStringify(label) };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return {
            success: false,
            data: null as any,
            error: "Status label not found",
          };
        }
      }
      console.error("Delete status label error:", error);
      return {
        success: false,
        data: null as any,
        error: "Failed to delete status label",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function deleteStatusLabel(
  id: string,
): Promise<AuthResponse<StatusLabel>> {
  return remove(id);
}

export const update = withAuth(
  async (
    user,
    id: string,
    data: z.infer<typeof statusLabelSchema>,
  ): Promise<AuthResponse<StatusLabel>> => {
    try {
      // Check if user has a companyId
      if (!user.user_metadata?.companyId) {
        return {
          success: false,
          data: null as any,
          error: "User is not associated with a company",
        };
      }

      const label = await prisma.statusLabel.update({
        where: {
          id: id,
          companyId: user.user_metadata.companyId,
        },
        data: {
          name: data.name,
          colorCode: data.colorCode,
          isArchived: data.isArchived,
          allowLoan: data.allowLoan,
          description: data.description,
        },
      });

      revalidatePath("/status-labels");
      revalidatePath(`/status-labels/${id}`);
      return { success: true, data: parseStringify(label) };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return {
            success: false,
            data: null as any,
            error: "Status label name already exists in your company",
          };
        }
        if (error.code === "P2025") {
          return {
            success: false,
            data: null as any,
            error: "Status label not found",
          };
        }
      }
      console.error("Update status label error:", error);
      return {
        success: false,
        data: null as any,
        error: "Failed to update status label",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function updateStatusLabel(
  id: string,
  data: z.infer<typeof statusLabelSchema>,
): Promise<AuthResponse<StatusLabel>> {
  return update(id, data);
}
