import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  updateMaintenanceType,
  deleteMaintenanceType,
  type CreateMaintenanceTypeParams,
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

    const result = await updateMaintenanceType(params.id, typeData);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating maintenance type:", error);
    return NextResponse.json(
      { error: "Failed to update maintenance type" },
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

    const result = await deleteMaintenanceType(params.id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error deleting maintenance type:", error);
    return NextResponse.json(
      { error: "Failed to delete maintenance type" },
      { status: 500 },
    );
  }
}
