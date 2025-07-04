import { NextRequest, NextResponse } from "next/server";
import { getAllModels, createModel } from "@/lib/actions/model.actions";
import { apiErrorResponse } from "@/lib/utils/apiError";

export async function GET(request: NextRequest) {
  try {
    const result = await getAllModels();
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 },
      );
    }
    return NextResponse.json({ success: true, models: result.data });
  } catch (error) {
    return apiErrorResponse(error, 500, "GET /api/models");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createModel(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 },
      );
    }
    return NextResponse.json({ success: true, model: result.data });
  } catch (error) {
    return apiErrorResponse(error, 500, "POST /api/models");
  }
}
