import { NextRequest, NextResponse } from "next/server";
import {
  generateSmartAssignmentRecommendations,
  bulkAssignAssets,
  bulkUpdateAssetStatus,
  bulkCheckinAssets,
} from "@/lib/actions/bulk-operations.actions";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { operation, data } = body;

    switch (operation) {
      case "smart_assignment_recommendations":
        const { assetIds } = data;
        if (!assetIds || !Array.isArray(assetIds)) {
          return NextResponse.json(
            { error: "assetIds array is required" },
            { status: 400 }
          );
        }

        const recommendations = await generateSmartAssignmentRecommendations(assetIds);
        return NextResponse.json(recommendations);

      case "bulk_assign":
        const { assignments } = data;
        if (!assignments || !Array.isArray(assignments)) {
          return NextResponse.json(
            { error: "assignments array is required" },
            { status: 400 }
          );
        }

        // Validate assignment structure
        for (const assignment of assignments) {
          if (!assignment.assetId || !assignment.userId) {
            return NextResponse.json(
              { error: "Each assignment must have assetId and userId" },
              { status: 400 }
            );
          }
        }

        const assignResult = await bulkAssignAssets(assignments);
        return NextResponse.json(assignResult);

      case "bulk_status_update":
        const { assetIds: statusAssetIds, statusLabelId } = data;
        if (!statusAssetIds || !Array.isArray(statusAssetIds) || !statusLabelId) {
          return NextResponse.json(
            { error: "assetIds array and statusLabelId are required" },
            { status: 400 }
          );
        }

        const statusResult = await bulkUpdateAssetStatus(statusAssetIds, statusLabelId);
        return NextResponse.json(statusResult);

      case "bulk_checkin":
        const { assetIds: checkinAssetIds } = data;
        if (!checkinAssetIds || !Array.isArray(checkinAssetIds)) {
          return NextResponse.json(
            { error: "assetIds array is required" },
            { status: 400 }
          );
        }

        const checkinResult = await bulkCheckinAssets(checkinAssetIds);
        return NextResponse.json(checkinResult);

      default:
        return NextResponse.json(
          { error: "Invalid operation" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in bulk operations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 