import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAll } from "@/lib/actions/assets.actions";

export const dynamic = "force-dynamic";

const assetSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  // Add other asset fields as needed
});

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const assets = await getAll();

    return NextResponse.json({ data: assets });
  } catch (error) {
    console.error("Error fetching assets:", error);
    return NextResponse.json(
      { error: "Failed to fetch assets" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const validatedData = assetSchema.safeParse(json);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("assets")
      .insert([{ ...validatedData.data, user_id: session.user.id }])
      .select()
      .single();

    if (error) throw error;

    // Revalidate the assets list
    revalidatePath("/assets");

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error creating asset:", error);
    return NextResponse.json(
      { error: "Failed to create asset" },
      { status: 500 },
    );
  }
}
