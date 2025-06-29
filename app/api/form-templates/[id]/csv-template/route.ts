import { NextRequest, NextResponse } from "next/server";
import { generateCSVTemplateForFormTemplate } from "@/lib/actions/formTemplate.actions";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const templateId = params.id;

    if (!templateId) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 },
      );
    }

    // Generate CSV content
    const csvContent = await generateCSVTemplateForFormTemplate(templateId);

    // Set headers for file download
    const headers = new Headers();
    headers.set("Content-Type", "text/csv");
    headers.set(
      "Content-Disposition",
      `attachment; filename="asset-template-${templateId}.csv"`,
    );

    return new NextResponse(csvContent, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error generating CSV template:", error);
    return NextResponse.json(
      { error: "Failed to generate CSV template" },
      { status: 500 },
    );
  }
}
