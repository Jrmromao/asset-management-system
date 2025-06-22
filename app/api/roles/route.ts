import { NextResponse } from "next/server";
import { getAll, insert } from "@/lib/actions/role.actions";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const result = await getAll();
    return NextResponse.json(result);
  } catch (error) {
    console.error("[ROLES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const result = await insert(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[ROLES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
