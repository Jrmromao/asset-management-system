"use server";
import { parseStringify } from "@/lib/utils";
import { prisma } from "@/app/db";
import { z } from "zod";
import { statusLabelSchema } from "@/lib/schemas";
import { withAuth } from "@/lib/middleware/withAuth";
import { cookies } from "next/headers";

type ActionResponse<T> = {
  data?: T;
  error?: string;
  success: boolean;
};

const getSession = () => {
  const cookieStore = cookies();
  return {
    accessToken: cookieStore.get('sb-access-token')?.value,
    refreshToken: cookieStore.get('sb-refresh-token')?.value
  };
};

// lib/actions/statusLabel.actions.ts
export const insert = withAuth(
  async (
    user,
    values: z.infer<typeof statusLabelSchema>,
  ): Promise<ActionResponse<StatusLabel>> => {
    try {
      const validation = await statusLabelSchema.safeParseAsync(values);
      if (!validation.success) {
        return { success: false, error: validation.error.errors[0].message };
      }
      const data = validation.data;
      const result = await prisma.statusLabel.create({
        data: {
          name: data.name,
          colorCode: data.colorCode || "#000000",
          isArchived: data.isArchived,
          allowLoan: data.allowLoan,
          description: data.description,
          companyId: user.user_metadata?.companyId,
        },
      });
      return { success: true, data: parseStringify(result) };
    } catch (error) {
      console.error("Error creating status label:", error);
      return { success: false, error: "Failed to create status label" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function createStatusLabel(values: z.infer<typeof statusLabelSchema>): Promise<ActionResponse<StatusLabel>> {
  const session = getSession();

  console.log("session", session);
  console.log("values", values);
  return insert(session, values);
}

export const getAll = withAuth(
  async (user): Promise<ActionResponse<StatusLabel[]>> => {
    try {
      const labels = await prisma.statusLabel.findMany({
        orderBy: {
          createdAt: "desc",
        },
        where: {
          companyId: user.user_metadata?.companyId,
        },
      });
      return { success: true, data: parseStringify(labels) };
    } catch (error) {
      console.error("Error in getAll:", error);
      return { success: false, error: "Failed to fetch status labels" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function getAllStatusLabels(): Promise<ActionResponse<StatusLabel[]>> {
  const session = getSession();
  return getAll(session);
}

export const findById = withAuth(
  async (user, id: string): Promise<ActionResponse<StatusLabel>> => {
    try {
      const label = await prisma.statusLabel.findFirst({
        where: {
          id: id,
          companyId: user.user_metadata?.companyId,
        },
      });
      if (!label) {
        return { success: false, error: "Status label not found" };
      }
      return { success: true, data: parseStringify(label) };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to fetch status label" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function getStatusLabel(id: string): Promise<ActionResponse<StatusLabel>> {
  const session = getSession();
  return findById(session, id);
}

export const remove = withAuth(
  async (user, id: string): Promise<ActionResponse<StatusLabel>> => {
    try {
      const label = await prisma.statusLabel.delete({
        where: {
          id: id,
          companyId: user.user_metadata?.companyId,
        },
      });
      return { success: true, data: parseStringify(label) };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to delete status label" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function deleteStatusLabel(id: string): Promise<ActionResponse<StatusLabel>> {
  const session = getSession();
  return remove(session, id);
}

export const update = withAuth(
  async (
    user,
    id: string,
    data: Partial<StatusLabel>,
  ): Promise<ActionResponse<StatusLabel>> => {
    try {
      const label = await prisma.statusLabel.update({
        where: {
          id: id,
          companyId: user.user_metadata?.companyId,
        },
        data: {
          name: data.name,
          colorCode: data.colorCode,
          isArchived: data.isArchived,
          allowLoan: data.allowLoan,
          description: data.description,
        },
      });
      return { success: true, data: parseStringify(label) };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Failed to update status label" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function updateStatusLabel(id: string, data: Partial<StatusLabel>): Promise<ActionResponse<StatusLabel>> {
  const session = getSession();
  return update(session, id, data);
}
