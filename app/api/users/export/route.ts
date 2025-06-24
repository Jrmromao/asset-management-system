import { NextRequest, NextResponse } from "next/server";
import { getAllUsersWithService } from "@/lib/actions/user.actions";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const result = await getAllUsersWithService();
    
    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch users" },
        { status: 500 }
      );
    }

    const users = result.data;

    // Create CSV headers
    const headers = [
      "ID",
      "Name",
      "Email", 
      "First Name",
      "Last Name",
      "Title",
      "Employee ID",
      "Role",
      "Status",
      "Created At",
      "Updated At"
    ];

    // Convert users to CSV rows
    const csvRows = users.map((user: any) => [
      user.id,
      user.name || "",
      user.email,
      user.firstName || "",
      user.lastName || "",
      user.title || "",
      user.employeeId || "",
      user.role?.name || "",
      user.status || "ACTIVE",
      new Date(user.createdAt).toISOString().split('T')[0],
      new Date(user.updatedAt).toISOString().split('T')[0]
    ]);

    // Combine headers and rows
    const csvContent = [headers, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(","))
      .join("\n");

    // Return CSV as downloadable file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="users-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting users:", error);
    return NextResponse.json(
      { error: "Failed to export users" },
      { status: 500 }
    );
  }
} 