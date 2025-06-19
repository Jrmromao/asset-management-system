import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAllAssets, createAsset } from "@/lib/actions/assets.actions";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const options = {
      orderBy: searchParams.get('orderBy') as "name" | "createdAt" | undefined,
      order: searchParams.get('order') as "asc" | "desc" | undefined,
      search: searchParams.get('search') || undefined
    };

    const result = await getAllAssets();
    return NextResponse.json(result);
  } catch (error) {
    console.error("[ASSETS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createAsset(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[ASSETS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 