import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getAll, insert, remove, update } from "@/lib/actions/role.actions";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const result = await getAll({
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[ROLES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const result = await insert(
      {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
      },
      body,
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("[ROLES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
