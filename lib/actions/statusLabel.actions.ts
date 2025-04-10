"use server";
import { parseStringify } from "@/lib/utils";
import { prisma } from "@/app/db";
import { auth } from "@/auth";
import { z } from "zod";
import { statusLabelSchema } from "@/lib/schemas";

// lib/actions/statusLabel.actions.ts
export const insert = async (
  values: z.infer<typeof statusLabelSchema>,
): Promise<ActionResponse<StatusLabel>> => {
  try {
    const validation = await statusLabelSchema.safeParseAsync(values);

    if (!validation.success) {
      return {
        error: validation.error.errors[0].message,
      };
    }

    const data = validation.data;

    const session = await auth();
    if (!session) {
      return { error: "Not authenticated" };
    }

    const result = await prisma.statusLabel.create({
      data: {
        name: data.name,
        colorCode: data.colorCode || "#000000",
        isArchived: data.isArchived,
        allowLoan: data.allowLoan,
        description: data.description,
        companyId: session?.user?.companyId,
      },
    });

    return { data: parseStringify(result) };
  } catch (error) {
    console.error("Error creating status label:", error);
    throw error;
  }
};

export const getAll = async (): Promise<ActionResponse<StatusLabel[]>> => {
  try {
    const session = await auth();
    if (!session) {
      console.log("No session found");
    }

    const labels = await prisma.statusLabel.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        companyId: session?.user?.companyId,
      },
    });

    return { data: parseStringify(labels) };
  } catch (error) {
    console.error("Error in getAll:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export const findById = async (id: string) => {
  try {
    const labels = await prisma.statusLabel.findFirst({
      where: {
        id: id,
      },
    });
    return parseStringify(labels);
  } catch (error) {
    console.log(error);
  } finally {
    await prisma.$disconnect();
  }
};

export const remove = async (id: string) => {
  try {
    const labels = await prisma.statusLabel.delete({
      where: {
        id: id,
      },
    });
    return parseStringify(labels);
  } catch (error) {
    console.log(error);
  }
};

export const update = async (id: string, data: Partial<StatusLabel>) => {
  try {
    const labels = await prisma.statusLabel.update({
      where: {
        id: id,
      },
      data: {
        name: data.name,
        colorCode: data.colorCode,
        isArchived: data.isArchived,
        allowLoan: data.allowLoan,
        description: data.description,
      },
    });
    return parseStringify(labels);
  } catch (error) {
    console.log(error);
  }
};
