"use server";
import { PrismaClient } from "@prisma/client";
import { parseStringify } from "@/lib/utils";
import { auth } from "@/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

type ApiResponse<T> = {
  data?: T;
  error?: string;
};

const createTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  fields: z.array(
    z.object({
      name: z.string().min(1, "Field name is required"),
      type: z.enum(["text", "number", "date", "select", "checkbox"]),
      placeholder: z.string().optional(),
      label: z.string().optional(),
      required: z.boolean().default(false),
      options: z.array(z.string()).optional(),
    }),
  ),
});

export async function createFormTemplate(
  data: z.infer<typeof createTemplateSchema>,
): Promise<ApiResponse<{ id: string }>> {
  try {
    const session = await auth();

    if (!session?.user?.companyId) {
      return { error: "Unauthorized" };
    }

    const validatedData = createTemplateSchema.parse(data);
    console.log(validatedData);

    const template = await prisma.formTemplate.create({
      data: {
        name: validatedData.name,
        fields: validatedData.fields,
        companyId: session.user.companyId,
      },
      select: { id: true },
    });

    revalidatePath("/assets/create");
    return { data: template };
  } catch (error) {
    console.error("Error creating form template:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to create template",
    };
  }
}

export async function getFormTemplates(): Promise<
  ApiResponse<
    Array<{
      id: string;
      name: string;
      fields: any;
      createdAt: Date;
    }>
  >
> {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return { error: "Unauthorized" };
    }

    const templates = await prisma.formTemplate.findMany({
      where: {
        companyId: session.user.companyId,
      },
      select: {
        id: true,
        name: true,
        fields: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { data: templates };
  } catch (error) {
    console.error("Error fetching form templates:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to fetch templates",
    };
  }
}

export async function getFormTemplateById(id: string): Promise<
  ApiResponse<{
    id: string;
    name: string;
    fields: any;
    values: Array<{
      id: string;
      values: any;
      assetId: string;
    }>;
  }>
> {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return { error: "Unauthorized" };
    }

    const template = await prisma.formTemplate.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
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

    return { data: template };
  } catch (error) {
    console.error("Error fetching form template:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to fetch template",
    };
  }
}
