import { NextRequest } from "next/server";
import { prisma } from "@/app/db";

const SUPABASE_WEBHOOK_SECRET = process.env.SUPABASE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  // Optional: Validate webhook secret
  const secret = req.headers.get("x-supabase-webhook-secret");
  if (SUPABASE_WEBHOOK_SECRET && secret !== SUPABASE_WEBHOOK_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  // Supabase sends the user record in payload.record
  const user = payload?.record;
  if (!user?.id || !user?.email) {
    return new Response("Missing user data", { status: 400 });
  }

  try {
    // Fetch the first company (or use your own logic for default company)
    const company = await prisma.company.findFirst();
    if (!company) {
      return new Response("No company found", { status: 500 });
    }
    // Fetch the 'USER' role (or use your own logic for default role)
    const role = await prisma.role.findFirst({ where: { name: "USER" } });
    if (!role) {
      return new Response("No default role found", { status: 500 });
    }

    // Create user in your DB if not exists
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        email: user.email,
        firstName: user.user_metadata?.firstName || "",
        lastName: user.user_metadata?.lastName || "",
        name: user.user_metadata?.name || user.email,
        companyId: company.id,
        roleId: role.id,
        // Add other required fields as needed
        // Optionally sync more metadata fields here
      },
    });
    return new Response("User synced", { status: 200 });
  } catch (error) {
    console.error("Failed to sync user:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
