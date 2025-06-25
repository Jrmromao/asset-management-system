import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getMaintenanceTypes,
  createMaintenanceType,
  type CreateMaintenanceTypeParams,
} from "@/lib/actions/maintenanceType.actions";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url);
    const filters: Record<string, any> = {};

    const category = searchParams.get("category");
    const isActive = searchParams.get("isActive");

    if (category) {
      filters.category = category;
    }
    if (isActive !== null) {
      filters.isActive = isActive === "true";
    }

    const result = await getMaintenanceTypes(filters);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching maintenance types:", error);
    return NextResponse.json(
      { error: "Failed to fetch maintenance types" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const typeData: CreateMaintenanceTypeParams = {
      name: body.name,
      description: body.description,
      categoryId: body.categoryId,
      priority: body.priority,
      estimatedDuration: body.estimatedDuration,
      requiredSkills: body.requiredSkills,
      defaultCost: body.defaultCost,
      isActive: body.isActive,
      color: body.color,
      icon: body.icon,
      checklist: body.checklist,
      customFields: body.customFields,
    };

    const result = await createMaintenanceType(typeData);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating maintenance type:", error);
    return NextResponse.json(
      { error: "Failed to create maintenance type" },
      { status: 500 },
    );
  }
}
