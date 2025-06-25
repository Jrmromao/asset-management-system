import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Maintenance flows API is working",
    timestamp: new Date().toISOString(),
    routes: {
      "GET /api/maintenance-flows": "List all maintenance flows",
      "POST /api/maintenance-flows": "Create a new maintenance flow",
      "PUT /api/maintenance-flows/[id]": "Update a maintenance flow",
      "DELETE /api/maintenance-flows/[id]": "Delete a maintenance flow",
      "GET /api/maintenance-flows/stats": "Get maintenance flow statistics",
    },
  });
}
