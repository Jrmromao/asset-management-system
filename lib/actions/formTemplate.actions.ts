"use server";

import { PrismaClient, FormTemplate } from "@prisma/client";
import { z } from "zod";
import { createTemplateSchema } from "@/lib/schemas";
import { parseStringify } from "@/lib/utils";
import { handleError } from "@/utils/utils";
import { formTemplates } from "@/helpers/DefaultFormTemplates";
import { withAuth } from "@/lib/middleware/withAuth";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createAuditLog } from "@/lib/actions/auditLog.actions";

const prisma = new PrismaClient();

type AuthResponse<T> = {
  data?: T;
  error?: string;
  success: boolean;
};

export type TCreateInput = z.infer<typeof createTemplateSchema>;

const getSession = async () => {
  const cookieStore = await cookies();
  return {
    accessToken: cookieStore.get("sb-access-token")?.value,
    refreshToken: cookieStore.get("sb-refresh-token")?.value,
  };
};

export const insert = async (
  data: TCreateInput,
): Promise<AuthResponse<FormTemplate>> => {
  const session = getSession();
  return withAuth(
    async (user, data: TCreateInput): Promise<AuthResponse<FormTemplate>> => {
      try {
        const validatedData = createTemplateSchema.parse(data);
        const result = await prisma.formTemplate.create({
          data: {
            name: validatedData.name,
            fields: validatedData.fields,
            companyId: user.user_metadata.companyId,
            categoryId: validatedData.categoryId,
          },
        });
        await createAuditLog({
          companyId: user.user_metadata.companyId,
          action: "FORM_TEMPLATE_CREATED",
          entity: "FORM_TEMPLATE",
          entityId: result.id,
          details: `Form template created: ${result.name} by user ${user.id}`,
        });
        return { success: true, data: result };
      } catch (error) {
        console.error("Error creating form template:", error);
        return { success: false, error: "Failed to create form template" };
      }
    },
  )(data);
};

export const getAll = withAuth(
  async (user): Promise<AuthResponse<FormTemplate[]>> => {
    try {
      const templates = await prisma.formTemplate.findMany({
        where: {
          companyId: user.user_metadata.companyId,
        },
        orderBy: {
          name: "asc",
        },
      });
      return { success: true, data: parseStringify(templates) };
    } catch (error) {
      console.error("Get form templates error:", error);
      return { success: false, error: "Failed to fetch form templates" };
    }
  },
);

export const getFormTemplateById = withAuth(
  async (user, id: string): Promise<AuthResponse<FormTemplate>> => {
    try {
      const template = await prisma.formTemplate.findFirst({
        where: {
          id,
          companyId: user.user_metadata?.companyId,
        },
      });
      if (!template) {
        return { success: false, error: "Form template not found" };
      }
      return { success: true, data: parseStringify(template) };
    } catch (error) {
      console.error("Get form template error:", error);
      return { success: false, error: "Failed to fetch form template" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const remove = withAuth(
  async (user, id: string): Promise<AuthResponse<FormTemplate>> => {
    try {
      const template = await prisma.formTemplate.delete({
        where: {
          id,
          companyId: user.user_metadata?.companyId,
        },
        select: { id: true, name: true },
      });
      await createAuditLog({
        companyId: user.user_metadata.companyId,
        action: "FORM_TEMPLATE_DELETED",
        entity: "FORM_TEMPLATE",
        entityId: template.id,
        details: `Form template deleted: ${template.name} by user ${user.id}`,
      });
      revalidatePath("/form-templates");
      return {
        success: true,
        data: parseStringify(template),
      };
    } catch (error) {
      console.error("Delete form template error:", error);
      return { success: false, error: "Failed to delete form template" };
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
  ): Promise<AuthResponse<FormTemplate>> => {
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
        select: { id: true, name: true },
      });
      await createAuditLog({
        companyId: user.user_metadata.companyId,
        action: "FORM_TEMPLATE_UPDATED",
        entity: "FORM_TEMPLATE",
        entityId: template.id,
        details: `Form template updated: ${template.name} by user ${user.id}`,
      });
      revalidatePath("/form-templates");
      return {
        success: true,
        data: parseStringify(template),
      };
    } catch (error) {
      console.error("Update form template error:", error);
      return { success: false, error: "Failed to update form template" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export async function bulkInsertTemplates(
  companyId: string,
  categoryId: string,
) {
  try {
    const templates = await prisma.$transaction(
      Object.entries(formTemplates).map(([name, fields]) =>
        prisma.formTemplate.create({
          data: {
            name,
            fields,
            companyId,
            categoryId
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

/**
 * Generates a CSV template string for a specific form template
 * @param templateId The ID of the form template to generate a CSV for
 * @returns CSV string with headers based on the template fields
 */
export async function generateCSVTemplateForFormTemplate(
  templateId: string,
): Promise<string> {
  try {
    // Get the form template (no include)
    const formTemplate = await prisma.formTemplate.findUnique({
      where: { id: templateId },
    });

    if (!formTemplate) {
      throw new Error(`Form template with ID ${templateId} not found`);
    }

    // Handle both string and object for fields
    let fields: any[];
    if (Array.isArray(formTemplate.fields)) {
      fields = formTemplate.fields;
    } else if (typeof formTemplate.fields === "string") {
      fields = JSON.parse(formTemplate.fields);
    } else {
      throw new Error("Invalid fields format in form template");
    }

    // Standard asset fields that should be included in every template
    const standardFields = [
      "Asset Name",
      "Asset Tag",
      "Model",
      "Status Label",
      "Department",
      "Location",
      "Supplier",
      "Purchase Date",
      "Purchase Price",
      "Notes",
    ];

    // Add custom fields from the template (just the label)
    const customFields = fields.map((field: any) => field.label);

    // Combine standard and custom fields
    const headers = [...standardFields, ...customFields];

    // Create CSV content
    const csvContent = headers.join(",");

    return csvContent;
  } catch (error) {
    console.error("Error generating CSV template:", error);
    throw new Error("Failed to generate CSV template");
  }
}
