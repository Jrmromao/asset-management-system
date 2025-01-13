"use server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createTemplateSchema } from "@/lib/schemas";
import { FormTemplate } from "@/types/form";
import { parseStringify } from "@/lib/utils";
import { checkAuth, handleError } from "@/utils/utils";

const prisma = new PrismaClient();

export async function insert(
  data: z.infer<typeof createTemplateSchema>,
): Promise<ActionResponse<FormTemplate>> {
  try {
    const { error, companyId } = await checkAuth();
    if (error) return { error };

    if (!companyId) {
      return { error: "Unauthorized" };
    }

    const validatedData = createTemplateSchema.parse(data);
    const template = await prisma.formTemplate.create({
      data: {
        name: validatedData.name,
        fields: validatedData.fields,
        companyId,
      },
      select: { id: true },
    });

    revalidatePath("/assets/create");
    return { data: parseStringify(template) };
  } catch (error) {
    return handleError(error, "Failed to create template");
  }
}

export async function getAll(): Promise<ActionResponse<FormTemplate[]>> {
  try {
    const { error, companyId } = await checkAuth();
    if (error) return { error };

    if (!companyId) {
      return { error: "Unauthorized" };
    }
    const templates = await prisma.formTemplate.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        fields: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    console.log("templates: ", templates);
    return { data: parseStringify(templates) };
  } catch (error) {
    return handleError(error, "Failed to fetch templates");
  }
}

export async function findById(
  id: string,
): Promise<ActionResponse<FormTemplate>> {
  try {
    const { error, companyId } = await checkAuth();
    if (error) return { error };

    if (!companyId) {
      return { error: "Unauthorized" };
    }
    const template = await prisma.formTemplate.findFirst({
      where: { id, companyId },
      select: {
        id: true,
        name: true,
        fields: true,
        values: {
          select: {
            id: true,
            values: true,
            assetId: true,
          },
        },
      },
    });

    if (!template) {
      return { error: "Template not found" };
    }

    return { data: parseStringify(template) };
  } catch (error) {
    return handleError(error, "Failed to fetch template");
  }
}

export async function remove(
  id: string,
): Promise<ActionResponse<FormTemplate>> {
  try {
    const { error, companyId } = await checkAuth();
    if (error) return { error };

    if (!companyId) {
      return { error: "Unauthorized" };
    }
    const template = await prisma.formTemplate.deleteMany({
      where: { id, companyId },
    });

    return { data: parseStringify(template) };
  } catch (error) {
    return handleError(error, "Failed to delete template");
  }
}

export async function update(
  id: string,
  data: z.infer<typeof createTemplateSchema>,
): Promise<ActionResponse<FormTemplate>> {
  try {
    const { error, companyId } = await checkAuth();
    if (error) return { error };

    if (!companyId) {
      return { error: "Unauthorized" };
    }
    const validatedData = createTemplateSchema.parse(data);
    const template = await prisma.formTemplate.update({
      where: { id, companyId },
      data: {
        name: validatedData.name,
        fields: validatedData.fields,
      },
      select: { id: true },
    });

    return { data: parseStringify(template) };
  } catch (error) {
    return handleError(error, "Failed to update template");
  }
}
