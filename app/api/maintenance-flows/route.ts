import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getMaintenanceFlows,
  createMaintenanceFlow,
  type CreateMaintenanceFlowParams,
} from "@/lib/actions/maintenanceFlow.actions";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url);
    const filters: Record<string, any> = {};

    // Extract common filter parameters
    const isActive = searchParams.get("isActive");
    const trigger = searchParams.get("trigger");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");

    if (isActive !== null) {
      filters.isActive = isActive === "true";
    }
    if (trigger) {
      filters.trigger = trigger;
    }
    if (priority) {
      filters.priority = parseInt(priority, 10);
    }
    if (search) {
      filters.search = search;
    }

    const flows = await getMaintenanceFlows(filters);
    return NextResponse.json(flows);
  } catch (error) {
    console.error("Error fetching maintenance flows:", error);
    return NextResponse.json(
      { error: "Failed to fetch maintenance flows" },
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

    // Validate required fields
    if (!body.name || !body.trigger) {
      return NextResponse.json(
        { error: "Name and trigger are required" },
        { status: 400 },
      );
    }

    const flowData: CreateMaintenanceFlowParams = {
      name: body.name,
      description: body.description,
      trigger: body.trigger,
      conditions: body.conditions || [],
      actions: body.actions || [],
      priority: body.priority || 100,
      isActive: body.isActive !== undefined ? body.isActive : true,
    };

    const newFlow = await createMaintenanceFlow(flowData);
    return NextResponse.json(newFlow, { status: 201 });
  } catch (error) {
    console.error("Error creating maintenance flow:", error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("Unauthorized")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message.includes("company not found")) {
        return NextResponse.json(
          {
            error:
              "Company association required. Please complete your profile.",
          },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to create maintenance flow" },
      { status: 500 },
    );
  }
}
