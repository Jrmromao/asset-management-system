import { NextResponse } from "next/server";
import { createAsset } from "@/lib/actions/assets.actions";
import { withAuth } from "@/lib/middleware/withAuth";

// Placeholder for the new JSON import function
async function processAssetJSON(user: any, data: any[]) {
  const results = [];
  let successCount = 0;
  let errorCount = 0;
  for (const [i, asset] of data.entries()) {
    try {
      const result = await createAsset(asset);
      if (result.success) {
        results.push({ index: i, success: true, asset: result.data?.[0] });
        successCount++;
      } else {
        results.push({ index: i, success: false, error: result.error });
        errorCount++;
      }
    } catch (err: any) {
      results.push({
        index: i,
        success: false,
        error: err.message || "Unknown error",
      });
      errorCount++;
    }
  }
  return {
    success: errorCount === 0,
    message:
      errorCount === 0
        ? `Imported ${successCount} assets successfully.`
        : `Imported ${successCount} assets, ${errorCount} failed.`,
    results,
  };
}

export async function POST(request: Request) {
  const handler = withAuth(async (user) => {
    const { data } = await request.json();
    if (!data || !Array.isArray(data) || data.length === 0) {
      return {
        success: false,
        error: "No asset data provided",
      };
    }
    const response = await processAssetJSON(user, data);
    if (!response.success) {
      return {
        success: false,
        error: response.message,
        results: response.results,
      };
    }
    return {
      success: true,
      message: response.message,
      results: response.results,
    };
    });

  const result = await handler();
  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        error: result.error,
        results: (result as any).results,
      },
      { status: 400 },
    );
  }
  return NextResponse.json({
    success: true,
    message: result.message,
    results: (result as any).results,
  });
}
