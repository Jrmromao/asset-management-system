"use server";

import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { createTemplateSchema } from "@/lib/schemas";
import { FormTemplate } from "@/types/form";
import { parseStringify } from "@/lib/utils";
import { handleError } from "@/utils/utils";
import { formTemplates } from "@/helpers/DefaultFormTemplates";
import { withAuth } from "@/lib/middleware/withAuth";

const prisma = new PrismaClient();

export const insert = withAuth(
  async (
    user,
    data: z.infer<typeof createTemplateSchema>,
  ): Promise<ActionResponse<FormTemplate>> => {
    try {
      const validatedData = createTemplateSchema.parse(data);
      const template = await prisma.formTemplate.create({
        data: {
          name: validatedData.name,
          fields: validatedData.fields,
          companyId: user.user_metadata?.companyId,
        },
        select: { id: true },
      });

      return {
        success: true,
        data: parseStringify(template),
      };
    } catch (error) {
      return handleError(error, "Failed to create template");
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const getAll = withAuth(
  async (user): Promise<ActionResponse<FormTemplate[]>> => {
    try {
      const templates = await prisma.formTemplate.findMany({
        where: { companyId: user.user_metadata?.companyId },
        select: {
          id: true,
          name: true,
          fields: true,
          createdAt: true,
          active: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return {
        success: true,
        data: parseStringify(templates),
      };
    } catch (error) {
      return handleError(error, "Failed to fetch templates");
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const findById = withAuth(
  async (user, id: string): Promise<ActionResponse<FormTemplate>> => {
    try {
      const template = await prisma.formTemplate.findFirst({
        where: {
          id,
          companyId: user.user_metadata?.companyId,
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

      return {
        success: true,
        data: parseStringify(template),
      };
    } catch (error) {
      return handleError(error, "Failed to fetch template");
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const remove = withAuth(
  async (user, id: string): Promise<ActionResponse<FormTemplate>> => {
    try {
      const template = await prisma.formTemplate.deleteMany({
        where: {
          id,
          companyId: user.user_metadata?.companyId,
        },
      });

      return {
        success: true,
        data: parseStringify(template),
      };
    } catch (error) {
      return handleError(error, "Failed to delete template");
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const update = withAuth(
  async (
    user,
    id: string,
    data: Partial<FormTemplate>,
  ): Promise<ActionResponse<FormTemplate>> => {
    try {
      const validatedData = createTemplateSchema.parse(data);
      const template = await prisma.formTemplate.update({
        where: {
          id,
          companyId: user.user_metadata?.companyId,
        },
        data: {
          name: validatedData.name,
          fields: validatedData.fields,
        },
        select: { id: true },
      });

      return {
        success: true,
        data: parseStringify(template),
        redirectUrl: "/form-templates",
      };
    } catch (error) {
      return handleError(error, "Failed to update template");
    } finally {
      await prisma.$disconnect();
    }
  },
);

export async function bulkInsertTemplates(companyId: string) {
  try {
    const templates = await prisma.$transaction(
      Object.entries(formTemplates).map(([name, fields]) =>
        prisma.formTemplate.create({
          data: {
            name,
            fields,
            companyId,
          },
        }),
      ),
    );
    return {
      success: true,
      data: parseStringify(templates),
    };
  } catch (error) {
    return handleError(error, "Failed to bulk insert templates");
  } finally {
    await prisma.$disconnect();
  }
}
