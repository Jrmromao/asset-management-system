import { NextRequest, NextResponse } from "next/server";
import { getAllAccessories } from "@/lib/actions/accessory.actions";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await getAllAccessories();

    if (!result.success || !result.data || result.data.length === 0) {
      return NextResponse.json({ error: "No accessories found" }, { status: 404 });
    }

    // Create CSV headers
    const headers = [
      "ID",
      "Name",
      "Description",
      "Quantity",
      "Min Quantity",
      "Unit Cost",
      "Total Value",
      "Status",
      "Supplier",
      "Inventory",
      "Created At",
      "Updated At",
    ];

    // Convert accessories to CSV rows
    const csvRows = result.data.map((accessory: any) => [
      accessory.id || "",
      accessory.name || "",
      accessory.description || "",
      accessory.quantity || "0",
      accessory.minQuantity || "0",
      accessory.unitCost || "0",
      accessory.totalValue || "0",
      accessory.statusLabel?.name || "",
      accessory.supplier?.name || "",
      accessory.inventory?.name || "",
      accessory.createdAt ? new Date(accessory.createdAt).toLocaleDateString() : "",
      accessory.updatedAt ? new Date(accessory.updatedAt).toLocaleDateString() : "",
    ]);

    // Combine headers and rows
    const csvContent = [headers, ...csvRows]
      .map((row) => row.map((field: any) => `"${field}"`).join(","))
      .join("\n");

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="accessories-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting accessories:", error);
    return NextResponse.json(
      { error: "Failed to export accessories" },
      { status: 500 }
    );
  }
} 