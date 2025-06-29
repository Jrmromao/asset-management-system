import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/db";

export async function GET(req: NextRequest) {
  try {
    // Get all form templates with their categories
    const templates = await prisma.formTemplate.findMany({
      select: {
        id: true,
        name: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Format the response
    const formattedTemplates = templates.map((template) => ({
      id: template.id,
      name: template.name,
      categoryId: template.category?.id,
      categoryName: template.category?.name,
      csvTemplateUrl: `/api/form-templates/${template.id}/csv-template`,
    }));

    return NextResponse.json({
      success: true,
      templates: formattedTemplates,
    });
  } catch (error) {
    console.error("Error fetching form templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch form templates" },
      { status: 500 },
    );
  }
}
