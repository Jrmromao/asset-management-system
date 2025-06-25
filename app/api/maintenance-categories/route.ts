import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getMaintenanceCategories,
  createMaintenanceCategory,
  type CreateMaintenanceCategoryParams,
} from "@/lib/actions/maintenanceType.actions";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await getMaintenanceCategories();

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching maintenance categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch maintenance categories" },
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
    const categoryData: CreateMaintenanceCategoryParams = {
      name: body.name,
      description: body.description,
      color: body.color,
      isActive: body.isActive,
    };

    const result = await createMaintenanceCategory(categoryData);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating maintenance category:", error);
    return NextResponse.json(
      { error: "Failed to create maintenance category" },
      { status: 500 },
    );
  }
}
