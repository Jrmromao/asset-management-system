"use server";

import { NextRequest, NextResponse } from "next/server";
import { 
  updateMaintenanceFlow, 
  deleteMaintenanceFlow,
  type UpdateMaintenanceFlowParams 
} from "@/lib/actions/maintenanceFlow.actions";
import { auth } from "@clerk/nextjs/server";

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
    const flowData: UpdateMaintenanceFlowParams = {
      name: body.name,
      description: body.description,
      trigger: body.trigger,
      priority: body.priority,
      conditions: body.conditions,
      actions: body.actions,
      isActive: body.isActive,
    };

    const updatedFlow = await updateMaintenanceFlow(params.id, flowData);
    return NextResponse.json(updatedFlow);
  } catch (error) {
    console.error("Error updating maintenance flow:", error);
    return NextResponse.json(
      { error: "Failed to update maintenance flow" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await deleteMaintenanceFlow(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting maintenance flow:", error);
    return NextResponse.json(
      { error: "Failed to delete maintenance flow" },
      { status: 500 }
    );
  }
} 