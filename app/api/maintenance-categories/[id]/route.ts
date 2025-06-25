import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  updateMaintenanceCategory,
  deleteMaintenanceCategory,
  type CreateMaintenanceCategoryParams,
} from "@/lib/actions/maintenanceType.actions";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    const result = await updateMaintenanceCategory(params.id, categoryData);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating maintenance category:", error);
    return NextResponse.json(
      { error: "Failed to update maintenance category" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await deleteMaintenanceCategory(params.id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error deleting maintenance category:", error);
    return NextResponse.json(
      { error: "Failed to delete maintenance category" },
      { status: 500 },
    );
  }
}
